'use strict';

var _lo = require('lodash');
var util = require('util');
var React = require('react');
var Input = require('react-bootstrap').Input;
var ButtonInput = require('react-bootstrap').ButtonInput;
var Button = require('react-bootstrap').Button;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Panel = require('react-bootstrap').Panel;
var Alert = require('react-bootstrap').Alert;
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Jumbotron = require('react-bootstrap').Jumbotron;

var constants = require('../common/constants');
var GameActions = require('../actions/GameActions');
var GameStores = require('../stores/GameStores');

var SettingForm = require('../common/SettingForm.jsx');
var GameGrid = require('../common/Grid.jsx');

var Game = React.createClass({
  getInitialState: function() {
    return GameStores.getState();
  },
  componentDidMount: function() {
    GameStores.addChangeListener(this._onChange);
    window.addEventListener('keydown', this.keyboardHandler, false);
  },
  componentWillUnmount: function() {
    GameStores.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(GameStores.getState());
  },
  handleCellClick: function(i, j) {
    if (!this.state.gameInit && !this.state.gameStart) {
      return;
    }
    GameActions.handleCellSelect(i, j);
  },
  handleStartPlay: function() {
    GameActions.handleStartPlay();
  },
  handleAddRover: function() {
    GameActions.handleAddRover();
  },
  keyboardHandler: function(e) {
    if (this.state.gameOver || !this.state.gameStart || e.keyCode < 37 || e.keyCode > 40) {
      return;
    }
    GameActions.handleGameMove(e.keyCode);
  },
  handleRandBombs: function() {
    GameActions.handleRandBombs();
  },
  handleGameReset: function() {
    if (this.state.gameOver) {
      GameActions.handleGameReset();
    } else if (window.confirm('Reset will erase current progress, are you sure?')) {
      GameActions.handleGameReset();
    }
  },
  render: function() {
    var title = this.state.gameInit ? util.format('Game Playing: %s x %s with %s bombs and %s rovers',
                                      this.state.gameConfig.numRows, this.state.gameConfig.numCols,
                                      this.state.gameConfig.numBombs, this.state.gameConfig.numRovers) :
                                      'Please choose configurations';

    var button = this.state.gameInit && !this.state.gameStart ? (
      <ButtonGroup>
        <Button bsStyle="danger" onClick={this.handleStartPlay}>Play</Button>
        <Button bsStyle="warning" onClick={this.handleRandBombs}>RandBombs</Button>
      </ButtonGroup>
    ) : null;

    var addRoverButton = this.state.gameStart && !this.state.gameOver ? <Button bsStyle="success" disabled={this.state.roverCount === 0} onClick={this.handleAddRover}>Add Rover</Button> : null;
    var resetButton = <Button bsStyle="danger" onClick={this.handleGameReset}>Reset</Button>;

    var alertInfo = _lo.isEmpty(this.state.alertInfo) || this.state.gameOver ? null : <Alert bsStyle={this.state.alertInfo.bsStyle}>{this.state.alertInfo.msg}</Alert>;

    if (this.state.gameOver) {
      return this.state.playerWon ? (
      <Jumbotron>
        <h1>{util.format('You Win!  Your score is: %s', this.state.stepCount)}</h1>
        <Button bsStyle="success" onClick={this.handleGameReset}>Start Again</Button>
      </Jumbotron>) : (
      <Jumbotron>
        <h1>{util.format('%s  Your score is: %s', this.state.playerWon ? 'You Win!' : 'Game Over!', this.state.stepCount)}</h1>
        <Button bsStyle="success" onClick={this.handleGameReset}>Start Again</Button>
      </Jumbotron>);
    }

    return (
      <Grid fluid>
        <Row>
          <Col xs={12} md={9}>
            <Panel header={title}>
              {this.state.gameInit ? null : <SettingForm handleSubmit={GameActions.handleGameInit}/>}
              {alertInfo}
            </Panel>
          </Col>
          <Col xs={12} md={3}>
            <Panel header="Control Panel">
              {button}
              {resetButton}
              {addRoverButton}
            </Panel>
          </Col>
        </Row>
        <Row>
          <Panel header={util.format('Game Area.  Current Score: %s', this.state.stepCount)}>
            <GameGrid grid={this.state.grid} gameInit={this.state.gameInit} gameStart={this.state.gameStart}
                      gameConfig={this.state.gameConfig} handleClick={this.handleCellClick} curr={this.state.currPtr}/>
          </Panel>
        </Row>
      </Grid>
    );
  }
});

module.exports = Game;
