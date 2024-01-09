"use strict";

require("should");

var linuxUser = require("../");
var fs = require("fs");

var testUsername = "linuxusertest1";
var testPassword = "linuxPasswordTest";
var testGroupname = "linuxgrouptest";
var testSSHKeyGood =
  "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDBqDmHHhV9HHCY0Rvp6by4N1aBsnjreWKIPaO2UHCURzJk8Sa92jXEfNXpQ1H36yJmirCB+q6XRCKq27ah5M86fCKsm+UfbPlD/X81YH+RnnYgGyh7nwk+llvLKdrzFnF7aHG5/WShj5YUzZO9McIPxyrU1GmMnxEynHp4qSsnmKNJZT2KtpGlP/cvOktNjRWO1hAY8mXG9VShSpqLYWU/AbTV4hZZ2Pr/FdRZq59oRcm9ZGfd13ZMJcPlfhTCeslJfWNx2cuMTSLXRN76MtCmWsPKuVNY6Hj/ILL7JQe8DIxu9AAMiUqFadfFHRGO9dzCh8fKi5lpSMsDKqHHysb504p2ogHDzOUpc/remX3exnvDK1245JXYlNtUkXIexVl+u871PDNbOhx4lSa1nGJGiJCJLW7FlL5mEPrvlgeWaxGihi66redtcPWGVuy2dYytYoI8JanpGlEGFkTOIaKSvDH0ratOxRSlP/Eraxs7w3uVaRvF7/iC348CI63l7T8= william@william-HP-ENVY-x360-Convertible";
var testSSHkeyBad =
  "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDBqDmHHhV9HHCY0Rvp6by4N1aBsnjreWKIPaO2UHCURzJk8Sa92jXEfNXpQ1H36yJmirCB+q6XRCKq27ah5M86fCKsm+UfbPlD/X81YH+RnnYgGyh7nwk+llvLKdrzFnF7aHG5/WShj5YUzZO9McIPxyrU1GmMnxEynHp4qSsnmKNJZT2KtpGlP/cvOktNjRWO1hAY8mXG9VShSpqLYWU/AbTV4hZZ2Pr/FdRZq59oRcm9ZGfd13ZMJcPlfhTCeslJfWNx2cuMTSLXRN76MtCmWsPKuVNY6Hj/ILL7JQe8DIxu9AAMiUqFadfFHRGO9dzCh8fKi5lpSMsDKqHHysb504p2ogHDzOUpc/remX3exnvDK1245JXYlNtUkXIexVl+u871PDNbOhx4lSa1nGJGiJCJLW7FlL5mEPrvlgeWaxGihi66redtcPWGVuy2ytYoI8JanpGlEGFkTOKSvDH0ratOxRSlP/axs7w3uVaRvF7/iC348CI63l7T8= william@william-HP-ENVY-x360-Convertible";

describe("user.js", function () {
  describe("validateUsername", function () {
    it("should validate username ok", function () {
      linuxUser.validateUsername("/$#%&^%$~!|}|23").should.be.false;
    });
  });

  describe("getUsers", function () {
    it("should get users ok", function (done) {
      linuxUser.getUsers(function (err, users) {
        if (err) {
          return done(err);
        }
        users.should.be.an.Array;
        users[0].username.should.equal("root");
        done();
      });
    });
  });

  describe("Invalid username", function () {
    it("should throw Error", function (done) {
      linuxUser.addUser({ username: "/$#%&^%$~!|}|23" }, function (err, user) {
        err.should.be.an.Error;
        err.message.should.equal("Invalid username");
        done();
      });
    });
  });

  describe("getUserInfo", function () {
    it("should get user info ok", function (done) {
      linuxUser.getUserInfo("root", function (err, user) {
        if (err) {
          return done(err);
        }
        user.username.should.equal("root");
        done();
      });
    });
  });

  describe("addUser && removeUser", function () {
    it("should add user and remove user ok", function (done) {
      var num;
      linuxUser.getUsers(function (err, users) {
        if (err) {
          return done(err);
        }
        num = users.length;
        linuxUser.addUser({ username: testUsername }, function (err, user) {
          if (err) {
            return done(err);
          }
          user.username.should.equal(testUsername);
          linuxUser.getUsers(function (err, users) {
            if (err) {
              return done(err);
            }
            users.length.should.equal(num + 1);
            linuxUser.removeUser(testUsername, function (err) {
              if (err) {
                return done(err);
              }
              linuxUser.getUsers(function (err, users) {
                if (err) {
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

  describe("Expiration", function () {
    before(function (done) {
      linuxUser.addUser({ username: testUsername }, done);
    });

    after(function (done) {
      linuxUser.removeUser(testUsername, done);
    });

    it("Set user expiration maxDays", function (done) {
      linuxUser.setExpiration(
        testUsername,
        { maxDays: 50 },
        function (err, data) {
          if (err) return done(err);

          linuxUser.getExpiration(testUsername, function (err, data) {
            if (err) {
              return done(err);
            }

            data.maxDays.should.equal(50);
            done();
          });
        }
      );
    });

    it("Set user expiration date via string", function (done) {
      let date = "2012-04-04";
      linuxUser.setExpiration(
        testUsername,
        { expiredate: date },
        function (err, data) {
          if (err) return done(err);

          linuxUser.getExpiration(testUsername, function (err, data) {
            if (err) {
              return done(err);
            }

            data.accountExpires.toISOString().slice(0, 10).should.equal(date);
            done();
          });
        }
      );
    });

    it("Set user expiration date via date object", function (done) {
      let date = new Date();
      linuxUser.setExpiration(
        testUsername,
        { expiredate: date },
        function (err, data) {
          if (err) return done(err);

          linuxUser.getExpiration(testUsername, function (err, data) {
            if (err) {
              return done(err);
            }

            data.accountExpires
              .toISOString()
              .slice(0, 10)
              .should.equal(date.toISOString().slice(0, 10));
            done();
          });
        }
      );
    });
  });

  describe("addUser options", function () {
    afterEach(function (done) {
      linuxUser.removeUser(testUsername, function (err) {
        if (err) {
          done(err);
        }
        done();
      });
    });

    it("should set the login shell", function (done) {
      linuxUser.addUser(
        { username: testUsername, shell: "/bin/bash" },
        function (err, user) {
          if (err) {
            done(err);
          }
          user.shell.should.equal("/bin/bash");
          done();
        }
      );
    });
  });

  describe("getGroups", function () {
    it("should get groups ok", function (done) {
      linuxUser.getGroups(function (err, groups) {
        if (err) {
          return done(err);
        }
        groups.should.be.an.Array;
        groups[0].groupname.should.equal("root");
        done();
      });
    });
  });

  describe("getUserGroups", function () {
    it("should get user groups ok", function (done) {
      linuxUser.getUserGroups("root", function (err, groups) {
        if (err) {
          return done(err);
        }
        groups.should.be.an.Array;
        groups[0].should.equal("root");
        done();
      });
    });
  });

  describe("addGroup && removeGroup", function () {
    it("should add group and remove group ok", function (done) {
      var num;
      linuxUser.getGroups(function (err, groups) {
        if (err) {
          return done(err);
        }
        num = groups.length;
        linuxUser.addGroup(testGroupname, function (err, group) {
          if (err) {
            return done(err);
          }
          group.groupname.should.equal(testGroupname);
          linuxUser.getGroups(function (err, groups) {
            if (err) {
              return done(err);
            }
            groups.length.should.equal(num + 1);
            linuxUser.removeGroup(testGroupname, function (err) {
              if (err) {
                return done(err);
              }
              linuxUser.getGroups(function (err, groups) {
                if (err) {
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

  describe("verifySSHKey", function () {
    it("should be good SSH key", function (done) {
      linuxUser.verifySSHKey(testSSHKeyGood, function (err, data) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
    it("should be bad SSH key", function (done) {
      linuxUser.verifySSHKey(testSSHkeyBad, function (err, data) {
        if (err) {
          return done();
        }
        done(new Error("This key is bad, function did not error out"));
      });
    });
  });

  describe("addSSHtoUser", function () {
    afterEach(function (done) {
      linuxUser.removeUser(testUsername, done);
    });
    it("should add SSH key to the user", function (done) {
      linuxUser.addUser(
        { username: testUsername, create_home: true },
        function (err, user) {
          if (err) {
            done(err);
          }

          linuxUser.addSSHtoUser(testUsername, testSSHKeyGood, function (err) {
            if (err) {
              done(err);
            }

            // read the users auth file

            fs.readFile(
              user.homedir + "/.ssh/authorized_keys",
              "utf8",
              (err, data) => {
                if (err) {
                  done(err);
                  return;
                }
                // console.log(data)
                done();
              }
            );
          });
        }
      );
    });
  });

  describe("Other methods", function () {
    beforeEach(function (done) {
      linuxUser.addUser({ username: testUsername }, function (err) {
        linuxUser.addGroup(testGroupname, done);
      });
    });
    afterEach(function (done) {
      linuxUser.removeUser(testUsername, function (err) {
        linuxUser.removeGroup(testGroupname, done);
      });
    });

    it("should set password ok", function (done) {
      linuxUser.setPassword(testUsername, testPassword, done);
    });

    it("should add user to group", function (done) {
      linuxUser.addUserToGroup(testUsername, testGroupname, done);
    });
  });
});
