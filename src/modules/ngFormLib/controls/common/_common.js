(function(angular) {
  'use strict';

  angular.module('ngFormLib.controls.common', [
    'common.utility',
    'ngFormLib.controls.requiredMarker',
    // Template-modules (HTML that is converted into an Angular template)
    'ngFormLib/controls/formCheckbox/template/FormCheckboxTemplate.html',
    'ngFormLib/controls/formDate/template/FormDateInputTemplate.html',
    'ngFormLib/controls/formRadioButton/template/FormRadioButtonTemplate.html',
    'ngFormLib/controls/formSelect/template/FormSelectTemplate.html'
  ]);

})(window.angular);
