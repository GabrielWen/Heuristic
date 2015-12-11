'use strict';

var keyMirror = require('react/lib/keyMirror');

var constants = module.exports = {};

constants.CHANGE_EVENT = 'CHANGE';

constants.ActionType = keyMirror({
  POINT_SET_BOMB: null,
  POINT_SET_DONE: null,
  POINT_FLIPPED: null
});

constants.Figures = {
  dot: '/static/figures/dot.png',
  bomb: '/static/figures/bombs.gif',
  bombBurst: '/static/figures/bombsBurst.jpg',
  pilotlessRover: '/static/figures/pilotlessRover.jpg'
};

constants.Setting = {
  numRows: 50,
  numCols: 50,
  defaults: {
    NUM_BOMBS: 10,
    NUM_ROVERS: 5
  }
};
