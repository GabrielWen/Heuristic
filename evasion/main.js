'use strict';

var Hunter = require('./src/hunter/Hunter');
var base = require('./src/common/base');
var constants = require('./src/common/constants');

var h = new Hunter(300, 300);

var walls = [];
walls.push(new base.Wall([10, 200], 290, constants.Directions.E, false));
console.log(base.moveHunter([9, 199], [1, 1], walls));
