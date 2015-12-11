'use strict';

var _lo = require('lodash');
var util = require('util');
var React = require('React');
var Panel = require('react-bootstrap').Panel;
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Button = require('react-bootstrap').Button;

var Grid = require('./Grid.jsx');
var InitForm = require('./InitForm.jsx');
var InitFormStores = require('../stores/InitFormStores');

var GameActions = require('../actions/GameActions');
var GameStores = require('../stores/GameStores');

function getState() {
  return {
    gameConfig: GameStores.getGameConfig(),
    alertInfo: GameStores.getAlertInfo(),
    grid: GameStores.getGrid(),
    gameInit: GameStores.getGameInit(),
    gameStart: GameStores.getGameStart()
  };
}

var Game = React.createClass({
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
    GameStores.addChangeListener(this._onChange);
    InitFormStores.attachOnSubmit(GameActions.gameInit);
  },
  componentWillUnmount: function() {
    GameStores.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(getState());
  },
  render: function() {
    console.log(this.state);
    if (!this.state.gameInit && !this.gameStart) {
      return <InitForm/>;
    } else {
      return <Grid/>;
    }
  }
});

module.exports = Game;
