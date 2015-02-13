describe('FormReset', function() {
  'use strict';

  var compileElement, scope, elem;



  describe('with ngFormLib', function() {

    beforeEach(function() {
      angular.mock.module('ngFormLib.controls.formReset');
      angular.mock.module('ngFormLib.policy');

      inject(function(_$compile_, $rootScope) {
        scope = $rootScope.$new();
        compileElement = function(html) {
          return _$compile_(html)(scope);
        };
      });
    });

    it('should reset the form and clear any values when using a proper model-domain-object expression', function() {
      scope.myModel = {
        testValue2: 'initialValue'
      };

      elem = compileElement('<form name="frm1">' +
                  '<input type="text" name="testVal1" ng-model="myModel.testValue1" />' +
                  '<input type="text" name="testVal2" ng-model="myModel.testValue2" />' +
                  '<button type="button" form-reset="myModel">Cancel</button>' +
                  '</form>');

      // Change the model value
      scope.myModel.testValue1 = 'someVal';
      scope.$digest();

      var inputElem1 = elem.find('input').eq(0);
      var inputElem2 = elem.find('input').eq(1);
      var formController = elem.controller('form');
      // Spy on the setSubmitted function, which should be exist because we are using ngFormLib
      spyOn(formController, 'setSubmitted');

      expect(inputElem1.val()).toEqual('someVal');
      expect(inputElem2.val()).toEqual('initialValue');

      elem.find('button').triggerHandler('click');

      expect(elem.hasClass('ng-pristine')).toEqual(true);
      expect(scope.myModel.testValue1).toEqual(null);
      expect(scope.myModel.testValue2).toEqual('initialValue');
      expect(inputElem1.val()).toEqual('');
      expect(inputElem2.val()).toEqual('initialValue');

      expect(formController.setSubmitted).toHaveBeenCalledWith(false);
    });


    it('should throw an error when form-reset is used without a model-domain-object expression', function() {
      scope.testVal = 'someVal';

      var comp = function() {
        elem = compileElement('<form name="frm2">' +
          '<input type="text" name="testVal" ng-model="testVal" />' +
          '<button type="button" form-reset>Cancel</button>' +
          '</form>');
      };

      expect(function() { comp(); }).toThrow('formReset requires an assignable scope-expression. "" is un-assignable.');
    });
  });

  describe('withOUT ngFormLib', function() {

    beforeEach(function() {
      angular.mock.module('ngFormLib.controls.formReset');

      inject(function(_$compile_, $rootScope) {
        scope = $rootScope.$new();
        compileElement = function(html) {
          return _$compile_(html)(scope);
        };
      });
    });


    it('should reset the form and clear any values when using a proper model-domain-object expression', function() {
      scope.myModel = {
        testValue2: 'initialValue'
      };

      elem = compileElement('<form name="frm1">' +
        '<input type="text" name="testVal1" ng-model="myModel.testValue1" />' +
        '<input type="text" name="testVal2" ng-model="myModel.testValue2" />' +
        '<button type="button" form-reset="myModel">Cancel</button>' +
        '</form>');

      // Change the model value
      scope.myModel.testValue1 = 'someVal';
      scope.$digest();

      var inputElem1 = elem.find('input').eq(0);
      var inputElem2 = elem.find('input').eq(1);
      var formController = elem.controller('form');

      expect(formController.setSubmitted).toBeUndefined();    // setSubmitted is not defined

      expect(inputElem1.val()).toEqual('someVal');
      expect(inputElem2.val()).toEqual('initialValue');

      elem.find('button').triggerHandler('click');

      expect(elem.hasClass('ng-pristine')).toEqual(true);
      expect(scope.myModel.testValue1).toEqual(null);
      expect(scope.myModel.testValue2).toEqual('initialValue');
      expect(inputElem1.val()).toEqual('');
      expect(inputElem2.val()).toEqual('initialValue');
    });
  });

});
