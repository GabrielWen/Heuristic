'use strict';

var keyMirror = require('react/lib/keyMirror');

var constants = module.exports = {};

constants.CHANGE_EVENT = 'CHANGE';

constants.ActionType = keyMirror({
  POINT_SET_BOMB: null,
  POINT_SET_DONE: null,
  POINT_FLIPPED: null,
  INIT_FORM_CHANGE: null,
  INIT_FORM_SUBMIT: null,
  GAME_START: null
});

constants.Figures = {
  dot: '/static/figures/dot.png',
  bomb: '/static/figures/bombs.gif',
  bombBurst: '/static/figures/bombsBurst.jpg',
  pilotlessRover: '/static/figures/pilotlessRover.jpg'
};

constants.DefaultSetting = {
  numRows: 50,
  numCols: 50,
  numBombs: 10,
  numRovers: 5
};

constants.CellState = keyMirror({
  CLEAN: null,
  BOMB: null,
  BURST: null,
  CLEARED: null
});
