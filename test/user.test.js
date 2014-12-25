'use strict';

var linuxUser = require('../');

describe('user.js', function () {
  describe('getUsers', function () {
    it('should get users ok', function (done) {
      linuxUser.getUsers(function (err, users) {
        if(err) {
          return done(err);
        }
        users.should.be.an.Array;
      });
    });
  });
});