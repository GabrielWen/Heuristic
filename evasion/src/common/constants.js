'use strcit';

var constants = module.exports = {};

constants.InitPos = {
  Hunter: [0, 0],
  Prey: [230, 200]
};

/**
 * @enum 
 */
constants.Mark = {
  empty: 0,
  hunter: 1,
  prey: 2,
  wall: 3
};

constants.Directions = {
  N: [0,-1],
  S: [0,1],
  E: [1,0],
  W: [-1,0],
  NE: [1,-1],
  NW: [-1,-1],
  SE: [1,1],
  SW: [-1,1]
};
