'use strict';

var _lo = require('lodash');
var Router = require('react-router');
var React = require('react');
var Table = require('react-bootstrap').Table;

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var Point = require('./common/Point.jsx');
var Car = require('./common/Car.jsx');

var Game = React.createClass({
  render: function() {

    return (
      <div>
        <Point start={false} bomb={false} flipped={false}/>
        <Car isPilotless={true} carLabel={"1"}/>
        <Point start={false} bomb={true} flipped={false}/>
        <Point start={true} bomb={true} flipped={false}/>
        <Car isPilotless={true} carLabel={"2"}/>
        <Point start={true} bomb={true} flipped={true}/>
        <Car isPilotless={false}/>
      </div>
    );
  }
});

var routes = (
  <Route name="game" path="/" handler={Game}/>
);

Router.run(routes, function(Handler) {
  React.render(<Handler/>, document.getElementById('gameArea'));
});
