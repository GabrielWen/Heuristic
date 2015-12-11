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
    this.gameInit = false; //Init: Setting done, one player setting bombs
    this.gameStart = false; //Start: Bombs setting is done, another start traversing
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
  getGameInit: function() {
    return this.gameInit;
  },
  getGameStart: function() {
    return this.gameStart;
  },

  handleGameInit: function(gameConfig) {
    this.gameConfig = gameConfig;
    this.gameInit = true;
    this.emitChange();
  },

  handleGameStart: function() {
    this.gameStart = true;
    this.emitChange();
  }
});

GameStores.dispatchToken = AppDispatcher.register(function(action) {
  switch(action.type) {
    case constants.ActionType.GAME_INIT:
      GameStores.handleGameInit(action.gameConfig);
      break;
    default:
  }
});

module.exports = GameStores;
