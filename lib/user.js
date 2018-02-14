'use strict';

var isRoot = require('is-root');
var util = require('util');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var cache = require("lru-cache")();

if(process.platform !== 'linux') {
  throw new Error('linux-user must be running on Linux');
}

if(!isRoot()) {
  throw new Error('linux-user must be running as root user');
}

var validUsernameRegex = /^([a-z_][a-z0-9_]{0,30})$/;

function validate (username) {
  return validUsernameRegex.test(username);
}

exports.validateUsername = validate;

exports.addUser = function (username, callback) {
  username = String(username);
  if(!validate(username)) {
    return callback(new Error('Invalid username'));
  }

  cache.del('users');
  exec(util.format('useradd -m %s', username), function (err, stdout, stderr) {
    if(err) {
      return callback(err);
    }
    exports.getUserInfo(username, callback);
  });
};

exports.removeUser = function (username, callback) {
  username = String(username);
  if(!validate(username)) {
    return callback(new Error('Invalid username'));
  }

  cache.del('users');
  exec(util.format('userdel -rf %s', username), callback);
};

exports.getUserGroups = function (username, callback) {
  username = String(username);
  if(!validate(username)) {
    return callback(new Error('Invalid username'));
  }

  exec(util.format('groups %s', username), function (err, stdout, stderr) {
    if(err || stderr) {
      return callback(err || stderr);
    }

      let groups = stdout.replace('\n', '').replace(/.+:\s/i, '').split(' ');
      return callback(null, groups);

  });
};

exports.getUsers = function (callback) {
  if(cache.has('users')) {
    return callback(null, cache.get('users'));
  }
  fs.readFile('/etc/passwd', function (err, content) {
    if(err) {
      return callback(err);
    }
    var _users = content.toString().split('\n');
    _users.pop();
    _users = _users.map(function (line) {
      var _cols = line.split(':');
      return {
        username: _cols[0],
        password: _cols[1],
        uid: Number(_cols[2]),
        gid: Number(_cols[3]),
        fullname: _cols[4] && _cols[4].split(',')[0],
        homedir: _cols[5],
        shell: _cols[6]
      };
    });
    cache.set('users', _users);
    callback(null, _users);
  });
};

exports.getUserInfo = function (username, callback) {
  exports.getUsers(function (err, users) {
    if(err) {
      return callback(err);
    }
    for(var i = 0; i < users.length; i++) {
      if(users[i].username === username) {
        return callback(null, users[i]);
      }
    }
    callback(null, null);
  });
};

exports.setPassword = function (username, password, callback) {
  username = String(username);
  password = String(password);
  if(!username || !password) {
    return callback(new Error('Invalid arguments'));
  }
  if(!validate(username)) {
    return callback(new Error('Invalid username'));
  }

  var _p = spawn('passwd', [username]);
  _p.stdin.end(password);
  _p.on('error', callback);
  _p.on('exit', function () {
    callback();
  });
};

exports.addGroup = function (groupname, callback) {
  groupname = String(groupname);
  if(!validate(groupname)) {
    return callback(new Error('Invalid groupname'));
  }

  cache.del('groups');
  exec(util.format('groupadd %s', groupname), function (err, stdout, stderr) {
    if(err) {
      return callback(err);
    }
    exports.getGroupInfo(groupname, callback);
  });
};

exports.removeGroup = function (groupname, callback) {
  groupname = String(groupname);
  if(!validate(groupname)) {
    return callback(new Error('Invalid groupname'));
  }

  cache.del('groups');
  exec(util.format('groupdel %s', groupname), callback);
};

exports.getGroups = function (callback) {
  if(cache.has('groups')) {
    return callback(null, cache.get('groups'));
  }
  fs.readFile('/etc/group', function (err, content) {
    if(err) {
      return callback(err);
    }
    var _groups = content.toString().split('\n');
    _groups.pop();
    _groups = _groups.map(function (line) {
      var _cols = line.split(':');
      return {
        groupname: _cols[0],
        password: _cols[1],
        gid: Number(_cols[2]),
        members: _cols[3] ? _cols[3].split(',') : []
      };
    });
    cache.set('groups', _groups);
    callback(null, _groups);
  });
};

exports.getGroupInfo = function (groupname, callback) {
  exports.getGroups(function (err, groups) {
    if(err) {
      return callback(err);
    }
    for(var i = 0; i < groups.length; i++) {
      if(groups[i].groupname === groupname) {
        return callback(null, groups[i]);
      }
    }
    callback(null, null);
  });
};

exports.addUserToGroup = function (username, groupname, callback) {
  username = String(username);
  groupname = String(groupname);
  if(!validate(username) || !validate(groupname)) {
    return callback(new Error('Invalid arguments'));
  }

  cache.del('users');
  cache.del('groups');
  exec(util.format('usermod -a -G %s %s', groupname, username), callback);
};

exports.verifySSHKey = function (key, callback) {
  key = String(key);

  exec(util.format('ssh-keygen -lf /dev/stdin <<< "%s"', key), {shell: '/bin/bash'}, function (err, stdout, stderr) {
    if(err || stderr) {
      return callback(err || stderr);
    }
      return callback(null, stdout);
  });
};


exports.addSSHtoUser = function (user, key, callback){
  console.log('==user ', user)
  exports.verifySSHKey(key, function(error, info){
    if(error){
      return callback(error);
    }
    exports.getUserInfo(user, function(error, info){
      if(error){
        return callback('User does not exist');
      }

      let commands =`
        mkdir /home/${user}/.ssh;
        touch /home/${user}/.ssh/authorized_keys;
        chown 700 /home/${user}/.ssh;
        chmod 600 /home/${user}/.ssh/authorized_keys;
        chown ${user}:${user} /home/${user}/.ssh -R;

        echo "${key}" >> /home/${user}/.ssh/authorized_keys;
      `;

      exec(commands, function(err, stdout, stderr){
        if(err || stderr){
          return callback(err || stderr);
        }
        console.log('out', stdout);
        return callback(null, true);
      });

    });
  });
};

