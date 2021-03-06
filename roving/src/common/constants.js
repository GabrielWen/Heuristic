'use strict';

var keyMirror = require('react/lib/keyMirror');

var constants = module.exports = {};

constants.ActionType = keyMirror({
  GAME_INIT: null,
  CELL_SELECT: null,
  GAME_PLAY: null,
  ADD_ROVER: null,
  GAME_MOVE: null,
  ADD_RANDBOMB: null,
  GAME_RESET: null
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
  ROVER_ON_BURST: null,
  STEPPED: null
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

constants.Sounds = {
  dead: '../../static/sounds/death.wav',
  explosion: '../../static/sounds/explosion.wav',
  move: '../../static/sounds/move.wav',
  win: '../../static/sounds/win.wav'
};

constants.Direction = {
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN'
};

constants.alertState = keyMirror({
  DONEINIT: null,
  PUTBOMB_OK: null,
  DONEPLACEBOMBS: null,
  PUTBOMBSNOPATH: null,
  REPORTROVER: null,
  ADDROVER: null
});

constants.alertInfo = {
  doneInit: {bsStyle: 'success', msg: 'Game init. Place bombs on board or click RandBombs button!'},
  putBombOk: {bsStyle: 'success', msg: 'Available bombs: '},
  donePlaceBombs: {bsStyle: 'success', msg: 'All bombs are set. Press Play button!'},
  putBombsNoPath: {bsStyle: 'danger', msg: 'Player has no path.'},
  reportRover: {bsStyle: 'success', msg: 'Available rovers: '},
  addRover: {bsStyle: 'warning', msg: 'Adding rover, please press a direction...'}
};

constants.PlayerBurstScore = 9999;
