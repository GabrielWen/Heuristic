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

    var gridStyle = {
      width: util.format('%spx', this.props.gameConfig.numCols * constants.DefaultSetting.picSize),
      height: util.format('%spx', this.props.gameConfig.numRows * constants.DefaultSetting.picSize)
    };

    var ret = [];
    _lo.times(this.props.gameConfig.numRows, function(i) {
      _lo.times(this.props.gameConfig.numCols, function(j) {
        var className = '';
        if (!_lo.isEmpty(this.props.curr) && i == this.props.curr[0] && j == this.props.curr[1]) {
          className = 'curr-chosen';
        }

        ret.push(
          <div className={className} key={util.format('cell-%s-%s', i, j)} onClick={_lo.partial(this.props.handleClick, i, j)}>
            <Cell state={this.props.grid[i][j]} gameStart={this.props.gameStart}/>
          </div>
        );
      }, this);
    }, this);

    console.log(gridStyle);

    return <div className="grid-style" style={gridStyle}>{ret}</div>;
  }
});

module.exports = Grid;
