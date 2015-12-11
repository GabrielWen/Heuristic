'use strict';

var _lo = require('lodash');
var util = require('util');

var AppDispatcher = require('../dispatcher');
var BaseStore = require('../common/BaseStore');
var constants = require('../common/constants');

var GameStores = BaseStore.createStore({
  setDefaultData: function() {
    this.grid = [];
    this.gameConfig = null;
    this.gameInit = false;
    this.gameStart = false;
  },

  getState: function() {
    return {
      grid: this.grid,
      gameConfig: this.gameConfig,
      gameInit: this.gameInit,
      gmaeStart: this.gameStart
    };
  },

  handleGameInit: function(gameConfig) {
    var grid = [];
    _lo.times(gameConfig.numRows, function() {
      var row = [];
      _lo.times(gameConfig.numCols, function() {
        row.push(constants.State.CLEAR);
      });
      grid.push(row);
    });

    this.grid = grid;
    this.gameConfig = gameConfig;
    this.gameInit = true;
    this.emitChange();
  }
});

AppDispatcher.register(function(action) {
  switch(action.type) {
    case constants.ActionType.GAME_INIT:
      GameStores.handleGameInit(action.gameConfig);
      break;
    default:
  }
});

module.exports = GameStores;
