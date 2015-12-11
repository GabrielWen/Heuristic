'use strict';

var _lo = require('lodash');
var util = require('util');
var React = require('React');
var Panel = require('react-bootstrap').Panel;
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Button = require('react-bootstrap').Button;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Input = require('react-bootstrap').Input;

var Grid = require('./Grid.jsx');
var InitForm = require('./InitForm.jsx');
var InitFormStores = require('../stores/InitFormStores');

var GameActions = require('../actions/GameActions');
var GameStores = require('../stores/GameStores');

var constants = require('../common/constants');

function getState() {
  var formStates = InitFormStores.getState();
  return {
    gameConfig: formStates.formValue,
    alertInfo: GameStores.getAlertInfo(),
    grid: GameStores.getGrid(),
    gameInit: formStates.gameInit,
    gameStart: formStates.gameStart
  };
}

var Game = React.createClass({
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
    GameStores.addChangeListener(this._onChange);
    InitFormStores.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    GameStores.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(getState());
  },
  onInit: function() {
    GameActions.gameInit(InitFormStores.getState().formValue);
  },
  onStart: function() {
    console.log('Start');
  },
  render: function() {
    return (
      <div>
        <InitForm/>
        <Grid gameConfig={this.state.gameConfig || constants.DefaultSetting} init={this.state.gameInit} start={this.state.gameStart}/>
      </div>
    );
  }
});

module.exports = Game;
