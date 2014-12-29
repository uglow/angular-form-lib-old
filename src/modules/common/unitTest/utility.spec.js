'use strict';

describe('Utility', function () {

  beforeEach(angular.mock.module('common.utility'));

  describe('StringUtil', function () {

    it('should be able to see the StringUtil constant', inject(function (StringUtil) {
      expect(StringUtil).not.toEqual(null);
    }));


    it('should be able to call trim() and get a valid response', inject(function (StringUtil) {
      var testData = [
        {input: '    ab c  ',    expectedOutput: 'ab c'},
        {input: '_88 ',        expectedOutput: '_88'},
        {input: 88,          expectedOutput: 88},
        {input: {'a': 'b'},      expectedOutput: {'a': 'b'}}
      ];

      for (var i = 0; i < testData.length; i++) {
        expect(StringUtil.trim(testData[i].input)).toEqual(testData[i].expectedOutput);
      }
    }));
  });

  describe('NumberUtil', function () {
    it('should be able to call isDigits() and get a valid response', inject(function (NumberUtil) {
      var testData = [
        {input: 8,              expectedOutput: true},
        {input: '0',            expectedOutput: true},
        {input: 'a',            expectedOutput: false},
        {input: 'x80',            expectedOutput: false},
        {input: '2345098908093845092808',  expectedOutput: true},
        {input: 'eight',          expectedOutput: false},
        {input: '8 ',            expectedOutput: false},
        {input: ' 8',            expectedOutput: false},
        {input: 9 * 5,            expectedOutput: true},
        {input: 9 + '5',          expectedOutput: true},
        {input: 9 * '5',          expectedOutput: true}
      ];

      for (var i = 0; i < testData.length; i++) {
        expect(NumberUtil.isDigits(testData[i].input)).toEqual(testData[i].expectedOutput);
      }
    }));
  });

  describe('DateUtil', function () {
    it('should be able to call convertDate() and get a valid response', inject(function (DateUtil) {
      var testData = [
        {input: '31/01/2012',  newSep: '-',  expectedOutput: '2012-01-31'},
        {input: '31/01/2012',  newSep: '/',  expectedOutput: '31/01/2012'},
        {input: '',        newSep: '/',  expectedOutput: ''},
        {input: '',        newSep: '-',  expectedOutput: ''},
        {input: '',        newSep: '',    expectedOutput: ''},
        {input: '31/01/2012',  newSep: '',    expectedOutput: '31/01/2012'},
        {input: '2012-01-31',  newSep: '-',  expectedOutput: '2012-01-31'},
        {input: '2012-01-31',  newSep: '/',  expectedOutput: '31/01/2012'},
        {input: '2012-01-31',  newSep: '',    expectedOutput: '2012-01-31'}
      ];

      for (var i = 0; i < testData.length; i++) {
        expect(DateUtil.convertDate(testData[i].input, testData[i].newSep)).toEqual(testData[i].expectedOutput);
      }
    }));


    it('should be able to call isISODate() and get a valid response', inject(function (DateUtil) {
      // This is a pretty lazy function - just checks if there is a '-' in the string
      var testData = [
        {input: '31/01/2012',  expectedOutput: false},
        {input: '',        expectedOutput: false},
        {input: '//',      expectedOutput: false},
        {input: '-',      expectedOutput: false},
        {input: undefined,    expectedOutput: false},
        {input: ' -',      expectedOutput: true},
        {input: '8-0-',      expectedOutput: true},
        {input: '2012-01-31',  expectedOutput: true}
      ];

      for (var i = 0; i < testData.length; i++) {
        expect(DateUtil.isISODate(testData[i].input)).toEqual(testData[i].expectedOutput);
      }
    }));


    it('should be able to call getDate() and get a valid response', inject(function (DateUtil) {
      // This is a pretty lazy function - just checks if there is a '-' in the string
      var testData = [
        {input: '31/01/2012',  expectedOutput: 31},
        {input: '2012-01-09',  expectedOutput: 9},
        {input: '//',      expectedOutput: 'NaN'},
        {input: '-',      expectedOutput: 'NaN'},
        {input: ' -',      expectedOutput: 'NaN'},
        {input: '8-0-',      expectedOutput: 'NaN'},
        {input: '20-01-2031',  expectedOutput: 'NaN'}
      ];

      for (var i = 0; i < testData.length; i++) {
        if (testData[i].expectedOutput === 'NaN') {
          expect(isNaN(DateUtil.getDate(testData[i].input).getDate())).toBe(true);
        } else {
          expect(DateUtil.getDate(testData[i].input).getDate()).toBe(testData[i].expectedOutput);
        }
      }
    }));


    it('should be able to call dateAdd() and get a valid response', inject(function (DateUtil) {
      // This is a pretty lazy function - just checks if there is a '-' in the string
      var testData = [
        {input: '31/01/2012',  daysToAdd: 1,    expectedOutput: '01/02/2012'},
        {input: '2012-01-31',  daysToAdd: 1,    expectedOutput: '01/02/2012'},
        {input: '31/01/2012',  daysToAdd: 0,    expectedOutput: '31/01/2012'},
        {input: '28/02/2000',  daysToAdd: 1,    expectedOutput: '29/02/2000'},
        {input: '29/02/2000',  daysToAdd: 1,    expectedOutput: '01/03/2000'},
        {input: '01/03/2000',  daysToAdd: -1,    expectedOutput: '29/02/2000'},
        {input: '28/02/1900',  daysToAdd: 1,    expectedOutput: '01/03/1900'},
        {input: '01/10/1900',  daysToAdd: 31,    expectedOutput: '01/11/1900'},
        {input: '01/10/1900',  daysToAdd: 365,    expectedOutput: '01/10/1901'},
        {input: '31/12/2012',  daysToAdd: 366,    expectedOutput: '01/01/2014'}
      ];

      for (var i = 0; i < testData.length; i++) {
        var result = DateUtil.dateAdd(testData[i].input, testData[i].daysToAdd);
        expect(result).toEqual(testData[i].expectedOutput);
      }
    }));

    it('should be able to call getToday() and get a valid response', inject(function (DateUtil) {
      // For testing purposes, we can pass in the optional date object
      var formattedDate = DateUtil.getToday(new Date(2014, 7, 1, 0));
      expect(formattedDate).toEqual('01/08/2014');

      formattedDate = DateUtil.getToday();
      expect(formattedDate).toMatch(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    }));


    it('should be able to call monthsBetween() and get a valid response', inject(function (DateUtil) {
      var testData = [
        {input: '2015-01-31', input2: '2015-02-01', expectedOutput: 1},
        {input: '2014-01-31', input2: '2015-01-01', expectedOutput: 12},
        {input: '2014-01-01', input2: '2015-01-31', expectedOutput: 12},
        {input: '2015-01-01', input2: '2014-01-31', expectedOutput: -12},
        {input: '2012-02-28', input2: '2012-02-29', expectedOutput: 0},
        {input: '2013-02-28', input2: '2013-02-29', expectedOutput: NaN},
        {input: '2000-02-28', input2: '2000-02-29', expectedOutput: 0},
        {input: '1976-07-01', input2: '1976-12-25', expectedOutput: 5}
      ];

      for (var i = 0; i < testData.length; i++) {
        var result = DateUtil.monthsBetween(new Date(testData[i].input), new Date(testData[i].input2));
        if (isNaN(testData[i].expectedOutput)) {
          expect(isNaN(result)).toEqual(true);
        } else {
          expect(result).toEqual(testData[i].expectedOutput);
        }
      }
    }));
  });


  describe('ObjectUtil', function () {
    it('should be able to call getUniqueId() and get a valid response', inject(function (ObjectUtil) {
      var id = ObjectUtil.getUniqueId();

      expect(id).not.toContain('.');
      expect(id).toMatch(/^\d+$/g);    // It must be all digits

      var nextId = ObjectUtil.getUniqueId();
      expect(id).not.toEqual(nextId);
    }));


    it('should be able to call toArray() on an object and get a valid response', inject(function (ObjectUtil) {
      var testData = [
        {input: {key: 'val'}, expectedOutput: [{key: 'key', value: 'val'}]},
        {input: {some: 12, thing: {orOther: true}}, expectedOutput: [{key: 'some', value: 12}, {key: 'thing', value: {orOther: true}}]},
        {input: {}, expectedOutput: []}
      ];

      for (var i = 0; i < testData.length; i++) {
        var result = ObjectUtil.toArray(testData[i].input);
        expect(result).toEqual(testData[i].expectedOutput);
      }
    }));
  });
});
