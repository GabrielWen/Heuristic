'use strict';

var React = require('react');
var Input = require('react-bootstrap').Input;
var _lo = require('lodash');

var FormInput = {};

FormInput.Input = React.createClass({
  getInitialState: function() {
    return {
      isValid: true
    };
  },
  propTypes: {
    model: React.PropTypes.any,
    onChange: React.PropTypes.func.isRequired,
    isValid: React.PropTypes.bool
  },
  shouldComponentUpdate: function(nextProps, nextStates) {
    return (nextProps.model != this.props.model || nextStates.isValid != this.state.isValid);
  },
  handleStateUpdate: function() {
    this.setState({
      isValid: this.getInputDOMNode().checkValidity()
    });
  },
  componentDidMount: function() {
    this.handleStateUpdate();
  },
  componentDidUpdate: function() {
    this.handleStateUpdate();
  },
  getInputDOMNode: function() {
    return this.refs.input.getInputDOMNode();
  },
  validationState: function() {
    var isValid = _lo.isUndefined(this.props.isValid) ? this.state.isValid : this.props.isValid;
    return isValid ? 'success' : 'error';
  },
  handleChange: function(event) {
    var isValid = this.refs.input.getInputDOMNode().checkValidity();
    this.setState({isValid: isValid});
    this.props.onChange(this.refs.input.getValue(), isValid);
  },
  render: function() {
    return (
      <Input {...this.props} value={this.props.model} onChange={this.handleChange}
             bsStyle={this.validationState()}
             ref='input'/>
    );
  }
});

module.exports = FormInput;
