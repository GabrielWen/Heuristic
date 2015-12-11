'use strict';

var _lo = require('lodash');
var Router = require('react-router');
var React = require('react');
var Table = require('react-bootstrap').Table;

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var Grid = require('./components/Grid.jsx');
var Game = require('./components/Game.jsx');

var App = React.createClass({
  render: function() {
    
    return <Game/>;
  }
});

var routes = (
  <Route name="game" path="/" handler={App}/>
);

Router.run(routes, function(Handler) {
  React.render(<Handler/>, document.getElementById('gameArea'));
});
