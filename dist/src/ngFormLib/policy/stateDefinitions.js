(function (angular) {
  'use strict';

  // Define the different display trigger implementations available
  var mod = angular.module('ngFormLib.policy.stateDefinitions', []);


  // Error Conditions
  function errorOnSubmit(formName, fieldName) {
    return formName + '._formSubmitAttempted && ' + fieldName + '.$invalid';
  }

  function errorOnDirty(formName, fieldName) {
    return fieldName + '.$dirty && ' + fieldName + '.$invalid';
  }

  function errorImmediately(formName, fieldName) {
    return fieldName + '.$invalid';
  }

  function errorOnSubmitAndDirty(formName, fieldName) {
    return formName + '._formSubmitAttempted && ' + fieldName + '.$dirty && ' + fieldName + '.$invalid';
  }

  function errorOnSubmitOrDirty(formName, fieldName) {
    return '(' + formName + '._formSubmitAttempted || ' + fieldName + '.$dirty) && ' + fieldName + '.$invalid';
  }

  mod.value('formPolicyErrorDefinitionLibrary', (function () {
    return {
      onSubmit: errorOnSubmit,
      onDirty: errorOnDirty,
      immediately: errorImmediately,
      onSubmitAndDirty: errorOnSubmitAndDirty,
      onSubmitOrDirty: errorOnSubmitOrDirty
    };
  })());


  // Success Definitions
  function successOnSubmit(formName, fieldName) {
    return formName + '._formSubmitAttempted && ' + fieldName + '.$valid';
  }

  function successOnDirty(formName, fieldName) {
    return fieldName + '.$dirty && ' + fieldName + '.$valid';
  }

  function successImmediately(formName, fieldName) {
    return fieldName + '.$valid';
  }

  function successOnSubmitAndDirty(formName, fieldName) {
    return formName + '._formSubmitAttempted && ' + fieldName + '.$dirty && ' + fieldName + '.$valid';
  }

  function successOnSubmitOrDirty(formName, fieldName) {
    return '(' + formName + '._formSubmitAttempted || ' + fieldName + '.$dirty) && ' + fieldName + '.$valid';
  }

  mod.value('formPolicySuccessDefinitionLibrary', (function () {
    return {
      onSubmit: successOnSubmit,
      onDirty: successOnDirty,
      immediately: successImmediately,
      onSubmitAndDirty: successOnSubmitAndDirty,
      onSubmitOrDirty: successOnSubmitOrDirty
    };
  })());

    // This 'service' is the default implementation of the check-for-errors policy
  mod.factory('formPolicyStateDefinitions', ['formPolicyErrorDefinitionLibrary', 'formPolicySuccessDefinitionLibrary',
    function(formPolicyErrorDefinitionLibrary, formPolicySuccessDefinitionLibrary) {

      // The FieldErrorController will ask for the stateDefinitions, passing the formName and fieldName as parameters
      return function(formName, fieldName) {
        // Return an object with the stateName(key) and the stateDefinition string(value)
        return {
          'error': formPolicyErrorDefinitionLibrary.onSubmitOrDirty(formName, fieldName),
          'success': formPolicySuccessDefinitionLibrary.onSubmitOrDirty(formName, fieldName)
        };
      };
    }
  ]);
})(window.angular);
