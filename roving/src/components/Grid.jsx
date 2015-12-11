'use strict';

var _lo = require('lodash');
var React = require('react');
var Table = require('react-bootstrap').Table;

var constants = require('../common/constants');
var Car = require('../common/Car.jsx');

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
    var count = 0;
    _lo.times(numCols, function(j) {
      row.push(<td><Car isPilotless={true} carLabel={count.toString()}/></td>);
      count ++;
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
