'use strict';

var _lo = require('lodash');

var AppDispatcher = require('../dispatcher');
var BaseStore = require('../common/BaseStore');

var PointStores = BaseStore.createStore({

});

Appdispatcher.register(function(action) {
  switch(action.type) {
    case 'TEST':
      console.log('TEST');
  }
});

module.exports = PointStores;
