/* jshint maxstatements:30 */
// See http://jasmine.github.io/1.3/introduction.html for list of matchers (e.g .toEqual(), toMatch())
describe('Form Policy Service', function () {
  'use strict';

  /**
   * We are actually testing quite a few directives, as they work together to create the behaviour we want
   */

  var compileElement, scope, elem;

  beforeEach(function() {
    angular.mock.module('ngFormLib.controls');
    angular.mock.module('ngFormLib.policy.checkForStateChanges');
    angular.mock.module('ngFormLib.policy.stateDefinitions');
    angular.mock.module('ngFormLib', ['$sceProvider', function ($sceProvider) {
      $sceProvider.enabled(false);
    }]);

    inject(function(_$compile_, $rootScope) {
      scope = $rootScope.$new();
      compileElement = function(html) {
        return _$compile_(html)(scope);
      };
    });
  });


  describe('Form Policy 5 - show errors on blur but once form submitted, show them immediately', function () {

    var $compile, scope;
    var PATTERN_ERROR = 'Pattern error', REQUIRED_ERROR = 'Required error',
      VALID_DATA = '1234', INVALID_DATA = '123';

    var elementText = '<form name="frm" form-submit="returnFalse()">' +
      '<input name="fld" type="text" ng-model="postcode" field-error-controller ng-required="true" ng-pattern="/^\\d{4}$/">' +
      '<error-container field-name="fld" ' +
      'field-errors="{required: \'' + REQUIRED_ERROR + '\', pattern: \'' + PATTERN_ERROR + '\'}" ' +
      'text-errors="[\'someData\']" ' +
      '></error-container>' +
      '</form>';
    var elem, errorDiv, inputElem = 'An error occurred';


    function compileFieldTemplate($c, $r, htmlStr) {
      $compile = $c;
      scope = $r.$new();

      scope.returnFalse = function () { return false; };

      elem = angular.element(htmlStr);
      $compile(elem)(scope);
      scope.$digest();

      errorDiv = elem.find('div').eq(0);
      inputElem = elem.find('input');
    }

    // beforeEach(angular.mock.module('form.controls.forminput.template'));
    beforeEach(function() {


      inject(function($compile, $rootScope) {
        compileFieldTemplate($compile, $rootScope, elementText);
      });
    });



    it('should show errors when the field loses focus, but after the form is submitted, it should show the errors immediately', function () {
      // Initially, there are no errors
      expect(errorDiv.find('div').length).toEqual(0);
      expect(errorDiv.find('div').find('span').text()).toEqual('');

      inputElem.val(INVALID_DATA).triggerHandler('change');

      expect(errorDiv.find('div').length).toEqual(0);
      expect(errorDiv.find('div').find('span').text()).toEqual('');  // Pattern error is not shown yet, not until blur

      // Trigger blur event, error appears
      inputElem.triggerHandler('blur');

      expect(errorDiv.find('div').length).toEqual(1);
      expect(errorDiv.find('div').find('span').text()).toEqual(PATTERN_ERROR);

      // Fix the error, the error appears fixed immediately (occurs because an error is already showing - see subsequent test)
      inputElem.val(VALID_DATA).triggerHandler('change');

      expect(errorDiv.find('div').length).toEqual(0);
      expect(errorDiv.find('div').find('span').text()).toEqual('');

      // Trigger a blur to finish our editing
      inputElem.triggerHandler('blur');

      // Now that no errors are showing, we can change the field again and nothing will appear until we BLUR or SUBMIT
      inputElem.val('').triggerHandler('change');

      expect(errorDiv.find('div').length).toEqual(0);
      expect(errorDiv.find('div').find('span').text()).toEqual('');

      // Now submit the form and see the error change to REQUIRED
      elem.triggerHandler('submit');

      expect(errorDiv.find('div').length).toEqual(1);
      expect(errorDiv.find('div').find('span').text()).toEqual(REQUIRED_ERROR);

      // Now, as soon as the field changes, the errors appear immediately...
      inputElem.val(INVALID_DATA).triggerHandler('change');

      expect(errorDiv.find('div').length).toEqual(1);
      expect(errorDiv.find('div').find('span').text()).toEqual(PATTERN_ERROR);
    });


    it('should show errors when the field loses focus, and when an error is showing, other errors can show on-change', function () {
      // Initially, there are no errors
      expect(errorDiv.find('div').length).toEqual(0);
      expect(errorDiv.find('div').find('span').text()).toEqual('');

      inputElem.val(INVALID_DATA).triggerHandler('change');

      expect(errorDiv.find('div').length).toEqual(0);
      expect(errorDiv.find('div').find('span').text()).toEqual('');  // Pattern error is not shown yet, not until blur

      // Trigger blur event
      inputElem.triggerHandler('blur');

      expect(errorDiv.find('div').length).toEqual(1);
      expect(errorDiv.find('div').find('span').text()).toEqual(PATTERN_ERROR);

      // Now change the value but don't change focus. Because there is already an error showing, this other error appears immediately.
      // Not terrible behaviour, but initially unexpected when designing this.
      inputElem.val('').triggerHandler('change');

      expect(errorDiv.find('div').length).toEqual(1);
      expect(errorDiv.find('div').find('span').text()).toEqual(REQUIRED_ERROR);
    });
  });


  describe('Form Field elements', function() {

    it('should not throw an error when the element does not have a FORM parent (with a form-controller)', function() {
      function shouldWork() {
        elem = compileElement('<input type="text">');
      }
      expect(shouldWork).not.toThrow();
    });

    // We should check what happens when: multiple form elements with the same name, destroying form element...
  });
});
