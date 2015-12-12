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

var constants = require('../common/constants');
var GameActions = require('../actions/GameActions');
var GameStores = require('../stores/GameStores');

var SettingForm = require('../common/SettingForm.jsx');
var Grid = require('../common/Grid.jsx');

var Game = React.createClass({
  getInitialState: function() {
    return GameStores.getState();
  },
  componentDidMount: function() {
    GameStores.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    GameStores.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(GameStores.getState());
  },
  test: function() {
    console.log('Game TEST');
  },
  handleCellClick: function(i, j) {
    if (!this.state.gameInit || this.state.gameStart) {
      return;
    }
    GameActions.handleSetBomb(i, j);
  },
  render: function() {
    var title = this.state.gameInit ? util.format('Game Playing: %s x %s with %s bombs and %s rovers',
                                      this.state.gameConfig.numRows, this.state.gameConfig.numCols,
                                      this.state.gameConfig.numBombs, this.state.gameConfig.numRovers) :
                                      'Please choose configurations';

    //TODO: onClick here
    var button = this.state.gameInit ? (
      <ButtonGroup>
        <Button bsStyle="primary">Play</Button>
        <Button bsSylte="danger">Reset</Button>
      </ButtonGroup>
    ) : null;

    var alertInfo = _lo.isEmpty(this.state.alertInfo) ? null : <Alert bsStyle={this.state.alertInfo.bsStyle}>{this.state.alertInfo.msg}</Alert>;

    return (
      <div>
        <Panel header={title}>
          {this.state.gameInit ? null : <SettingForm handleSubmit={GameActions.handleGameInit}/>}
          {button}
        </Panel>
        {alertInfo}
        <Grid grid={this.state.grid} gameInit={this.state.gameInit} gameStart={this.state.gameStart}
              gameConfig={this.state.gameConfig} handleClick={this.handleCellClick}/>
      </div>
    );
  }
});

module.exports = Game;
