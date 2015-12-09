'use strict';

var _lo = require('lodash');
var React = require('react');

var Point = React.createClass({
  propTypes: {
    start: React.PropTypes.bool.isRequired,
    bomb: React.PropTypes.bool.isRequired,
    flipped: React.PropTypes.bool.isRequired
  },
  render: function() {
    var pic = <img src="/static/figures/dot.png" height="5" width="5"/>;

    if (this.props.start === false && this.props.bomb === true) {
      pic = <img src="/static/figures/bombs.gif" height="5" width="5"/>;
    }

    if (this.props.start === true && this.props.bomb === true && this.props.flipped === true) {
      pic = <img src="/static/figures/bombsBurst.jpg" height="10" width="10"/>;
    }

    return (
      <div>
        {pic}
      </div>
    );
  }
});

module.exports = Point;
