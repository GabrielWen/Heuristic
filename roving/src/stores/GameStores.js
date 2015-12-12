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
    this.alertInfo = null;
    this.bombCount = 0;
  },

  getState: function() {
    return {
      grid: this.grid,
      gameConfig: this.gameConfig,
      gameInit: this.gameInit,
      gmaeStart: this.gameStart,
      alertInfo: this.alertInfo,
      bombCount: this.bombCount
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

    //Set player/dest
    grid[gameConfig.numRows-1][0] = constants.State.PLAYER;
    grid[0][gameConfig.numCols-1] = constants.State.DEST;

    this.grid = grid;
    this.gameConfig = gameConfig;
    this.gameInit = true;
    this.bombCount = gameConfig.numBombs;
    this.emitChange();
  },

  handleSetBomb: function(i, j) {
    if (this.bombCount === 0) {
      this.alertInfo = {
        bsStyle: 'danger',
        msg: 'All available bombs are already set'
      };
    } else if (this.grid[i][j] == constants.State.CLEAR) {
      this.bombCount--;
      this.grid[i][j] = constants.State.BOMB;
      this.alertInfo = {
        bsStyle: 'success',
        msg: util.format('Available bombs: %s', this.bombCount)
      };
    }

    this.emitChange();
  }
});

AppDispatcher.register(function(action) {
  switch(action.type) {
    case constants.ActionType.GAME_INIT:
      GameStores.handleGameInit(action.gameConfig);
      break;
    case constants.ActionType.SET_BOMB:
      GameStores.handleSetBomb(action.i, action.j);
      break;
    default:
  }
});

module.exports = GameStores;
