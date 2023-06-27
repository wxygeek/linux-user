"use strict";

// ensure process is running on linux
if (process.platform !== "linux") {
  throw new Error("linux-user must be running on Linux");
}

// ensure process is running as root
if (!(process.getuid && process.getuid() === 0)) {
  console.warn(
    "linux-user is NOT running as root, some functions may not work!"
  );
}

var lib = require("./lib/user");
lib.promise = require("./lib/promise");

module.exports = lib;
