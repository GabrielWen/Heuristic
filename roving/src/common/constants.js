'use strict';

var keyMirror = require('react/lib/keyMirror');

var constants = module.exports = {};

constants.ActionType = keyMirror({
  GAME_INIT: null,
  CELL_SELECT: null,
  GAME_PLAY: null,
  ADD_ROVER: null,
  GAME_MOVE: null
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
  BURST: null,
  PLAYER_ON_BURST: null,
  ROVER_ON_BURST: null
});

constants.PlayerClickable = [constants.State.ROVER, constants.State.PLAYER, constants.State.PLAYER_ON_BURST,
                             constants.State.ROVER_ON_BURST];

constants.BurstStates = [constants.State.PLAYER_ON_BURST, constants.State.ROVER_ON_BURST];

constants.Figures = {
  dot: '/static/figures/dot.png',
  bombs: '/static/figures/bombs.gif',
  burst: '/static/figures/bombsBurst.jpg',
  rover: '/static/figures/pilotlessRover.png',
  player: '/static/figures/spaceShip.jpg',
  dest: '/static/figures/dest.png'
};

constants.Direction = {
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN'
};
