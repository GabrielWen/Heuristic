'use strict';

var _lo = require('lodash');
var React = require('react');

var Car = React.createClass({
  propTypes: {
    isPilotless: React.PropTypes.bool.isRequired,
    carLabel: React.PropTypes.string
  },
  render: function() {
    if (this.props.isPilotless === true) {
      return (
        <div className="image">
          <img src="/static/figures/pilotlessRoverII.png" height="40" width="40" alt=""/>
          <p>{this.props.carLabel}</p>
        </div>
      );
    } else {
      return (
        <div>
          <img src="/static/figures/spaceShip.jpg" height="40" width="40"/>
        </div>
      );
    }
  }
});

module.exports = Car;
