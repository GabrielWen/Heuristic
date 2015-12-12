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

  handleSetBomb: function(i, j) {
    AppDispatcher.dispatch({
      type: constants.ActionType.SET_BOMB,
      i: i,
      j: j
    });
  }
};

module.exports = GameActions;
