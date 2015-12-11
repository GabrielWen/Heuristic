'use strict';

var AppDispatcher = require('../dispatcher');
var constants = require('../common/constants');

var InitFormActions = {
  formChange: function(field, value) {
    AppDispatcher.dispatch({
      type: constants.ActionType.INIT_FORM_CHANGE,
      field: field,
      value: value
    });
  },
  formSubmit: function() {
    AppDispatcher.dispatch({
      type: constants.ActionType.INIT_FORM_SUBMIT
    });
  }
};

module.exports = InitFormActions;
