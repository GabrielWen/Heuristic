'use strict';

var _lo = require('lodash');

var AppDispatcher = require('../dispatcher');
var BaseStore = require('../common/BaseStore');
var constants = require('../common/constants');

var InitFormStores = BaseStore.createStore({
  setDefaultData: function() {
    this.formValue = _lo.clone(constants.DefaultSetting);
    this.alertInfo = null;
    this.onSubmit = null;
  },

  getState: function() {
    return {
      formValue: this.formValue,
      alertInfo: this.alertInfo
    };
  },

  handleFormChange: function(field, value) {
    var val = this.formValue[field];
    try {
      val = parseInt(value);
    } catch (e) {
      this.alertInfo = {
        bsStyle: 'danger',
        msg: e.message
      };
      this.emitChange();
      return;
    }

    if (val <= 0) {
      this.alertInfo = {
        bsStyle: 'danger',
        msg: 'Input must be greater than zero'
      };
      this.emitChange();
      return;
    }

    this.formValue[field] = val;
    this.emitChange();
  },

  attachOnSubmit: function(cb) {
    this.onSubmit = cb;
  },

  handleFormSubmit: function() {
    if (!_lo.some(this.formValue, _lo.isNumber) || _lo.some(this.formValue, function(n) {return n <= 0;})) {
      this.alertInfo = {
        bsStyle: 'danger',
        msg: 'Invalid input...'
      };
    } else {
      setTimeout(_lo.partial(this.onSubmit, this.formValue));
    }

    this.emitChange();
  }
});

InitFormStores.dispatchToken = AppDispatcher.register(function(action) {
  switch(action.type) {
    case constants.ActionType.INIT_FORM_CHANGE:
      InitFormStores.handleFormChange(action.field, action.value);
      break;
    case constants.ActionType.INIT_FORM_SUBMIT:
      InitFormStores.handleFormSubmit();
      break;
    default:
  }
});

module.exports = InitFormStores;
