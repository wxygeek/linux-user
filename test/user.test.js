'use strict';

var linuxUser = require('../');

var testUsername = 'linuxusertest';
var testPassword = 'linuxPasswordTest';
var testGroupname = 'linuxgrouptest';

describe('user.js', function () {
  describe('validateUsername', function () {
    it('should validate username ok', function () {
      linuxUser.validateUsername('/$#%&^%$~!|}|23').should.be.false;
    });
  });


  describe('getUsers', function () {
    it('should get users ok', function (done) {
      linuxUser.getUsers(function (err, users) {
        if(err) {
          return done(err);
        }
        users.should.be.an.Array;
        users[0].username.should.equal('root');
        done();
      });
    });
  });

  describe('Invalid username', function () {
    it('should throw Error', function (done) {
      linuxUser.addUser('/$#%&^%$~!|}|23', function (err, user) {
        err.should.be.an.Error;
        err.message.should.equal('Invalid username');
        done();
      });
    });
  });

  describe('getUserInfo', function () {
    it('should get user info ok', function (done) {
      linuxUser.getUserInfo('root', function (err, user) {
        if(err) {
          return done(err);
        }
        user.username.should.equal('root');
        done();
      });
    });
  });

  describe('addUser && removeUser', function () {
    it('should add user and remove user ok', function (done) {
      var num;
      linuxUser.getUsers(function (err, users) {
        if(err) {
          return done(err);
        }
        num = users.length;
        linuxUser.addUser(testUsername, function (err, user) {
          if(err) {
            return done(err);
          }
          user.username.should.equal(testUsername);
          linuxUser.getUsers(function (err, users) {
            if(err) {
              return done(err);
            }
            users.length.should.equal(num + 1);
            linuxUser.removeUser(testUsername, function (err) {
              if(err) {
                return done(err);
              }
              linuxUser.getUsers(function (err, users) {
                if(err) {
                  return done(err);
                }
                users.length.should.equal(num);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('getGroups', function () {
    it('should get groups ok', function (done) {
      linuxUser.getGroups(function (err, groups) {
        if(err) {
          return done(err);
        }
        groups.should.be.an.Array;
        groups[0].groupname.should.equal('root');
        done();
      });
    });
  });

  describe('addGroup && removeGroup', function () {
    it('should add group and remove group ok', function (done) {
      var num;
      linuxUser.getGroups(function (err, groups) {
        if(err) {
          return done(err);
        }
        num = groups.length;
        linuxUser.addGroup(testGroupname, function (err, group) {
          if(err) {
            return done(err);
          }
          group.groupname.should.equal(testGroupname);
          linuxUser.getGroups(function (err, groups) {
            if(err) {
              return done(err);
            }
            groups.length.should.equal(num + 1);
            linuxUser.removeGroup(testGroupname, function (err) {
              if(err) {
                return done(err);
              }
              linuxUser.getGroups(function (err, groups) {
                if(err) {
                  return done(err);
                }
                groups.length.should.equal(num);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('Other methods', function () {
    beforeEach(function (done) {
      linuxUser.addUser(testUsername, function (err) {
        linuxUser.addGroup(testGroupname, done);
      });
    });
    afterEach(function (done) {
      linuxUser.removeUser(testUsername, function (err) {
        linuxUser.removeGroup(testGroupname, done);
      });
    });

    it('should set password ok', function (done) {
      linuxUser.setPassword(testUsername, testPassword, done);
    });

    it('should add user to group', function (done) {
      linuxUser.addUserToGroup(testUsername, testGroupname, done);
    });
  });
  
});