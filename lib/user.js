'use strict';

var util = require('util');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');

var validUsernameRegex = /^([a-z_][a-z0-9_-]{0,30})$/;

function validate (username) {
     return validUsernameRegex.test(username);
}


var user_arg_map = {
  shell: function(SHELL){
    if(SHELL === null){
      SHELL = '/usr/sbin/nologin';
    }
    if(SHELL){
      return util.format('--shell "%s"', SHELL);
    }
  },
  create_home: function(isSet){
    if(isSet === true){
      return '--create-home';
    }

    if(isSet === false){
      return '--no-create-home';
    }
  },
  home_dir: function(path){
    if(path){
      return util.format('--home-dir "%s"', path);
    }
  },
  expiredate: function(date){
    if(date){
      return util.format('--expiredate %s', date);
    }
  },
  skel: function(path){
    if(path){
      return util.format('--skel "%s"', path);
    }
  },
  system: function(isSet){
    if(isSet){
      return '--system';
    }
  },
  selinux_user: function(SEUSER){
    if(SEUSER){
      return util.format('--selinux-user "%s"', SEUSER);
    }
  },
  username: function(){
    // do nothing here
  }
};

function build_user_command(args){
  var keys = Object.keys(args);
  var out = '';
  for(var index = 0; index < keys.length; index++ ){
    var command_out = user_arg_map[keys[index]](args[keys[index]]);
    if(command_out){
      out += command_out + ' ';
    }
  }

  return out
};

exports.addUser = function (args, callback) {

  // if a string is passes, assume its just a user name
  if(typeof args === 'string'){
    args = {
      username: args,
      create_home: true
    }
  }

  if(!validate(args.username)) {
    return callback(new Error('Invalid username'));
  }

  var args_string = build_user_command(args);

  exec(util.format('useradd %s %s',args_string, args.username), function (err, stdout, stderr) {
    if(err) {
      return callback(err);
    }
    exports.getUserInfo(args.username, callback);
  });
};

exports.removeUser = function (username, callback) {
  username = String(username);
  if(!validate(username)) {
    return callback(new Error('Invalid username'));
  }

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

  exec(util.format('groupdel %s', groupname), callback);
};

exports.getGroups = function (callback) {
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
  exports.verifySSHKey(key, function(error, info){
    if(error){
      return callback('Bad SSH key');
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
          return callback([err, stderr]);
        }
        return callback(null, true);
      });

    });
  });
};


exports.validateUsername = validate;
