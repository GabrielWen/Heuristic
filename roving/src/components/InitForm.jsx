'use strict';

var _lo = require('lodash');
var React = require('react');
var Panel = require('react-bootstrap').Panel;
var Button = require('react-bootstrap').Button;
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
    //TODO: Set onSubmit
  },
  componentWillUnmount: function() {
    InitFormStores.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(InitFormStores.getState());
  },

  handleFormChange: InitFormActions.formChange.bind(InitFormActions),
  render: function() {
    var inputCssProp = {
      'labelClassName': 'col-xs-2',
      'wrapperClassName': 'col-xs-3'
    };

    var alertField = this.state.alertInfo ? (<Alert bsStyle={this.state.alertInfo.bsStyle}>{this.state.alertInfo.msg}</Alert>) : null;

    return (
      <Panel header={"Game Setting"}>
        {alertField}
        <form className="form-horizontal">
          <FormInput.Input type="number" {...inputCssProp} label="Num Rows" placeholder={this.state.formValue.numRows}
                           onChange={this.handleFormChange.bind(this, 'numRows')}
                           model={this.state.formValue.numRows}
                           hasFeedback/>
          <FormInput.Input type="number" {...inputCssProp} label="Num Cols" placeholder={this.state.formValue.numCols}
                           onChange={this.handleFormChange.bind(this, 'numCols')}
                           model={this.state.formValue.numCols}
                           hasFeedback/>
          <FormInput.Input type="number" {...inputCssProp} label="Num of Bombs" placeholder={this.state.formValue.numBombs}
                           onChange={this.handleFormChange.bind(this, 'numBombs')}
                           model={this.state.formValue.numBombs} hasFeedback/>
          <FormInput.Input type="number" {...inputCssProp} label="Num of pilotless Rover" placeholder={this.state.formValue.numRovers}
                           onChange={this.handleFormChange.bind(this, 'numRovers')}
                           model={this.state.formValue.numRovers} hasFeedback/>
        </form>
        <Button bsStyle="primary" onClick={InitFormActions.formSubmit} bsSize="small">Submit</Button>
      </Panel>
    );
  }
});

module.exports = InitForm;
