'use strict';

var util = require('util');
var express = require('express');
var path = require('path');
var engines = require('consolidate');

var app = express();

app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.get('/', function(req, res) {
  res.render('index.html');
});

app.use('/static', express.static(path.resolve(__dirname, 'static'), {
  etag: true,
  maxAge: 0
}));

var port = process.env.PORT || 8888;

var server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Save Roving listening at http://' + host + ':' + port);
});
