linux-user
==========
Node module for Linux user and group control.

Use Node to manage Linux user easily. All APIs do what you think.

**The module must be running on Linux and as root user !**

Installation
=============

`$ npm install wmantly/linux-user --save`

Usage
=============

### Examples

* add Linux user

```js
var linuxUser = require('linux-user');

linuxUser.addUser('gkuchan', function (err, user) {
  if(err) {
    return console.error(err);
  }
  console.log(user);
  // ------------------------------------------
  // { username: 'gkuchan',
  //   password: 'x',
  //   uid: 1001,
  //   gid: 1001,
  //   fullname: '',
  //   homedir: '/home/gkuchan',
  //   shell: '/usr/sbin/nologin' }
  // ------------------------------------------
});
```
* get users

```js
var linuxUser = require('linux-user');

linuxUser.getUsers(function (err, users) {
  if(err) {
    return console.error(err);
  }
  console.log(users);
  // ------------------------------------------
  // [ { username: 'root',
  //   password: 'x',
  //   uid: 0,
  //   gid: 0,
  //   fullname: 'root',
  //   homedir: '/root',
  //   shell: '/bin/bash' },
  // { username: 'daemon',
  //   password: 'x',
  //   uid: 1,
  //   gid: 1,
  //   fullname: 'daemon',
  //   homedir: '/usr/sbin',
  //   shell: '/usr/sbin/nologin' },
  // { username: 'bin',
  //   password: 'x',
  //   uid: 2,
  //   gid: 2,
  //   fullname: 'bin',
  //   homedir: '/bin',
  //   shell: '/usr/sbin/nologin' } ]
  //   ------------------------------------------
  });
```

### Core APIs

* linuxUser.addUser(username, callback)
	* username String
	* callback function(err, userInfo)
* linuxUser.removeUser(username, callback)
	* username String
	* callback function(err)
* linuxUser.getUsers(callback)
	* callback function(err, usersInfo)
* linuxUser.getUserInfo(username, callback)
	* username String
	* callback function(err, userInfo)
* linuxUser.getUserGroups(username, callback)
	* username String
	* callback function(err, groups)
* linuxUser.setPassword(username, password, callback)
	* username String
	* password String
	* callback function(err)
* linuxUser.addGroup(groupname, callback)
	* groupname String
	* callback function(err, groupInfo)
* linuxUser.removeGroup(groupname, callback)
	* groupname String
	* callback function(err)
* linuxUser.getGroups(callback)
	* callback function(err, groupsInfo)
* linuxUser.getGroupInfo(groupname, callback)
	* groupname String
	* callback function(err, groupInfo)
* linuxUser.addUserToGroup(username, groupname, callback)
	* username String
	* groupname String
	* callback function(err)

### Other APIs

* linuxUser.validateUsername(username)
	* return boolen
	
	check a string is a valid linux username or not

* linuxUser.verifySSHKey(key, callback)
	* key String
	* callback function(err, key info)

### License

MIT
