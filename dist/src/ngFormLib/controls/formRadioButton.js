(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.formRadioButton', [
    'ngFormLib.controls.common',
    'ngFormLib.controls.errorMessageContainer'
  ]);

  // INPUT:
  //  <form-radio-button uid="fld" name="name" aria-label="Book Type" label-class="btn btn-toggle"
  //    ff-class="someCSS" ff-ng-model="application.bookType" ff-value="Fiction" ng-click="loadFiction()" class="span6">
  //     <icon class="icon-fiction"></icon>Fiction
  //  </form-radio-button>

  // OUTPUT:


  mod.directive('formRadioButton', ['formControlService', function (formControlService) {

    return formControlService.buildDirective({
      controlName: 'formRadioButton',
      templateType: 'templateUrl',
      expectedTemplateElements: ['input', 'label', 'div'],
      expectedAttributes: [], // The template should NOT have a form-group element inside it, as this has to be specified externally (due to the group-nature of radio buttons)
      configFn: function(tElement, tAttr, id, name, inputElem) {
        // Move the class attribute from the outer-DIV to the radio-button DIV (special case)
        var rbDiv = tElement.find('div');
        rbDiv.addClass(tElement.attr('class'));
        tElement.removeAttr('class');

        formControlService.createErrorFeatures(tElement, inputElem, name, '', tAttr.fieldErrors, tAttr.textErrors);
        formControlService.buildNgClassExpression(inputElem, inputElem);  // Put the ng-class onto the input element itself, as this makes styling easier
      }
    });

  }]);
})(window.angular);

angular.module('ngFormLib/controls/formRadioButton/template/FormRadioButtonTemplate.html', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ngFormLib/controls/formRadioButton/template/FormRadioButtonTemplate.html',
    "<div><div class=radio><input type=radio field-error-controller><label><span ng-transclude></span></label></div></div>"
  );

}]);
