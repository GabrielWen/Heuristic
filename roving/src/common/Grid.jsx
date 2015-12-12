'use strict';

var _lo = require('lodash');
var util = require('util');
var React = require('react');
var Table = require('react-bootstrap').Table;

var constants = require('./constants');
var Cell = require('./Cell.jsx');

var Grid = React.createClass({
  render: function() {
    if (!this.props.gameInit || _lo.isEmpty(this.props.grid)) {
      return null;
    }

    var pics = [];
    _lo.times(this.props.gameConfig.numRows, function(i) {
      _lo.times(this.props.gameConfig.numCols, function(j) {
        var picStyle = 'grid-style';
        if (i == this.props.curr[0] && j == this.props.curr[1]) {
          picStyle += ' curr-chosen';
        } else {
          picStyle += ' curr-not-chosen';
        }
        pics.push(<Cell key={util.format('cell-%s-%s', i, j)} state={this.props.grid[i][j]} gameStart={this.props.gameStart}
                        handleClick={_lo.partial(this.props.handleClick, i, j)} picStyle={picStyle}
                  />);
      }, this);
    }, this);

    var gridWidth = {
      width: this.props.gameConfig.numCols * constants.DefaultSetting.picSize + 10
    };

    return <div style={gridWidth}>{pics}</div>;
  }
});

module.exports = Grid;
