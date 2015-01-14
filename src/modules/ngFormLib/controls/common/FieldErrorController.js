(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.common');
  /**
   * The Field Error Controller directive is designed to indicate to the browser when the field is in error
   *  and what the errors are. It applies the form-policy for showing errors
   *
   * It works in tandem with the form controller (and FormPolicy.js) to identify when a form-element has an error, and decorates
   *  the element accordingly.
   *
   * It also toggles the fieldController.fieldState flag, based on the form policy provided
   *
   */

  // INPUT:
  //  <input ... field-error-controller></input>

  // OUTPUT:
  //  <input ... aria-invalid="false/true" aria-describedby="fieldId-errors">


  mod.directive('fieldErrorController', ['formControlService', '$timeout', function (formControlService, $timeout) {

    function updateAriaFeatures(fieldState, element, formName, fieldName) {
      element.attr('aria-invalid', fieldState === 'error');
      var errorElemId = formName + '-' + fieldName + '-errors-aria';

      if (fieldState === 'error') {
        // Use the errorContainer's special ARIA element as the source of the error text
        formControlService.addToAttribute(element, 'aria-describedby', errorElemId);
      } else {
        formControlService.removeFromAttribute(element, 'aria-describedby', errorElemId);
      }
    }

    function updateElementStyle(fieldState, element, formPolicy) {
      element[(fieldState === 'error') ? 'addClass' : 'removeClass'](formPolicy.fieldErrorClass);
      element[(fieldState === 'success') ? 'addClass' : 'removeClass'](formPolicy.fieldSuccessClass);
    }

    function setupCanShowErrorPropertyOnNgModelController(scope, formController, ngModelController, element, name) {
      // Using the form policy, determine when to show errors for this field
      var formPolicy = formController._policy,
        formName = formController.$name,
        fieldName = formName + '.' + name,
        stateConditions = formPolicy.stateDefinitions(formName, fieldName);

      formPolicy.checkForStateChanges(scope, element, name, stateConditions, ngModelController, formController);
    }


    return {
      restrict: 'AE',
      require: ['?ngModel', '?^form', '?^formGroup'],  // Require the formController controller somewhere in the parent hierarchy
      replace: true,
      link: function (scope, element, attr, controllers) {
        // Tried to use a template string, but the model was not binding properly. Using $compile() works :)
        var ngModelController = controllers[0],
          formController = controllers[1],
          formGroupElement = (controllers[2] || {}).$element || element,// This looks for a parent directive called formGroup, which has a controller, which has an $element property
          name = attr.name;


        if (formController) {
          var formName = formController.$name,
            errorBehaviour = formController._applyFormBehaviourOnStateChangePolicy; // returns a function which encapsulates the form policy rules for the behaviour to apply when errors show

          if (ngModelController) {
            setupCanShowErrorPropertyOnNgModelController(scope, formController, ngModelController, element, name);
          }

          // When the error-showing flag changes, update the field style
          scope.$watch(formName + '.' + name + '.fieldState', function (fieldState) {
            updateAriaFeatures(fieldState, element, formName, name);
            updateElementStyle(fieldState, formGroupElement, formController._policy);

            // Apply the error behaviour behaviour
            errorBehaviour.applyBehaviour(element, fieldState, false);
          });

          // Listen to form-submit events, to determine what to focus on too
          scope.$on('event:FormSubmitAttempted', function () {
            // Make sure that the field-level watchers have a chance to fire first, so use a timeout
            $timeout(function () {
              errorBehaviour.applyBehaviour(element, ngModelController.fieldState, true);
            }, 1);
          });
        }
      }
    };
  }]);


  mod.directive('formGroup', [function () {
    return {
      restrict: 'AC',
      controller: ['$scope', '$element', function($scope, $element) {
        this.$element = $element;
      }]
    };
  }]);

})(window.angular);
