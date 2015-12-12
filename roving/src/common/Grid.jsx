'use strict';

var _lo = require('lodash');
var util = require('util');
var React = require('react');

var constants = require('./constants');
var Cell = require('./Cell.jsx');

var Grid = React.createClass({
  render: function() {
    if (!this.props.gameInit || _lo.isEmpty(this.props.grid)) {
      return null;
    }

    var ret = [];
    _lo.times(this.props.gameConfig.numRows, function(i) {
      _lo.times(this.props.gameConfig.numCols, function(j) {
        //TODO: How to make it relative?
        var style = {
          top: i * constants.DefaultSetting.picSize + 300,
          left: j * constants.DefaultSetting.picSize,
          position: 'absolute'
        };

        ret.push(
          <div key={util.format('cell-%s-%s', i, j)} style={style} onClick={_lo.partial(this.props.handleClick, i, j)}>
            <Cell state={this.props.grid[i][j]} gameStart={this.props.gameStart}/>
          </div>
        );
      }, this);
    }, this);

    return <div>{ret}</div>;
  }
});

module.exports = Grid;
