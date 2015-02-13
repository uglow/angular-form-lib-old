/* jshint maxstatements:30 */
// See http://pivotal.github.io/jasmine/ for list of matchers (e.g .toEqual(), toMatch())
describe('Error Message Container directive', function() {
  'use strict';
  var compileElement, scope, elem;


  beforeEach(function() {
    angular.mock.module('ngFormLib.policy');
    angular.mock.module('ngFormLib.controls');

    // Use the default form policies that are already defined
    angular.mock.module('ngFormLib.policy.behaviourOnStateChange');
    angular.mock.module('ngFormLib.policy.checkForStateChanges');
    angular.mock.module('ngFormLib.policy.stateDefinitions');

    angular.mock.module('ngFormLib', ['$sceProvider', function($sceProvider) {
      // Just in case the $sceProvider is enabled, we need to disable it for this test (I think?)
      $sceProvider.enabled(false);
    }]);


    inject(function(_$compile_, $rootScope) {
      scope = $rootScope.$new();
      compileElement = function(html) {
        return _$compile_(html)(scope);
      };
    });
  });


  it('should create an error message container with minimum markup', function() {
    elem = compileElement('<form name="frm"><error-container field-name="someName"></error-container></form>');
    scope.$digest();

    //<div class="container-error" id="frm-someName-errors"><span class="sr-only" aria-hidden="true" id="frm-someName-errors-aria"></span></div>
    //<div class="container-error" id="frm-someName-errors"><span class="sr-only" aria-hidden="true" id="frm-someName-errors-aria"></span></div>
    expect(elem.html()).toEqual('<div class="container-error" id="frm-someName-errors"><span class="sr-only" aria-hidden="true" id="frm-someName-errors-aria"></span></div>');
    expect(elem.find('div').length).toEqual(1);
  });


  it('should create error messages when supplied with a field-errors attribute', function() {
    scope.returnFalse = function() { return false; };

    elem = compileElement('<form name="frm" form-submit="returnFalse()">' +
      '<div class="form-group">' +
        '<input type="text" name="someName" ng-pattern="/^\\d{4}$/" ng-model="postcode" field-error-controller>' +
        '<error-container field-name="someName" field-errors="{pattern: \'msg1\', someOtherErrorType: \'msg2\'}"></error-container>' +
      '</div></form>');
    scope.$digest();

    // No actual errors are shown, yet.
    expect(elem.find('div')[1].outerHTML).toEqual('<div class="container-error" id="frm-someName-errors"><span class="sr-only" aria-hidden="true" id="frm-someName-errors-aria"></span></div>');
    expect(elem.find('div').eq(1).find('div').length).toEqual(0);

    // Produce an error by submitting the form with invalid data
    scope.postcode = 'abcd';
    elem.triggerHandler('submit');

    expect(elem.find('input').hasClass('ng-invalid')).toEqual(true);
    expect(elem.find('div').eq(1).find('div').length).toEqual(1);

    expect(elem.find('div').eq(1).find('div')[0].outerHTML).toEqual('<div class="text-error ec2-pattern ng-scope"><span class="text-error-wrap">msg1</span></div>');

    expect(elem.find('div').eq(0).hasClass('has-error')).toEqual(true);   // class-name is from the default form policy

    // Fix the error
    scope.postcode = '1234';
    elem.triggerHandler('submit');

    expect(elem.find('input').hasClass('ng-invalid')).toEqual(false);
    expect(elem.find('div').eq(1).find('div').length).toEqual(0);

    expect(elem.find('div').eq(0).hasClass('has-error')).toEqual(false);   // class-name is from the default form policy
  });


  it('should create error messages when supplied with a text-errors attribute', function() {
    elem = compileElement('<form name="frm">' +
                '<form-input input-type="text" name="someName" uid="x" label="y" ff-ng-model="something"></form-input>' +
                '<error-container field-name="someName" text-errors="[\'msg1\', \'msg2\']"></error-container>' +
                '</form>');
    scope.$digest();

    var errorDiv = elem.find('div').eq(2);

    expect(errorDiv[0].outerHTML).toEqual('<div class="container-error" id="frm-someName-errors"><span class="sr-only" aria-hidden="true" id="frm-someName-errors-aria"></span></div>');

    // When the scope value contains a non-falsy value, it should be displaying the value
    scope.msg1 = 'Some message value';
    scope.$digest();

    expect(errorDiv.find('div').length).toEqual(1);
    expect(errorDiv.find('div')[0].outerHTML).toEqual('<div class="text-error ec2-msg1"><span class="text-error-wrap">Some message value</span></div>');
    expect(errorDiv.find('span').html()).toEqual('. There is 1 error for this field. Error 1, Some message value,');
  });
});
