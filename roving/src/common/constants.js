'use strict';

var keyMirror = require('react/lib/keyMirror');

var constants = module.exports = {};

constants.ActionType = keyMirror({
  GAME_INIT: null
});

constants.DefaultSetting = {
  numRows: 20,
  numCols: 20,
  picSize: 25,
  numBombs: 10,
  numRovers: 5
};

constants.CHANGE_EVENT = 'CHANGE';

constants.State = keyMirror({
  CLEAR: null,
  BOMB: null,
  ROVER: null,
  PLAYER: null,
  DEST: null,
  BURST: null
});

constants.Figures = {
  dot: '/static/figures/dot.png',
  bombs: '/static/figures/bombs.gif',
  burst: '/static/figures/bombBurst.jpg',
  rover: '/static/figures/pilotlessRover.png',
  player: '/static/figures/spaceShip.jpg'
};
