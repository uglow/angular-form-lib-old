(function (angular) {
  'use strict';

  // Policy implementation functions
  function checkForStateChangesOnBlurUntilSubmitThenOnChange(scope, element, name, stateDefinitions, ngModelController) {
    var errorWatch;

    scope.$on('event:FormSubmitAttempted', function () {
      (errorWatch || angular.noop)(); // Remove the error watcher, which may-or-may-not be present
      errorWatch = watchForErrorChanges(scope, stateDefinitions, ngModelController);
      //console.log('heard formSubmitAttempted');
    });


    // Listen for the form reset event and cancel the submit-watcher
    scope.$on('event:FormReset', function () {
      (errorWatch || angular.noop)(); // Remove the error watcher, which may-or-may-not be present
      //console.log('heard formReset');
    });

    watchForBlurEvent(scope, element, name, stateDefinitions, ngModelController);
  }


  function checkForStateChangesOnChange(scope, element, name, stateDefinitions, ngModelController) {
    // Watch the error condition for changes, and flag the field as inErrorShowing when the errorCondition is true
    watchForErrorChanges(scope, stateDefinitions, ngModelController);
  }

  function checkForStateChangesOnBlur(scope, element, name, stateDefinitions, ngModelController) {
    watchForBlurEvent(scope, element, name, stateDefinitions, ngModelController);
  }


  // Helper methods
  function createWatch(scope, ngModelController, stateName, stateCondition) {
    scope.$watch(stateCondition, function (value) {
      if (value === true) {
        ngModelController.fieldState = stateName;       // THIS IS THE KEY FLAG
        //console.log('A: ' + stateCondition + ' = ' + value);
      }
    });
  }

  function watchForErrorChanges(scope, stateDefinitions, ngModelController) {
    // Set up a watch for each state definition... expensive?
    for (var stateName in stateDefinitions) {
      createWatch(scope, ngModelController, stateName, stateDefinitions[stateName]);
    }
  }

  function evaluateFieldStates(scope, stateDefinitions, ngModelController) {
    for (var prop in stateDefinitions) {
      if (scope.$eval(stateDefinitions[prop]) === true) {
        ngModelController.fieldState = prop;
        //console.log('B: ' + stateDefinitions[prop] + ' = ' + prop);
        break;
      }
    }
  }

  function watchForBlurEvent(scope, element, fieldName, stateDefinitions, ngModelController) {
    // Determine the initial field state. First state to evaluate to TRUE wins
    evaluateFieldStates(scope, stateDefinitions, ngModelController);

    element.bind('blur', function ngShowWatchAction() {
      evaluateFieldStates(scope, stateDefinitions, ngModelController);
      scope.$apply(); // We are in a jQueryLite handler and have changed a scope property - fire the watchers!
    });
  }

  // Define the different display trigger implementations available
  angular.module('ngFormLib.policy.checkForStateChanges', [])
    .constant('formPolicyCheckForStateChangesLibrary', (function () {
      return {
        onChange: checkForStateChangesOnChange,
        onBlur: checkForStateChangesOnBlur,
        onBlurUntilSubmitThenOnChange: checkForStateChangesOnBlurUntilSubmitThenOnChange
      };
    })())

    // This 'service' is the default implementation of the check-for-errors policy
    .factory('formPolicyCheckForStateChanges', ['formPolicyCheckForStateChangesLibrary', function(formPolicyCheckForStateChangesLibrary) {
      return formPolicyCheckForStateChangesLibrary.onBlurUntilSubmitThenOnChange;
    }]);

})(window.angular);
