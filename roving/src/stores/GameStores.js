'use strict';

var _lo = require('lodash');
var util = require('util');
var play = require('play-audio');

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
    this.addingRover = false;
    this.currPtr = null;
    this.stepCount = 0;
    this.gameOver = false;
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
      stepCount: this.stepCount,
      gameOver: this.gameOver
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
    if (i === constants.State.PLAYER[0] && j === constants.State.PLAYER[1]) {
      return false;
    } else if (i === constants.State.DEST[0] && j === constants.State.DEST[1]) {
      return false;
    }

    this.bombLocs[util.format('%s-%s', i, j)] = true;
    var hasPresult = this.hasPath(this.playerPos[0], this.playerPos[1]);
    if (hasPresult) {
      return true;
    } else {
      this.bombLocs[util.format('%s-%s', i, j)] = false;
      return false;
    }
  },

  handleRandBombs: function() {
    while (this.bombCount >0 ) {
      var randi = Math.floor(Math.random()*this.gameConfig.numRows);
      var randj = Math.floor(Math.random()*this.gameConfig.numCols);
      if (this.grid[randi][randj] == constants.State.CLEAR && this.canAddBomb(randi, randj)) {
        this.bombCount--;
        this.grid[randi][randj] = constants.State.BOMB;
        this.bombLocs[util.format('%s-%s', randi, randj)] = true;
      }
    }
    this.emitChange();
  },

  _handleSetBomb: function(i, j) {
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

    this.emitChange();
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
        play(constants.Sounds.explosion).autoplay();
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
        play(constants.Sounds.explosion).autoplay();
        this.gameOver = true;
        this.stepCount = constants.PlayerBurstScore;
        break;
      case constants.State.DEST:
        //TODO: Add win logic
        this.gameOver = true;
        play(constants.Sounds.win).autoplay();
        break;
      case constants.State.BURST:
        this.grid[v[0]][v[1]] = constants.State.PLAYER_ON_BURST;
        play(constants.Sounds.explosion).autoplay();
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
    var v = _lo.clone(this.addingRover ? this.playerPos : this.currPtr);
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
          if (update) {
            this.playerPos = v;
          }
          break;
        case constants.State.PLAYER_ON_BURST:
          update = this._handlePlacePlayer(v);
          if (update) {
            this.playerPos = v;
          }
          break;
        case constants.State.ROVER:
          update = this._handlePlaceRover(v);
          break;
        case constants.State.ROVER_ON_BURST:
          update = this._handlePlaceRover(v);
          break;
      }

      if (update) {
        if (_lo.includes(constants.BurstStates, this.grid[this.currPtr[0]][this.currPtr[1]])) {
          this.grid[this.currPtr[0]][this.currPtr[1]] = constants.State.BURST;
        } else {
          this.grid[this.currPtr[0]][this.currPtr[1]] = constants.State.STEPPED;
        }
        this.currPtr = v;
        this.stepCount++;
      }
    }
    play(constants.Sounds.move).autoplay();
    this.emitChange();
  },

  handleGameReset: function() {
    this.setDefaultData();
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
    case constants.ActionType.ADD_RANDBOMB:
      GameStores.handleRandBombs();
      break;
    case constants.ActionType.GAME_RESET:
      GameStores.handleGameReset();
      break;
    default:
  }
});

module.exports = GameStores;
