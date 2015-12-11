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
var Grid = require('./components/Grid.jsx');
var Game = React.createClass({
  render: function() {
    return (
      <div>
        <Car isPilotless={true} carLabel={"1"}/>
        <Car isPilotless={true} carLabel={"2"}/>
      <div>
      <Grid/>
    );
  }
});

var routes = (
  <Route name="game" path="/" handler={Game}/>
);

Router.run(routes, function(Handler) {
  React.render(<Handler/>, document.getElementById('gameArea'));
});
