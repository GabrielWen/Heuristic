'use strict';

var _lo = require('lodash');
var Promise = require('bluebird');
var math = require('mathjs');
var util = require('util');

var constants = require('./constants');

var base = module.exports = {};

base.Wall = function(pos, length, direction, canBeDestroyed) {
  this.position = pos;
  this.length = length;
  this.direction = direction;
  this.canBeDestroyed = canBeDestroyed;
};

base.generateMap = function() {
  var newMap = [];

  newMap.push(new base.Wall([-1, -1], 302, constants.Directions.S, false));
  newMap.push(new base.Wall([301, -1], 302, constants.Directions.S, false));
  newMap.push(new base.Wall([0, -1], 300, constants.Directions.E, false));
  newMap.push(new base.Wall([0, 301], 300, constants.Directions.E, false));

  return newMap;
};

function nextPos(pos, direction) {
  return [pos[0] + direction[0], pos[1] + direction[1]];
}

function isPointOnWall(p, w) {
  switch (w.direction) {
    case constants.Directions.E:
      return w.position[1] === p[1] && w.position[0] <= p[0] && w.position[0] + w.length >= p[0];
    case constants.Directions.W:
      return w.position[1] === p[1] && w.position[0] >= p[0] && w.position[0] - w.length <= p[0];
    case constants.Directions.S:
      return w.position[0] === p[0] && w.position[1] <= p[1] && w.position[1] + w.length >= p[1];
    case constants.Directions.N:
      return w.position[0] === p[0] && w.position[1] >= p[1] && w.position[1] - w.length <= p[1];
    default:
      return false;
  }
}

base.moveHunter = function(pos, direction, walls) {
  var newPos = nextPos(pos, direction);
  var newDirection = [direction[0], direction[1]];

  var hitWall = _lo.find(walls, _lo.partial(isPointOnWall, newPos));

  //Implementation of bounce-off algorithm
  if (!_lo.isEmpty(hitWall)) {
    if (hitWall.direction == constants.Directions.E || hitWall.direction == constants.Directions.W) {
      newPos = nextPos(pos, [newDirection[0], 0]);
      newDirection = [direction[0], direction[1] * -1];
    } else {
      newPos = nextPos(pos, [0, newDirection[1]]);
      newDirection = [direction[0] * -1, direction[1]];
    }

    //Second check
    var secondWall = _lo.find(walls, _lo.partial(isPointOnWall, newPos));
    if (!_lo.isEmpty(secondWall)) {
      if (hitWall.direction == constants.Directions.E || hitWall.direction == constants.Directions.W) {
        newPos = nextPos(pos, [0, direction[1]]);
        newDirection = [direction[0] * -1, direction[1]];
      } else {
        newPos = nextPos(pos, [direction[0], 0]);
        newDirection = [direction[0], direction[1] * -1];
      }
    }
  }

  //Check if a corner is hit
  hitWall = _lo.find(walls, _lo.partial(isPointOnWall, newPos));
  if (!_lo.isEmpty(hitWall)) {
    newPos = pos;
    newDirection = [direction[0] * -1, direction[1] * -1];
  }

  return {
    position: newPos,
    direction: newDirection
  };
};
