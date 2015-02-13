(function(angular) {

  'use strict';

  var mod = angular.module('ngFormLib.controls.formSubmit', []);

  /**
   *  formSubmitted - Executes an expression when the form is valid (essentially a form.submit() handler).
   *
   *  It can be applied to either the form element or to a button.
   *
   */
  mod.directive('formSubmit', ['$parse', function($parse) {
    return {
      restrict: 'A',
      require: ['^form'],   // Get the form controller
      link: function(scope, element, attr, controller) {

        var fn = $parse(attr.formSubmit) || angular.noop,
          isForm = element[0].tagName === 'FORM',
          formController = controller[0];

        element.bind(isForm ? 'submit' : 'click', function(event) {

          formController.setSubmitted(true);

          scope.$apply(function() {
            //scope.$emit('event:FormSubmitAttempted');

            if (formController.$valid) {
              if (fn(scope, {$event: event}) !== false) {
                // Needed by the tracking tool as it clears the input data after a submission.
                // Potentially, form field validation to be done here, but unnecessary at the moment.
                // The reset behaviour can be over-ridden by returning false from the called function(maybe prevent default aswell?)
                formController.setSubmitted(false);
                formController.$setPristine();
              }

            } else {
              event.preventDefault();
            }
          });
        });
      }
    };
  }]);
})(window.angular);
