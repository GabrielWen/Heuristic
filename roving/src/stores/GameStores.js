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
    this.bombLocs = [];
    this.addingRover = false;
    this.currPtr = null;
    this.stepCount = 0;
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
      bombLocs: this.bombLocs,
      addingRover: this.addingRover,
      currPtr: this.currPtr,
      stepCount: this.stepCount
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
    this.currPtr = this.playerPos;
    this.roverCount = gameConfig.numRovers;
    this.emitChange();
  },

  availablePathExisted: function(i, j) {
    console.log('cur bombLocs:\n' + this.bombLocs);
    return true;
  },

  _handleSetBomb: function(i, j) {
    if (this.bombCount === 0) {
      this.alertInfo = {
        bsStyle: 'danger',
        msg: 'All available bombs are already set'
      };
    } else if (this.grid[i][j] == constants.State.CLEAR & this.availablePathExisted(i, j)) {
      this.bombCount--;
      this.grid[i][j] = constants.State.BOMB;
      this.bombLocs.push([i,j]);
      this.alertInfo = {
        bsStyle: 'success',
        msg: util.format('Available bombs: %s', this.bombCount)
      };
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

  _handlePlayerSelect: function(i, j) {
    if (!_lo.includes(constants.PlayerClickable, this.grid[i][j])) {
      return;
    }
    this.currPtr = [i, j];
    console.log(util.format('Choosing %s at (%s, %s)', this.grid[i][j], i, j));
  },

  handleCellSelect: function(i, j) {
    if (this.gameStart) {
      this._handlePlayerSelect(i, j);
    } else {
      this._handleSetBomb(i, j);
    }
  },

  handleStartPlay: function() {
    this.gameStart = true;
    this.alertInfo = {
      bsStyle: 'success',
      msg: util.format('Available rovers: %s', this.roverCount)
    };
    this.emitChange();
  },

  handleAddRover: function() {
    this.addingRover ^= true;
    if (this.addingRover) {
      this.alertInfo = {
        bsStyle: 'warning',
        msg: 'Adding rover, please press a direction...'
      };
    } else {
      this.alertInfo = {
        bsStyle: 'success',
        msg: util.format('Available rovers: %s', this.roverCount)
      };
    }
    this.emitChange();
  },

  _handlePlaceRover: function(v) {
    switch(this.grid[v[0]][v[1]]) {
      case constants.State.ROVER:
        return false;
      case constants.State.PLAYER:
        return false;
      case constants.State.DEST:
        return false;
      case constants.State.PLAYER_ON_BURST:
        return false;
      case constants.State.ROVER_ON_BURST:
        return false;
      case constants.State.BOMB:
        this.grid[v[0]][v[1]] = constants.State.BURST;
        break;
      case constants.State.BURST:
        this.grid[v[0]][v[1]] = constants.State.ROVER_ON_BURST;
        break;
      default:
        this.grid[v[0]][v[1]] = constants.State.ROVER;
    }
    return true;
  },

  _handlePlacePlayer: function(v) {
    switch(this.grid[v[0]][v[1]]) {
      case constants.State.ROVER:
        return false;
      case constants.State.PLAYER:
        return false;
      case constants.State.PLAYER_ON_BURST:
        return false;
      case constants.State.ROVER_ON_BURST:
        return false;
      case constants.State.BOMB:
        //TODO: Add lose logic
        this.grid[v[0]][v[1]] = constants.State.BURST;
        break;
      case constants.State.DEST:
        //TODO: Add win logic
        break;
      case constants.State.BURST:
        this.grid[v[0]][v[1]] = constants.State.PLAYER_ON_BURST;
        break;
      default:
        this.grid[v[0]][v[1]] = constants.State.PLAYER;
    }

    return true;
  },

  handleKeyMove: function(code) {
    /**
     * Validation
     */
    var v = _lo.clone(this.currPtr);
    switch(code) {
      case 37:
        if (this.currPtr[1] === 0) {
          return;
        }
        v[1]--;
        break;
      case 38:
        if (this.currPtr[0] === 0) {
          return;
        }
        v[0]--;
        break;
      case 39:
        if (this.currPtr[1] == this.gameConfig.numCols-1) {
          return;
        }
        v[1]++;
        break;
      case 40:
        if (this.currPtr[0] == this.gameConfig.numRows-1) {
          return;
        }
        v[0]++;
        break;
    }

    if (this.addingRover) {
      if (this._handlePlaceRover(v)) {
        this.roverCount--;
        this.alertInfo = {
          bsStyle: 'success',
          msg: util.format('Available rovers: %s', this.roverCount)
        };
        this.addingRover = false;
        this.stepCount++;
      }
    } else {
      var update = false;
      switch(this.grid[this.currPtr[0]][this.currPtr[1]]) {
        case constants.State.PLAYER:
          update = this._handlePlacePlayer(v);
          break;
        case constants.State.ROVER:
          update = this._handlePlaceRover(v);
          break;
      }

      if (update) {
        if (_lo.includes(constants.BurstStates, this.grid[this.currPtr[0]][this.currPtr[1]])) {
          this.grid[this.currPtr[0]][this.currPtr[1]] = constants.State.BURST;
        } else {
          this.grid[this.currPtr[0]][this.currPtr[1]] = constants.State.CLEAR;
        }
        this.currPtr = v;
        this.stepCount++;
      }
    }

    this.emitChange();
  }
});

AppDispatcher.register(function(action) {
  switch(action.type) {
    case constants.ActionType.GAME_INIT:
      GameStores.handleGameInit(action.gameConfig);
      break;
    case constants.ActionType.CELL_SELECT:
      GameStores.handleCellSelect(action.i, action.j);
      break;
    case constants.ActionType.GAME_PLAY:
      GameStores.handleStartPlay();
      break;
    case constants.ActionType.ADD_ROVER:
      GameStores.handleAddRover();
      break;
    case constants.ActionType.GAME_MOVE:
      GameStores.handleKeyMove(action.keyCode);
      break;
    default:
  }
});

module.exports = GameStores;
