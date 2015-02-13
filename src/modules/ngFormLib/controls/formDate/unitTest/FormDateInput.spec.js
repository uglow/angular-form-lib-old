'use strict';

describe('Date Directives spec,', function() {

  var compileElement, scope, elem, DateUtil;

  beforeEach(function() {
    angular.mock.module('ngFormLib.controls.formDate');

    inject(function(_$compile_, $rootScope, _DateUtil_) {
      scope = $rootScope.$new();
      compileElement = function(html) {
        return _$compile_(html)(scope);
      };
      DateUtil = _DateUtil_;
    });
  });

  describe('formDateFormat', function() {

    function testDate(element, testData) {

      scope.$digest();

      var inputElem = element.find('input');

      // Initially it is blank
      expect(inputElem.val()).toEqual('');
      expect(inputElem.hasClass('ng-dirty')).toEqual(false);
      expect(inputElem.hasClass('ng-invalid-date')).toEqual(false);

      for (var i = 0; i < testData.length; i++) {
        inputElem.val(testData[i].input).triggerHandler('change');
        //scope.$digest();

        expect(inputElem.val()).toEqual(testData[i].output);

        for (var c = 0; c < testData[i].expectedClasses.length; c++) {
          //console.log(inputElem[0].outerHTML);
          expect(inputElem.hasClass(testData[i].expectedClasses[c])).toEqual(true);
        }
      }
    }

    it('should validate an ordinary input field which must be a date, no other restrictions', function() {
      var testData = [
        {input: '02',         output: '02',         expectedClasses: ['ng-invalid', 'ng-invalid-date'], desc: 'Partial date'},
        {input: '02/01/1900', output: '02/01/1900', expectedClasses: ['ng-valid'],                      desc: 'Old valid date'},
        {input: '',           output: '',           expectedClasses: ['ng-valid'],                      desc: 'Blank date'},
        {input: '29/02/2000', output: '29/02/2000', expectedClasses: ['ng-valid'],                      desc: 'Is a leap year'},
        {input: '29/02/1900', output: '29/02/1900', expectedClasses: ['ng-invalid', 'ng-invalid-date'], desc: 'Not leap year'},
        {input: '29/02/2012', output: '29/02/2012', expectedClasses: ['ng-valid'],                      desc: 'Is a leap year'},
        {input: '29/02/2013', output: '29/02/2013', expectedClasses: ['ng-invalid', 'ng-invalid-date'], desc: 'Not leap year'},
        {input: '31122015',   output: '31122015',   expectedClasses: ['ng-valid'],                      desc: 'String of 8 digits accepted??'}
      ];

      var element = compileElement('<form name="frm"><input type="text" name="startDate" ng-model="startDate" form-date-format></form>');
      testDate(element, testData);
    });


    it('should validate an ordinary input field which must be a date, with a min and max date restriction', function() {
      var testData = [
        {input: '02',         output: '02',         expectedClasses: ['ng-invalid', 'ng-invalid-date'],     desc: 'Partial date'},
        {input: '31/12/1999', output: '31/12/1999', expectedClasses: ['ng-invalid', 'ng-invalid-min-date'], desc: 'Date too small'},
        {input: '',           output: '',           expectedClasses: ['ng-valid'],                          desc: 'Blank date'},
        {input: '01/01/2011', output: '01/01/2011', expectedClasses: ['ng-invalid', 'ng-invalid-max-date'], desc: 'Date too large'},
        {input: '01/01/2000', output: '01/01/2000', expectedClasses: ['ng-valid'],                          desc: 'Min boundary date'},
        {input: '01/01/2005', output: '01/01/2005', expectedClasses: ['ng-valid'],                          desc: 'Somewehere in the middle'},
        {input: '31/12/2010', output: '31/12/2010', expectedClasses: ['ng-valid'],                          desc: 'Max boundary date'}
      ];

      var element = compileElement('<form name="frm"><input type="text" name="startDate" ng-model="startDate" min-date="01/01/2000" max-date="31/12/2010" form-date-format></form>');
      testDate(element, testData);
    });


    it('should validate an ordinary input field which must be a date, with max date restriction of "today"', function() {
      var today = DateUtil.getToday();
      var tomorrow = DateUtil.dateAdd(today, 1);
      var yesterday = DateUtil.dateAdd(today, -1);
      var testData = [
        {input: today, output: today,         expectedClasses: ['ng-valid'],                          desc: 'Max date boundary'},
        {input: tomorrow, output: tomorrow,   expectedClasses: ['ng-invalid', 'ng-invalid-max-date'], desc: 'Over max date'},
        {input: yesterday, output: yesterday, expectedClasses: ['ng-valid'],                          desc: 'Below max date'}
      ];

      var element = compileElement('<form name="frm"><input type="text" name="startDate" ng-model="startDate" max-date="today" form-date-format></form>');
      testDate(element, testData);
    });


    it('should eval the dateChange attribute when the date is valid', function() {
      scope.callback = jasmine.createSpy('callback');
      elem = compileElement('<form name="frm"><input type="text" name="startDate" ng-model="startDate" date-change="callback()" form-date-format></form>');

      scope.$digest();
      var inputElem = elem.find('input');

      expect(scope.callback.calls.length).toEqual(0);

      // We send a change event, so we should call the callback function
      inputElem.val('').triggerHandler('change');
      expect(inputElem.hasClass('ng-valid')).toEqual(true);
      expect(scope.callback.calls.length).toEqual(1);

      // Make the date invalid, should not trigger a call
      inputElem.val('xyz').triggerHandler('change');
      expect(inputElem.hasClass('ng-invalid')).toEqual(true);
      expect(scope.callback.calls.length).toEqual(1);

      // valid date should trigger callback
      inputElem.val('01/01/1976').triggerHandler('change');
      expect(inputElem.hasClass('ng-valid')).toEqual(true);
      expect(scope.callback.calls.length).toEqual(2);
    });
  });


  describe('formDateInput', function() {

    it('should create a date input', function() {
      elem = compileElement('<form name="frm"><form-date ff-ng-model="scope.date" label="frm-date" uid="frm-date" name="frm-date"></form-date></form>');
      scope.$digest();

      expect(elem.html()).toEqual('<div class="form-group">' +
        '<label class="control-label" for="frm-date">frm-date<span class="required ng-isolate-scope ng-hide" aria-hidden="true" ng-class="{\'ng-hide\': hide}" ng-transclude="" required-marker="" hide="!(false)"></span></label>' +
        '<div class="control-row"><input type="text" class="form-control ng-pristine ng-valid ng-valid-required" maxlength="10" placeholder="dd/mm/yyyy" bs-datepicker="" form-date-format="" mask-date-digits="" id="frm-date" name="frm-date" ng-model="scope.date" ng-required="false" aria-required="false"><span ng-transclude=""></span></div>' +
        '</div>');
    });


    it('should throw an error if any of the label, id and name attributes are missing', function() {
      var controlName = 'formDate', directiveName = 'form-date';
      //var errorNoNameOrId = 'All ' + controlName + ' components MUST have a uid and name attribute, and the directive MUST exist inside a <form> for errors to appear';
      var errorNoLabel = 'The ' + controlName + ' component requires a label attribute.';
      var exceptionFn = function(html) {
        compileElement(html);
        scope.$digest();
      };

      var testData = [
        {html: '<' + directiveName + ' label="" uid="b" name="c"></' + directiveName + '>', expected: errorNoLabel}
      ];

      testData.forEach(function(testData) {
        expect(function() {exceptionFn(testData.html);}).toThrow(new Error(testData.expected));
      });
    });
  });

});
