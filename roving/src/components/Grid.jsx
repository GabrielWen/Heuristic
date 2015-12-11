'use strict';

var _lo = require('lodash');
var util = require('util');
var React = require('react');
var Table = require('react-bootstrap').Table;

var constants = require('../common/constants');

function heads(numCols) {
  var cols = [];
  _lo.times(numCols, function(n) {
    cols.push(<th key={util.format('thead-%s', n)}/>);
  });

  return <thead>{cols}</thead>;
}

function initGrid(numRows, numCols) {
  var ret = [];

  _lo.times(numRows, function(i) {
    var row = [];
    _lo.times(numCols, function(j) {
      row.push(<Cell key={util.format('%s-%s', i, j)} start={false} bomb={true} flipped={false}/>);
    });
    ret.push(<tr key={i}>{row}</tr>);
  });

  return ret;
}

var Grid = React.createClass({
  render: function() {
    //TODO: Fix table size
    var map = initGrid(5, 4);

    var gameGrid = (
      <Table>
        {heads(4)}
        <tbody>
          {map}
        </tbody>
      </Table>
    );

    return (
      <div>
        <p>From Grid</p>
        {gameGrid}
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
  onClick: function() {
    console.log('Cell TEST!!!');
  },

  render: function() {
    var pic = <img src={constants.Figures.dot}/>;

    if (!this.props.start && this.props.bomb) {
      pic = <img src={constants.Figures.bomb}/>;
    }

    if (this.props.start && this.props.bomb && this.props.flipped) {
      pic = <img src={constants.Figures.bombBurst}/>;
    }

    return <td onClick={this.onClick}>{pic}</td>;
  }
});

module.exports = Grid;
