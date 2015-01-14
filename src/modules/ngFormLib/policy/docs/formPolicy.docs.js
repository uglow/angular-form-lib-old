(function (angular) {
  'use strict';

  angular.module('ngFormLibDocs')

    .controller('FormPolicyDemoCtrl', ['formPolicyCheckForStateChangesLibrary', function (formPolicyCheckForStateChangesLibrary) {

      var vm = this;

      vm.titleData = [
        {label: 'Dr'},
        {label: 'Mr'},
        {label: 'Ms'}
      ];

      vm.myCustomPolicy = {
        checkForStateChanges: formPolicyCheckForStateChangesLibrary.onChange
      };

    }]);
})(window.angular);
