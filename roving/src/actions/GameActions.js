'use strict';

var AppDispatcher = require('../dispatcher');
var constants = require('../common/constants');

var GameActions = {
  gameStart: function(gameConfig) {
    AppDispatcher.dispatch({
      type: constants.ActionType.GAME_START,
      gameConfig: gameConfig
    });
  }
};

module.exports = GameActions;
