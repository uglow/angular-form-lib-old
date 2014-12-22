(function (window, angular) {
  'use strict';

  var mod = angular.module('ngFormLibDocs');

  mod.controller('FormRadioButtonDemoController', function () {
    var vm = this;

    vm.titleData = [
      {label: 'Amazing Spiderman, The'},
      {label: 'Batman'},
      {label: 'Catwoman'}
    ];

    vm.data2 = {
      radioVal: 2   // No initial value
    };

    vm.customReset = function(formField, defaultFn) {
      if (formField.$name === 'formRadio1_group2') {
        formField.$setViewValue(2);
      } else {
        defaultFn(formField);
      }
    };


  });

})(window, window.angular);
