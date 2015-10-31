'use strict';

var _lo = require('lodash');
var Promise = require('bluebird');
var math = require('mathjs');
var util = require('util');

var constants = require('./constants');

var base = module.exports = {};

base.generateMap = function(lenX, lenY) {
  var newMap = [];

  for (var i = 0; i < lenY; i++) {
    newMap.push(_lo.fill(new Array(lenX), 0));
  }

  newMap[constants.InitPos.Hunter[0]][constants.InitPos.Hunter[1]] = constants.Mark.hunter;
  newMap[constants.InitPos.Prey[0]][constants.InitPos.Prey[1]] = constants.Mark.prey;

  return newMap;
};
