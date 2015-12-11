'use strict';

var _lo = require('lodash');
var util = require('util');

var AppDispatcher = require('../dispatcher');
var BaseStore = require('../common/BaseStore');
var constants = require('../common/constants');

function initGrid(numRows, numCols) {
  var grid = [];
}

var GameStores = BaseStore.createStore({
  setDefaultData: function() {
    this.alertInfo = null;
    this.grid = null;
    this.gameInit = false; //Init: Setting done, one player setting bombs
    this.gameStart = false; //Start: Bombs setting is done, another start traversing
  },

  //Getters
  getGrid: function() {
    return this.grid;
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

  handleGameStart: function() {
    this.gameStart = true;
    this.emitChange();
  }
});

GameStores.dispatchToken = AppDispatcher.register(function(action) {
  switch(action.type) {
    case constants.ActionType.GAME_INIT:
      break;
    default:
  }
});

module.exports = GameStores;
