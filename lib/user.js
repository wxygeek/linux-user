'use strict';

var isRoot = require('is-root');
var util = require('util');
var execFile = require('child_process').execFile;
var fs = require('fs');

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

exports.addUser = function (username, callback) {
  username = String(username);
  if(!validate(username)) {
    return callback(new Error('Invalid Username'));
  }

  execFile(util.format('useradd -m %s', username), callback);
};

exports.removeUser = function (username, callback) {
  username = String(username);
  if(!validate(username)) {
    return callback(new Error('Invalid username'));
  }

  execFile(util.format('userdel -rf %s', username), callback);
};

exports.getUsers = function (callback) {
  fs.readFile('/etc/passwd', function (err, content) {
    if(err) {
      return callback(err);
    }
    var _users = content.toString().split('\n').map(function (line) {
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

exports.setPassword = function (username, password, callback) {
  username = String(username);
  password = String(password);
  if(!username || !password) {
    return callback(new Error('Invalid Arguments'));
  }
  if(!validate(username)) {
    return callback(new Error('Invalid Username'));
  }

  execFile(util.format('echo "%s" | passwd --stdin %s', password, username), callback);
};

exports.addGroup = function (groupname, callback) {
  groupname = String(groupname);
  if(!validate(groupname)) {
    return callback(new Error('Invalid groupname'));
  }

  execFile(util.format('groupadd %s', groupname), callback);
};

exports.removeGroup = function (groupname, callback) {
  groupname = String(groupname);
  if(!validate(groupname)) {
    return callback(new Error('Invalid groupname'));
  }

  execFile(util.format('groupdel %s', groupname), callback);
};

exports.getGroups = function (callback) {
  fs.readFile('/etc/group', function (err, content) {
    if(err) {
      return callback(err);
    }
    var _groups = content.toString().split('\n').map(function (line) {
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