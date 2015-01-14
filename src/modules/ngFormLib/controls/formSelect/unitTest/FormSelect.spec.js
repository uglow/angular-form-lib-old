describe('when I use the form select it', function () {
  'use strict';

  var compileElement, scope, elem;

  beforeEach(function() {
    angular.mock.module('ngFormLib.controls.formSelect');

    inject(function(_$compile_, $rootScope) {
      scope = $rootScope.$new();
      compileElement = function(html) {
        return _$compile_(html)(scope);
      };
    });
  });


  it('should create a select dropdown with the minimum markup', function () {
    elem = compileElement('<form-select label="sel" uid="sel" name="select"></form-select>');
    scope.$digest();

    expect(elem.find('select')[0].outerHTML).toEqual('<select class="form-control" id="sel" name="select" ng-required="false" aria-required="false"></select>');
    expect(elem.find('select').length).toEqual(1);
  });


  it('should create a select dropdown with a placeholder, if the placeholder attribute is specified', function () {
    elem = compileElement('<form-select label="sel" uid="sel" name="select" placeholder="Select an item"></form-select>');
    scope.$digest();

    expect(elem.find('select').find('option')[0].outerHTML).toEqual('<option translate="" value="" class="ng-scope">Select an item</option>');
  });


  it('should throw an error if any of the label, id and name attributes are missing', function() {
    var controlName = 'formSelect', directiveName = 'form-select';
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
