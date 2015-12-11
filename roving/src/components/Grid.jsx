'use strict';

var _lo = require('lodash');
var util = require('util');
var React = require('react');
var Table = require('react-bootstrap').Table;
var Alert = require('react-bootstrap').Alert;
var Button = require('react-bootstrap').Button;

var constants = require('../common/constants');

function initGrid(numRows, numCols) {
  var ret = [];

  _lo.times(numRows, function(i) {
    _lo.times(numCols, function(j) {
      ret.push(<Cell key={util.format('%s-%s', i, j)} start={false} bomb={false} flipped={false} i={i} j={j}/>);
    });
  });

  return ret;
}

var Grid = React.createClass({
  handleClick: function(i, j) {
    console.log(util.format('Grid Handle Click: %s %s', i, j));
  },
  renderGrid: function(numRows, numCols) {
    var ret = [];

    _lo.times(numRows, function(i) {
      _lo.times(numCols, function(j) {
        ret.push(<Cell key={util.format('%s-%s', i, j)} start={false} bomb={false} flipped={false} i={i} j={j} handleClick={this.handleClick}/>);
      }, this);
    }, this);

    return ret;
  },
  render: function() {
    //TODO: Fix table size
    if (_lo.isEmpty(this.props.gameConfig)) {
      return <Alert bsStyle="warning">Game Not Yet Set...</Alert>;
    }
    var gameConfig = this.props.gameConfig;

    var style = {
      width: this.props.numCols * 20,
      height: this.props.numRows * 20
    };

    var mapStyle = {
      top: 40,
      position: 'relative'
    };

    return (
      <div>
        <Button onClick={_lo.partial(this.handleClick, 100, 101)} bsStyle="danger">TEST</Button>
        <div style={mapStyle}>{this.renderGrid(gameConfig.numRows, gameConfig.numCols)}</div>
      </div>
    );
  }
});

var Cell = React.createClass({
  propTypes: {
    start: React.PropTypes.bool.isRequired,
    bomb: React.PropTypes.bool.isRequired,
    flipped: React.PropTypes.bool.isRequired
  },
  handleClick: function() {
    console.log('Cell TEST!!!');
  },

  render: function() {
    var pic = <img src={constants.Figures.dot} width={constants.DefaultSetting.picSize} height={constants.DefaultSetting.picSize}/>;

    if (!this.props.start && this.props.bomb) {
      pic = <img src={constants.Figures.bomb}/>;
    }

    if (this.props.start && this.props.bomb && this.props.flipped) {
      pic = <img src={constants.Figures.bombBurst}/>;
    }

    var style = {
      top: this.props.i * constants.DefaultSetting.picSize,
      left: this.props.j * constants.DefaultSetting.picSize,
      position: 'absolute'
    };

    return <div onClick={this.handleClick} style={style}>{pic}</div>;
  }
});

module.exports = Grid;
