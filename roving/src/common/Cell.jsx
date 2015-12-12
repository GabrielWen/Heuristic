'use strict';

var React = require('react');

var constants = require('./constants');

var Cell = React.createClass({
  render: function() {
    var img = '';
    switch(this.props.state) {
      case constants.State.CLEAR:
        img = constants.Figures.dot;
        break;
      case constants.State.BOMB:
        img = this.props.gameStart ? constants.dot : constants.Figures.bombs;
        break;
      case constants.State.BURST:
        img = constants.Figures.burst;
        break;
      case constants.State.ROVER:
        img = constants.Figures.rover;
        break;
      case constants.State.PLAYER:
        img = constants.Figures.player;
        break;
      case constants.State.DEST:
        //TODO
        break;
      default:
    }

    return <img src={img} width={constants.DefaultSetting.picSize} height={constants.DefaultSetting.picSize}/>;
  }
});

module.exports = Cell;
