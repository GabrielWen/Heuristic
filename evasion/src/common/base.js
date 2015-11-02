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

base.farSideDist = function(hunter, prey) {
  var xDist = hunter[0] > prey[0] ? hunter[0] - prey[0] : prey[0] - hunter[0];
  var yDist = hunter[1] > prey[1] ? hunter[1] - prey[1] : prey[1] - hunter[1];

  return xDist > yDist ? xDist : yDist;
};

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

function useLines(w1, w2) {
  var line1, line2;
  line1 = useCoords(w1);
  line2 = useCoords(w2);
  return line_intersects(line1[0], line1[1], line1[2], line1[3], line2[0], line2[1], line2[2], line2[3]);
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

function isWallIntersecting(newWall, walls) {
  var i, len, wall;
  for (i = 0, len = walls.length; i < len; i++) {
    wall = walls[i];
    if (useLines(newWall, wall)) {
      return true;
    }
  }
  return false;
}

function isWallIntersectingHunter(newWall, hunterPosition) {
  var wall = {};
  wall.length = newWall.length;
  wall.position = nextPos(hunterPosition, newWall.direction);
  wall.direction = newWall.direction;
  return isPointOnWall(hunterPosition, wall);
}

function isWallIntersectingPrey(newWall, preyPosition) {
  return isPointOnWall(preyPosition, newWall);
}

function isSquished(hunterPos, hunterDir, walls) {
  var newPos, newerPos, evenNewerPos;

  newPos = base.moveHunter(hunterPos, hunterDir, walls);
  newerPos = base.moveHunter(newPos.newPosition, newPos.direction, walls);
  evenNewerPos = base.moveHunter(newerPos.newPosition, newerPos.direction, walls);
  if(newPos.newPosition[0] == newerPos.newPosition[0] &&
     newPos.newPosition[1] == newerPos.newPosition[1] &&
     evenNewerPos.newPosition[0] == newerPos.newPosition[0] &&
     evenNewerPos.newPosition[1] == newerPos.newPosition[1]  )
    return true;
  return false;
}

