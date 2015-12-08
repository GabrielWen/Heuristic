'use strict';

var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var React = require('react');
var Button = require('react-bootstrap').Button;

var Game = React.createClass({
  render: function() {
    return (
      <div>
        <h1>JSX TEST</h1>
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
