'use strict';

var AppDispatcher = require('../dispatcher');
var constants = require('../common/constants');

var GameActions = {
  gameInit: function(gameConfig) {
    AppDispatcher.dispatch({
      type: constants.ActionType.GAME_INIT,
      gameConfig: gameConfig
    });
  }
};

module.exports = GameActions;
