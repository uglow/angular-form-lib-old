(function(window, angular) {
  'use strict';

  var mod = angular.module('ngFormLibDocs');

  mod.controller('FormCheckboxDemoController', function() {
    var vm = this;

    vm.titleData = [
      {label: 'Dr'},
      {label: 'Mr'},
      {label: 'Ms'}
    ];
  });

})(window, window.angular);
