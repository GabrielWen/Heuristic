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
