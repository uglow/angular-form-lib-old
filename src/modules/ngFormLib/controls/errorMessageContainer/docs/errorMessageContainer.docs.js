(function (window, angular) {
  'use strict';

  var mod = angular.module('ngFormLibDocs');

  mod.controller('ErrorMessageContainerDemoController', function () {
    var vm = this;

    vm.titleData = [
      {label: 'Dr'},
      {label: 'Mr'},
      {label: 'Ms'}
    ];
  });

})(window, window.angular);
