(function(window, angular) {
  'use strict';

  var mod = angular.module('ngFormLibDocs');

  mod.controller('FormSubmitDemoController', function() {
    var vm = this;

    vm.callWhenValid = function() {
      window.alert('Form is valid');
    };
  });

})(window, window.angular);
