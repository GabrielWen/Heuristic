'use strict';

var React = require('react');
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var constants = require('./constants');

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
        <Button bsStyle="success" onClick={this.onSubmit}>Submit</Button>
      </form>
    );
  }
});

module.exports = SettingForm;
