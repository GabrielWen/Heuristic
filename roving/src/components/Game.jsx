'use strict';

var _lo = require('lodash');
var React = require('react');
var Input = require('react-bootstrap').Input;
var ButtonInput = require('react-bootstrap').ButtonInput;

var constants = require('../common/constants');
var GameActions = require('../actions/GameActions');
var GameStores = require('../stores/GameStores');

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
  render: function() {
    console.log(this.state.grid);
    return (
      <SettingForm handleSubmit={GameActions.handleGameInit}/>
    );
  }
});

var SettingForm = React.createClass({
  onSubmit: function() {
    var numRows = React.findDOMNode(this.refs.numRows).value;
    this.props.handleSubmit({
      numRows: parseInt(React.findDOMNode(this.refs.numRows).value),
      numCols: parseInt(React.findDOMNode(this.refs.numCols).value),
      numBombs: parseInt(React.findDOMNode(this.refs.numBombs).value),
      numRovers: parseInt(React.findDOMNode(this.refs.numRovers).value)
    });
  },
  render: function() {
    return (
      <form className="form-inline">
        <label>Num Rows</label>
        <input type="number" ref="numRows" defaultValue={constants.DefaultSetting.numRows}/>
        <label>Num Cols</label>
        <input type="number" ref="numCols" defaultValue={constants.DefaultSetting.numCols}/>
        <label>Num Bombs</label>
        <input type="number" label="Num Bombs" ref="numBombs" defaultValue={constants.DefaultSetting.numBombs}/>
        <label>Num Rovers</label>
        <input type="number" label="Num Rovers" ref="numRovers" defaultValue={constants.DefaultSetting.numRovers}/>
        <ButtonInput type="submit" onClick={this.onSubmit}/>
      </form>
    );
  }
});

module.exports = Game;
