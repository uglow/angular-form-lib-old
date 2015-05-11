(function(win, angular) {
  'use strict';

  // Helper functions
  var timeoutPromise, scrollPromise;

  function setFocusOnField($document, $timeout, duration, element, offset) {
    // If no offsetHeight then assume it's invisible and let the next error field take the scroll position
    // Safe because no element will ever have offsetTop of 0 due to our header
    if (element[0].offsetHeight) {
      //console.log('Error focus set to: ' + domElement.id);
      $timeout.cancel(timeoutPromise);
      $timeout.cancel(scrollPromise);   // This doesn't seem to make a difference on a Mac - user-generated scrolling does not get cancelled
      timeoutPromise = $timeout(function() { element[0].focus();}, duration);
      scrollPromise = $document.scrollToElement(element, offset, duration);  // scrollToElement() comes from the angular-scroll directive // No offset
      return true;
    }
    return false; // Indicate that we did NOT set the focus
  }



  /**
   * Returns a function that can be called when an error is showing FOR THIS FIELD. The function is dynamically created
   *  based on the form policy.
   *
   *  The dynamic function sets the focus if the form policy allows it to
   *  The input parameters are:
   *    - DOMElement of the current form-field control that could get focus
   *    - whether an error is showing on the form-field
   *    - whether the form was just attempted to be submitted
   *
   *  The returned function is stored against the form controller as _applyFormFocusPolicy(...)
   *  _applyFormFocusPolicy() should be called by the field-error-controller directive whenever the field state changes,
   *   and when a form-submit event occurs.
   */
  angular.module('ngFormLib.policy.behaviourOnStateChange', ['duScroll'])
    .service('formPolicyBehaviourOnStateChangeLibrary', ['$document', '$timeout', 'duScrollDuration',
      function($document, $timeout, duScrollDuration) {

        // Policy implementation functions
        function behaviourOnErrorFocusFirstField(formController) {
          // We want to pretend that there is a single controller for the form, for the purpose of managing the focus.
          // Otherwise, the main form sets the focus, then the subform (ng-form) also sets the focus
          var focusController = formController._parentController || formController;

          return {
            // This function is called by the fieldErrorController when the fieldState changes and when the form is submitted
            applyBehaviour: function(fieldElem, fieldState, formSubmitAttempted) {
              // Set the focus to the field if there is an error showing and a form-submit has been attempted
              if (fieldState === 'error' && formSubmitAttempted) {
                // ...and if the focusErrorElement is blank...
                if (!focusController._focusErrorElement && setFocusOnField($document, $timeout, duScrollDuration, fieldElem, formController._policy.fieldFocusScrollOffset)) {
                  focusController._focusErrorElement = fieldElem;
                }
              }
            },
            resetBehaviour: function() {
              focusController._focusErrorElement = null;
            }
          };
        }

        return {
          onSubmitFocusFirstFieldIfError: behaviourOnErrorFocusFirstField
        };
      }
    ])
    .factory('formPolicyBehaviourOnStateChange', ['formPolicyBehaviourOnStateChangeLibrary', function(formPolicyBehaviourOnStateChangeLibrary) {
      return formPolicyBehaviourOnStateChangeLibrary.onSubmitFocusFirstFieldIfError;
    }]);
})(window, window.angular);
