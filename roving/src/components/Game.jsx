'use strict';

var _lo = require('lodash');
var util = require('util');
var React = require('react');
var Input = require('react-bootstrap').Input;
var ButtonInput = require('react-bootstrap').ButtonInput;
var Button = require('react-bootstrap').Button;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Panel = require('react-bootstrap').Panel;

var constants = require('../common/constants');
var GameActions = require('../actions/GameActions');
var GameStores = require('../stores/GameStores');

var SettingForm = require('../common/SettingForm.jsx');

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

    return (
      <Panel header={title}>
        {this.state.gameInit ? null : <SettingForm handleSubmit={GameActions.handleGameInit}/>}
        {button}
      </Panel>
    );
  }
});

module.exports = Game;
