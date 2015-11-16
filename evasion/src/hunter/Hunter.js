'use strict';

var _lo = require('lodash');
var Promise = require('bluebird');
var math = require('mathjs');
var util = require('util');

var constants = require('../common/constants');
var base = require('../common/base');

function Hunter(cooldown, wallNum) {
  this.map = base.generateMap();
  this.walls = [];
  this.cooldown = cooldown;
  this.wallNum = wallNum;
  this.timeToLastWall = 0;
  this.wallBuilt = 0;
  this.time = 0;
  this.myPos = [0, 0];
  this.preyPos = [230, 200];
}

function isSquished(hunterPos, hunterDir, walls) {
  var newPos;
  newPos = base.moveHunter(hunterPos, hunterDir, walls);
  return newPos == base.Directions.E || newPos == base.Directions.W || newPos == base.Directions.N || newPos == base.Directions.S;
}

function useCoords(wall) {
  var x1, x2, y1, y2;
  x1 = wall.position[0];
  y1 = wall.position[1];
  x2 = wall.position[0];
  y2 = wall.position[1];
  if (wall.direction === base.Directions.E) {
    x2 = x1 + wall.length;
  }
  if (wall.direction === base.Directions.W) {
    x2 = x1 - wall.length;
  }
  if (wall.direction === base.Directions.N ) {
    y2 = y1 - wall.length;
  }
  if (wall.direction === base.Directions.S) {
    y2 = y1 + wall.length;
  }
  return [x1, y1, x2, y2];
}

function rotationDirection(p1x, p1y, p2x, p2y, p3x, p3y) {
  if (((p3y - p1y) * (p2x - p1x)) > ((p2y - p1y) * (p3x - p1x)))
    return 1;
  else if (((p3y - p1y) * (p2x - p1x)) == ((p2y - p1y) * (p3x - p1x)))
    return 0;
  
  return -1;
}

function line_intersects(x1, y1, x2, y2, x3, y3, x4, y4) {
  if(x1 === x2 && y1 === y2 && x3 === x4 && y3 === y4){
      return x1 === x3 && y1 === y3;
  }
  var face1CounterClockwise = rotationDirection(x1, y1, x2, y2, x4, y4);
  var face2CounterClockwise = rotationDirection(x1, y1, x2, y2, x3, y3);
  var face3CounterClockwise = rotationDirection(x1, y1, x3, y3, x4, y4);
  var face4CounterClockwise = rotationDirection(x2, y2, x3, y3, x4, y4);

  // If face 1 and face 2 rotate different directions and face 3 and face 4 rotate different directions, 
  // then the lines intersect.
  var intersect = face1CounterClockwise != face2CounterClockwise && face3CounterClockwise != face4CounterClockwise;
  
  // If lines are on top of each other.
  if (face1CounterClockwise === 0 && face2CounterClockwise === 0 && face3CounterClockwise === 0 && face4CounterClockwise === 0){
    intersect = true;}
    return intersect;
}

function hasHunterWon(hunterPos, preyPos, walls) {
  var closeEnough, i, len, line2, n, points, sum, wall;
  sum = 0;
  n = 0;
  while (n < hunterPos.length) {
    sum += Math.pow(hunterPos[n] - preyPos[n], 2);
    n++;
  }
  closeEnough = Math.floor(Math.sqrt(sum)) <= 4;
  for (i = 0, len = walls.length; i < len; i++) {
    wall = walls[i];
    line2 = useCoords(wall);
    if (line_intersects(hunterPos[0], hunterPos[1], preyPos[0], preyPos[1], line2[0], line2[1], line2[2], line2[3])) {
      return false;
    }
  }
  return closeEnough;
}

Hunter.prototype.makeWall = function() {

};

Hunter.prototype.removeWall = function() {

};

Hunter.prototype.makeMove = function() {

};

Hunter.prototype.onRecvData = function(commands) {
  this.myPos = commands.hunter;
  this.preyPos = commands.prey;
  this.walls = commands.wall;
  this.time = commands.time;

  return this.makeMove();
};

module.exports = Hunter;
