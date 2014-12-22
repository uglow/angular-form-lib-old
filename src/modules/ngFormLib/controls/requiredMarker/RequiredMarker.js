(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.requiredMarker', [
    'ngFormLib.controls.common',
    'ngFormLib/controls/requiredMarker/template/RequiredMarkerTemplate.html'
  ]);

  // Add a simple "required" marker that is not read-out by screen readers (as the field should also have a required indicator)
  //
  // INPUT:
  //  <span required-marker></span>
  //  <span required-marker hide="isNotRequired">Some Text</span>

  // OUTPUT:
  //  <span class="required" aria-hidden="true" ng-class="{\'ng-hide\': hide}" ng-transclude=""></span>
  //  <span class="required" aria-hidden="true" ng-class="{\'ng-hide\': hide}" ng-transclude="" hide="isNotRequired">Some Text</span>

  mod.directive('requiredMarker', ['formControlService', function (formControlService) {

    return {
      restrict: 'AE',
      replace: true,
      transclude: true,
      templateUrl: function(element, attr) {
        return attr.template || formControlService.getHTMLTemplate(element, 'requiredMarker');
      },
      scope: {
        hide: '='
      }
    };
  }]);
})(window.angular);
