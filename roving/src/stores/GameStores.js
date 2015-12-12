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
    this.playerPos = null;
    this.roverCount = 0;
    this.bombLocs = {};
  },

  getState: function() {
    return {
      grid: this.grid,
      gameConfig: this.gameConfig,
      gameInit: this.gameInit,
      gameStart: this.gameStart,
      alertInfo: this.alertInfo,
      bombCount: this.bombCount,
      playerPos: this.playerPos,
      roverCount: this.roverCount,
      bombLocs: this.bombLocs
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
    this.playerPos = [gameConfig.numRows-1, 0];
    this.roverCount = gameConfig.numRovers;
    this.emitChange();
  },

  hasPath: function(i, j) {
    if (i === 0 && j === this.gameConfig.numCols-1) {
      return true;
    } else if (this.bombLocs[util.format('%s-%s', i, j)]) {
      return false;
    } else if (i === 0){
      return this.hasPath(i, j+1);
    } else if (j === this.gameConfig.numCols-1) {
      return this.hasPath(i-1, j);
    } else {
      return this.hasPath(i-1, j) || this.hasPath(i, j+1);
    }
  },

  canAddBomb: function(i, j) {
    this.bombLocs[util.format('%s-%s', i, j)] = true;
    var hasPresult = this.hasPath(this.playerPos[0], this.playerPos[1]);
    if (hasPresult) {
      return true;
    } else {
      this.bombLocs[util.format('%s-%s', i, j)] = false;
      return false;
    }
  },

  handleSetBomb: function(i, j) {
    if (this.bombCount === 0) {
      this.alertInfo = {
        bsStyle: 'danger',
        msg: 'All available bombs are already set'
      };
    } else if (this.grid[i][j] == constants.State.CLEAR) {
      if (!this.canAddBomb(i, j)) {
        this.alertInfo = {
          bsStyle: 'danger',
          msg: util.format('Player has no path')
        };
      } else {
        this.bombCount--;
        this.grid[i][j] = constants.State.BOMB;
        this.bombLocs[util.format('%s-%s', i, j)] = true;
        this.alertInfo = {
          bsStyle: 'success',
          msg: util.format('Available bombs: %s', this.bombCount)
        };
      }
    } else if (this.grid[i][j] == constants.State.BOMB) {
      this.bombCount++;
      this.grid[i][j] = constants.State.CLEAR;
      this.alertInfo = {
        bsStyle: 'success',
        msg: util.format('Available bombs: %s', this.bombCount)
      };
    }

    this.emitChange();
  },

  handleStartPlay: function() {
    this.gameStart = true;
    this.alertInfo = {
      bsStyle: 'success',
      msg: util.format('Available rovers: %s', this.roverCount)
    };
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
    case constants.ActionType.GAME_PLAY:
      GameStores.handleStartPlay();
      break;
    default:
  }
});

module.exports = GameStores;
