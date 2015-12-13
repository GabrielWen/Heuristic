/**
 * @fileoverview Common base class for flux store.
 */
'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _lo = require('lodash');

var constants = require('./constants');


/**
 * Constructor for the Base store class.
 * @param {!Object=} mixin - Optional mixin to attach to the target store.
 * @constructor
 */
function BaseStore(mixin) {
  EventEmitter.call(this);
  _lo.assign(this, mixin);

  this.setDefaultData();
}
util.inherits(BaseStore, EventEmitter);


/**
 * Hook to sets the default data of the store.
 * Will be called in constructor and after last listener is removed.
 */
BaseStore.prototype.setDefaultData = _lo.noop;


/**
 * Emit change event.
 */
BaseStore.prototype.emitChange = function() {
  this.emit(constants.CHANGE_EVENT);
};


/**
 * Hook to allow doing extra work before adding the first listener to change event.
 */
BaseStore.prototype.beforeAddingFirstListener = _lo.noop;


/**
 * Add callback to change event.
 * @param {!Function} callback - callback on event of change.
 */
BaseStore.prototype.addChangeListener = function(callback) {
  if (_lo.isEmpty(this.listeners(constants.CHANGE_EVENT))) {
    this.beforeAddingFirstListener();
  }
  this.on(constants.CHANGE_EVENT, callback);
};


/**
 * Hook to allow doing extra work after removing the last listener from change event.
 */
BaseStore.prototype.afterRemovingLastListener = _lo.noop;


/**
 * Remove listener from change event.
 * @param {!Function} callback - callback to remove from event change
 */
BaseStore.prototype.removeChangeListener = function(callback) {
  this.removeListener(constants.CHANGE_EVENT, callback);
  if (_lo.isEmpty(this.listeners(constants.CHANGE_EVENT))) {
    this.afterRemovingLastListener();
    this.setDefaultData();
  }
};


/**
 * Helper method to allow React style store creation.
 * @param {!Object=} mixin - Optional mixin to attach to the target store.
 * @return {!BaseStore} Created store instance.
 */
BaseStore.createStore = function(mixin) {
  return new BaseStore(mixin);
};


module.exports = BaseStore;
