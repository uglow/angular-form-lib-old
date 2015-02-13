(function(window, angular) {
  'use strict';

  var mod = angular.module('ngFormLibDocs');

  mod.controller('FormResetDemoController', function() {
    var vm = this;

    vm.titleData = [
      {label: 'Dr'},
      {label: 'Mr'},
      {label: 'Ms'}
    ];

    // Demonstrate the reset directive with non-empty data models
    vm.data = {
      name: 'Not-empty-initially',
      title: vm.titleData[2]
    };
  });

})(window, window.angular);
