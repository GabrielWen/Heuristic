'use strict';

var _lo = require('lodash');
var Promise = require('bluebird');
var math = require('mathjs');

var constants = require('../common/constants');
var base = require('../common/base');

function Hunter(lenX, lenY) {
  this.map = base.generateMap();
}

Hunter.prototype.makeMove = function() {

};

Hunter.prototype.makeWall = function() {

};

Hunter.prototype.removeWall = function() {

};

module.exports = Hunter;
