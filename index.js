'use strict';

var bluebird= require('bluebird');
var lib = require('./lib/user');

lib.promise = (function(lib) {
	var out = {};

	Object.keys(lib).forEach(function(key){
 		out[key] = bluebird.promisify(lib[key]);
	});

	return out;
})(lib);

module.exports = lib;
