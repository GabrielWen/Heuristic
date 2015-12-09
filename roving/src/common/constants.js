'use strict';

var keyMirror = require('react/lib/keyMirror');

var constants = module.exports = {};

constants.CHANGE_EVENT = 'CHANGE';

constants.ActionType = keyMirror({
  POINT_SET_BOMB: null,
  POINT_SET_DONE: null,
  POINT_FLIPPED: null
});
