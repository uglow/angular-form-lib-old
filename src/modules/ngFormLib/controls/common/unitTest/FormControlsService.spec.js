// See http://pivotal.github.io/jasmine/ for list of matchers (e.g .toEqual(), toMatch())
describe('Form controls common library', function () {
  'use strict';

  var formControlService;

  beforeEach(function() {
    angular.mock.module('ngFormLib.controls.common');

    inject(function (_formControlService_) {
      formControlService = _formControlService_;
    });

  });

  describe('should have an addToAttribute() method', function () {

    it('which adds a new attribute if the attribute did not exist', function () {
      var elem = angular.element('<div></div>');

      formControlService.addToAttribute(elem, 'some-attribute', '777');
      expect(elem[0].outerHTML).toEqual('<div some-attribute="777"></div>');
    });

    it('which adds to an existing attribute if the attribute already exists', function () {
      var elem = angular.element('<div existing-attribute="Brett"></div>');

      formControlService.addToAttribute(elem, 'existing-attribute', 'Uglow');
      expect(elem[0].outerHTML).toEqual('<div existing-attribute="Brett Uglow"></div>');

      formControlService.addToAttribute(elem, 'existing-attribute', 'adds attributes');
      expect(elem[0].outerHTML).toEqual('<div existing-attribute="Brett Uglow adds attributes"></div>');
    });
  });


  describe('should have a removeAttribute() method', function () {

    it('which removes a value from the attribute if the value existed', function () {
      var elem = angular.element('<div names="a Waltzing Matilda"></div>');

      // In-exact value match, so no change
      formControlService.removeFromAttribute(elem, 'names', 'Waltzin');
      expect(elem[0].outerHTML).toEqual('<div names="a Waltzing Matilda"></div>');

      // Exact value match, value removed
      formControlService.removeFromAttribute(elem, 'names', 'Waltzing');
      expect(elem[0].outerHTML).toEqual('<div names="a Matilda"></div>');
    });


    it('which removes a value from the attribute and the attribute as well if it is empty', function () {
      var elem = angular.element('<div country="Malaysia"></div>');

      // In-exact value match, so no change
      formControlService.removeFromAttribute(elem, 'country', 'Malaysia');
      expect(elem[0].outerHTML).toEqual('<div></div>');
    });
  });


  describe('should have a getRequiredAttribute() method', function () {

    it('which gets the required attribute as the string "true" when it is "required"', function () {
      var testData = [
        {input: 'required', expectedOutput: 'true'},
        {input: 'true', expectedOutput: 'true'},
        {input: undefined, expectedOutput: 'false'},
        {input: 'false', expectedOutput: 'false'},
        {input: 'random', expectedOutput: 'random'},
        {input: true, expectedOutput: true},
        {input: false, expectedOutput: false},
        {input: 0, expectedOutput: 'false'},
        {input: 1, expectedOutput: 1}
      ];

      for (var i = i; i < testData.length; i++) {
        expect(formControlService.getRequiredAttribute(testData[i].input)).toEqual(testData[i].expectedOutput);
      }
    });
  });


  describe('should have a decorateLabel() method', function () {

    it('which doesn\'t decorate the label when it doesn\'t need to', function () {
      var elem = angular.element('<label></label>');

      // Minimal decorations to the label - last param: hide required label
      formControlService.decorateLabel(elem, 'false', '', undefined, '', true);
      expect(elem[0].outerHTML).toEqual('<label></label>');
    });


    it('which decorates the label when it needs to', function () {
      var elem = angular.element('<frankfurt></frankfurt>');

      // Minimal decorations to the label - last param: hide required label
      formControlService.decorateLabel(elem, 'true', 'myId', 'myLabelClass', 'false', false);
      expect(elem[0].outerHTML).toEqual('<frankfurt for="myId" class="myLabelClass" ng-class="{\'sr-only\': false}">' +
          '<span required-marker="" hide="!(true)"></span></frankfurt>');
    });
  });


  describe('should have a decorateInputField() method', function () {

    it('which adds an id, label and required attribute as the bare minimum', function () {
      var elem = angular.element('<input>');
      var attr = {
        '$attr': {'noFfAttributes': 'no-ff-attributes', 'soNothingWillBeCopiedFromHere': 'so-nothing-will-be-copied-from-here'},
        'noFfAttributes': 'ok',
        'soNothingWillBeCopiedFromHere': 'cool'
      };

      var hostElem = angular.element('<div no-ff-attributes="ok" so-nothing-will-be-copied-from-here="cool"></div>');

      formControlService.decorateInputField(elem, hostElem, attr, 'myId', 'myName', 'state === \'VIC\'');

      expect(elem[0].outerHTML).toEqual('<input id="myId" name="myName" ng-required="state === \'VIC\'" aria-required="{{!!(state === \'VIC\')}}">');
      expect(hostElem[0].outerHTML).toEqual('<div no-ff-attributes="ok" so-nothing-will-be-copied-from-here="cool"></div>');
    });


    it('which preserves existing content and adds new attributes to the target element, EXCEPT the type attribute which is ignored', function () {
      var hostElem = angular.element('<div ff-type="checkbox" class="row" ff-ng-pattern="[0-9]{4}"></div>');
      var elem = angular.element('<input class="inline"><span>some text</span></input>');
      // All of the attributes that start with "ff" will be copied from the hostElem(ent) to the (input) elem(ent)
      var attr = {
          '$attr': {'ffType': 'ff-type', 'ffNgPattern': 'ff-ng-pattern'},
          'ffType': 'checkbox',
          'ffNgPattern': '[0-9]{4}'
        };

      formControlService.decorateInputField(elem, hostElem, attr, 'myId', 'myName', 'true');

      expect(elem[0].outerHTML).toEqual('<input class="inline" id="myId" name="myName" ng-pattern="[0-9]{4}" ng-required="true" aria-required="{{!!(true)}}">');
      expect(hostElem[0].outerHTML).toEqual('<div class="row"></div>');
    });
  });


  describe('should have a createErrorFeatures() method', function () {

    it('which does not create any error features when the element has no error messages to show', function () {
      var elem = angular.element('<input>');
      var hostElem = angular.element('<div></div>');

      formControlService.createErrorFeatures(hostElem, elem, 'myName', 'myLabel', '', '');
      expect(elem[0].outerHTML).toEqual('<input>');
      expect(hostElem[0].outerHTML).toEqual('<div></div>');
    });


    it('which creates some error features when the element has field error messages to show', function () {
      var elem = angular.element('<input>');
      var hostElem = angular.element('<div></div>');

      // Field errors
      formControlService.createErrorFeatures(hostElem, elem, 'myName', 'myLabel', '{required: \'Please enter a valid email address\', email: \'Please enter a valid email address\'}', '');
      expect(elem[0].outerHTML).toEqual('<input field-error-controller="">');
      expect(hostElem[0].outerHTML).toEqual('<div><div error-container="" field-name="myName" field-label="myLabel" field-errors="{required: \'Please enter a valid email address\', email: \'Please enter a valid email address\'}"></div></div>');
    });


    it('which creates some error features when the element has text error messages to show', function () {
      var elem = angular.element('<input>');
      var hostElem = angular.element('<div></div>');
      // Text errors
      formControlService.createErrorFeatures(hostElem, elem, 'myName', '', '', '[\'myScopeVar1\', \'myScopeVar2\']');
      expect(elem[0].outerHTML).toEqual('<input field-error-controller="">');
      expect(hostElem[0].outerHTML).toEqual('<div><div error-container="" field-name="myName" text-errors="[\'myScopeVar1\', \'myScopeVar2\']"></div></div>');
    });


    it('which creates some error features when the element has field and text error messages to show', function () {
      var elem = angular.element('<input>');
      var hostElem = angular.element('<div></div>');
      // Text errors
      formControlService.createErrorFeatures(hostElem, elem, 'myName', 'myLabel', '{required: \'Please enter a valid email address\'}', '[\'myScopeVar1\', \'myScopeVar2\']');
      expect(elem[0].outerHTML).toEqual('<input field-error-controller="">');
      expect(hostElem[0].outerHTML).toEqual('<div><div error-container="" field-name="myName" field-label="myLabel" field-errors="{required: \'Please enter a valid email address\'}" text-errors="[\'myScopeVar1\', \'myScopeVar2\']"></div></div>');
    });
  });


  describe('should have a createFieldHint() method', function () {

    it('which doesn\'t create a field hint when it doesn\'t need to', function () {
      var elem = angular.element('<anything></anything>');
      var hostElem = angular.element('<youlike></youlike>');

      formControlService.createFieldHint(hostElem, elem, '', '');
      expect(elem[0].outerHTML).toEqual('<anything></anything>');
      expect(hostElem[0].outerHTML).toEqual('<youlike></youlike>');
    });


    it('which creates a field hint the label when it needs to', function () {
      var elem = angular.element('<anything></anything>');
      var hostElem = angular.element('<youlike></youlike>');

      formControlService.createFieldHint(hostElem, elem, 'Format: dd/mm/yyyy', 'hint-id');
      expect(elem[0].outerHTML).toEqual('<anything aria-describedby="hint-id"></anything>');
      expect(hostElem[0].outerHTML).toEqual('<youlike><p class="help-block" id="hint-id">Format: dd/mm/yyyy</p></youlike>');
    });
  });
});
