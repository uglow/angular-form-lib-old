(function (window, angular) {
  'use strict';

  var mod = angular.module('ngFormLibDocs');

  mod.controller('FormControlsDemosController', function () {
    var vm = this;

    vm.titleData = [
      {label: 'Dr'},
      {label: 'Mr'},
      {label: 'Ms'}
    ];

    vm.schoolData = [
      {label: 'Primary'},
      {label: 'Secondary'},
      {label: 'Tertiary'}
    ];

    vm.formDemo4 = {
      name: '',
      education: [
        {
          name: 'Melbourne High School',
          type: vm.schoolData[1]
        },
        {
          name: undefined,
          type: undefined
        }
      ]
    };

    vm.addSchool = function() {
      vm.formDemo4.education.push({name: '', type: undefined});
    };
  });

})(window, window.angular);
