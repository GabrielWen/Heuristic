'use strict';

var _lo = require('lodash');
var util = require('util');

var AppDispatcher = require('../dispatcher');
var BaseStore = require('../common/BaseStore');
var constants = require('../common/constants');

var GameStores = BaseStore.createStore({
  setDefaultData: function() {
    this.gameConfig = null;
    this.alertInfo = null;
    this.grid = null;
  },

  //Getters
  getGrid: function() {
    return this.grid;
  },
  getGameConfig: function() {
    return this.gameConfig;
  },
  getAlertInfo: function() {
    return this.alertInfo;
  },

  handleGameStart: function(gameConfig) {
    console.log(util.format('In GAMESTORE: %s\n', JSON.stringify(gameConfig)));
    this.gameConfig = gameConfig;
  }
});

GameStores.dispatchToken = AppDispatcher.register(function(action) {
  switch(action.type) {
    case constants.ActionType.GAME_START:
      GameStores.handleGameStart(action.gameConfig);
      break;
    default:
  }
});

module.exports = GameStores;
