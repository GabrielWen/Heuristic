'use strict';

var _lo = require('lodash');
var React = require('react');
var Table = require('react-bootstrap').Table;

var constants = require('../common/constants');

function heads(numCols) {
  var cols = [];
  _lo.times(numCols, function() {
    cols.push(<th/>);
  });

  return <thead>{cols}</thead>;
}

function initGrid(numRows, numCols) {
  var ret = [];

  _lo.times(numRows, function(i) {
    var row = [];
    _lo.times(numCols, function(j) {
      row.push(<td><img src={constants.Figures.bomb}/></td>);
    });
    ret.push(<tr>{row}</tr>);
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

module.exports = Grid;
