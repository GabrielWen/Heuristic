'use strict';

var Hunter = require('./src/hunter/Hunter');
var base = require('./src/common/base');
var constants = require('./src/common/constants');

var h = new Hunter(300, 300);

var walls = [];
//Basic test
walls.push(new base.Wall([10, 200], 290, constants.Directions.E, false));
console.log(base.moveHunter([100, 199], [1, 1], walls));
console.log(base.moveHunter([9, 200], [1, 1], walls));
console.log(base.moveHunter([9, 199], [1, 1], walls));

//Check corner case
walls = [];
walls.push(new base.Wall([10, 40], 30, constants.Directions.E, false));
walls.push(new base.Wall([10, 41], 30, constants.Directions.E, false));
console.log(base.moveHunter([41, 41], [-1, -1], walls));

//Check when hitting corner
walls = [];
walls.push(new base.Wall([1, 300], 300, constants.Directions.E, false));
walls.push(new base.Wall([300, 1], 300, constants.Directions.S, false));
console.log(base.moveHunter([299, 299], [1, 1], walls));

