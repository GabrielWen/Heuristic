'use strict';

var _lo = require('lodash');
var React = require('react');
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var constants = require('./constants');

var SettingForm = React.createClass({
  onSubmit: function() {
    this.props.handleSubmit({
      numRows: parseInt(this.refs.numRows.getValue()),
      numCols: parseInt(this.refs.numCols.getValue()),
      numBombs: parseInt(this.refs.numBombs.getValue()),
      numRovers: parseInt(this.refs.numRovers.getValue())
    });
  },
  render: function() {
    return (
      <div>
      <form className="form-inline">
        <Input label="Num Rows" type="number" ref="numRows" defaultValue={constants.DefaultSetting.numRows}/>
        <Input label="Num Cols" type="number" ref="numCols" defaultValue={constants.DefaultSetting.numCols}/>
      </form>
      <form className="form-inline">
        <Input type="number" label="Num Bombs" ref="numBombs" defaultValue={constants.DefaultSetting.numBombs}/>
        <Input type="number" label="Num Rovers" ref="numRovers" defaultValue={constants.DefaultSetting.numRovers}/>
      </form>
      <Button bsStyle="success" onClick={this.onSubmit}>Submit</Button>
      </div>
    );
  }
});

module.exports = SettingForm;
