'use strict';

var AppDispatcher = require('../dispatcher');
var constants = require('../common/constants');

var GameActions = {
  handleGameInit: function(gameConfig) {
    AppDispatcher.dispatch({
      type: constants.ActionType.GAME_INIT,
      gameConfig: gameConfig
    });
  },

  handleCellSelect: function(i, j) {
    AppDispatcher.dispatch({
      type: constants.ActionType.CELL_SELECT,
      i: i,
      j: j
    });
  },

  handleStartPlay: function() {
    AppDispatcher.dispatch({
      type: constants.ActionType.GAME_PLAY
    });
  },

  handleAddRover: function() {
    AppDispatcher.dispatch({
      type: constants.ActionType.ADD_ROVER
    });
  },

  handleGameMove: function(keyCode) {
    AppDispatcher.dispatch({
      type: constants.ActionType.GAME_MOVE,
      keyCode: keyCode
    });
  },
  handleRandBombs: function() {
    AppDispatcher.dispatch({
      type: constants.ActionType.ADD_RANDBOMB
    });
  }
};

module.exports = GameActions;
