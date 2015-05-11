'use strict';

describe('when I use the Form Checkbox button it', function() {
  var compileElement, scope, elem;

  beforeEach(function() {
    angular.mock.module('ngFormLib.controls.formCheckbox');

    inject(function(_$compile_, $rootScope) {
      scope = $rootScope.$new();
      compileElement = function(html) {
        return _$compile_(html)(scope);
      };
    });
  });


  it('should create a checkbox with the minimum markup', function() {
    elem = compileElement('<form-checkbox uid="fld" name="btn">My label</form-checkbox>');
    scope.$digest();
    expect(elem.find('input')[0].outerHTML).toEqual('<input type="checkbox" field-error-controller="" id="fld" name="btn" ng-required="false" aria-required="false">');
    expect(elem.find('label')[0].outerHTML).toEqual('<label for="fld"><span ng-transclude=""><span class="ng-scope">My label</span></span><span class="required ng-isolate-scope ng-hide" aria-hidden="true" ng-class="{\'ng-hide\': hide}" ng-transclude="" required-marker="" hide="!(false)"></span></label>');
  });


  it('should create a checkbox with a uid + name + change() + required', function() {
    elem = compileElement('<form-checkbox uid="fld" name="btn" ff-ng-model="state" ff-ng-checked="true" label-class="Amy" ff-aria-label="My label" ff-ng-change="testChange()" required="true"></form-checkbox>');
    scope.$digest();

    // Little bit weird: The checkbox has a ng-checked=true initial state, but the model value 'state' does not exist! So the field looks checked, but it is invalid!
    // In practice, ng-checked should be an expression, or even better, just put a value into the model.
    expect(elem.find('input')[0].outerHTML).toEqual('<input type="checkbox" field-error-controller="" id="fld" name="btn" ng-model="state" ng-checked="true" aria-label="My label" ng-change="testChange()" ng-required="true" aria-required="true" ng-class="{\'checked\': state === true || true}" class="ng-pristine ng-untouched ng-invalid ng-invalid-required checked" required="required" checked="checked">');
    //expect(elem.find('label')[0].outerHTML).toEqual('<label for="fld" class="Amy checked" ng-class="{\'checked\': state === \'undefined\' || true}"><span ng-transclude=""></span><span class="required ng-isolate-scope" aria-hidden="true" ng-class="{\'ng-hide\': hide}" ng-transclude="" hide="!(true)"></span></label>');
  });

});
