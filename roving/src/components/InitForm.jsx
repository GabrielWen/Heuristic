'use strict';

var _lo = require('lodash');
var util = require('util');
var React = require('react');
var Panel = require('react-bootstrap').Panel;
var ButtonInput = require('react-bootstrap').ButtonInput;
var Button = require('react-bootstrap').Button;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Alert = require('react-bootstrap').Alert;

var FormInput = require('../common/FormInput.jsx');

var InitFormActions = require('../actions/InitFormActions');
var InitFormStores = require('../stores/InitFormStores');

var InitForm = React.createClass({
  getInitialState: function() {
    return InitFormStores.getState();
  },
  componentDidMount: function() {
    InitFormStores.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    InitFormStores.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    console.log('emit');
    this.setState(InitFormStores.getState());
  },

  handleFormChange: InitFormActions.formChange.bind(InitFormActions),
  render: function() {
    //TODO: Disable submit button when clicked
    var inputCssProp = {
      'labelClassName': 'col-xs-2',
      'wrapperClassName': 'col-xs-3'
    };

    var alertField = this.state.alertInfo ? (<Alert bsStyle={this.state.alertInfo.bsStyle}>{this.state.alertInfo.msg}</Alert>) : null;

    if (this.state.gameInit) {
      return (
        <Panel header={util.format('Game Playing: %s x %s with %s Bombs and %s pilotless rovers', this.state.formValue.numRows, this.state.formValue.numCols, this.state.formValue.numBombs, this.state.formValue.numRovers)}>
          {alertField}
          <ButtonGroup>
            <Button bsStyle="success">Play</Button>
            <Button bsStyle="danger">Reset</Button>
          </ButtonGroup>
        </Panel>
      );
    } else {
      return (
        <Panel header={"Game Setting"}>
          {alertField}
          <form className="form-inline">
            <FormInput.Input type="number" {...inputCssProp} label="Num Rows" placeholder={this.state.formValue.numRows}
                             onChange={this.handleFormChange.bind(this, 'numRows')}
                             model={this.state.formValue.numRows}
                             hasFeedback/>
            <FormInput.Input type="number" {...inputCssProp} label="Num Cols" placeholder={this.state.formValue.numCols}
                             onChange={this.handleFormChange.bind(this, 'numCols')}
                             model={this.state.formValue.numCols}
                             hasFeedback/>
            <FormInput.Input type="number" {...inputCssProp} label="Num Bombs" placeholder={this.state.formValue.numBombs}
                             onChange={this.handleFormChange.bind(this, 'numBombs')}
                             model={this.state.formValue.numBombs} hasFeedback/>
            <FormInput.Input type="number" {...inputCssProp} label="Num Rovers" placeholder={this.state.formValue.numRovers}
                             onChange={this.handleFormChange.bind(this, 'numRovers')}
                             model={this.state.formValue.numRovers} hasFeedback/>
            <ButtonInput type="submit" value="Start" onClick={InitFormActions.formSubmit}/>
          </form>
        </Panel>
      );
    }
  }
});

module.exports = InitForm;
