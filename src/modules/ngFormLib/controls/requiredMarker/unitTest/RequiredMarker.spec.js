// See http://pivotal.github.io/jasmine/ for list of matchers (e.g .toEqual(), toMatch())
describe('Required Marker tag', function () {
  'use strict';

  var $compile, scope;
  var elem;

  beforeEach(angular.mock.module('ngFormLib.controls.requiredMarker'));

  beforeEach(inject(['$compile', '$rootScope', function ($c, $r) {
    $compile = $c;
    scope = $r.$new();
  }]));

  it('should transform the required-marker element into accessible HTML, basic', function () {
    elem = angular.element('<div><span required-marker></span></div>');
    $compile(elem)(scope);
    scope.$digest();

    expect(elem.find('span')[0].outerHTML).toEqual('<span class="required ng-isolate-scope" aria-hidden="true" ng-class="{\'ng-hide\': hide}" ng-transclude="" required-marker=""></span>');
  });


  it('should transform the required-marker element into accessible HTML, advanced', function () {
    elem = angular.element('<div><span required-marker hide="isNotRequired">Hint text</span></div>');
    $compile(elem)(scope);
    scope.$digest();

    expect(elem.find('span')[0].outerHTML).toEqual('<span class="required ng-isolate-scope" aria-hidden="true" ng-class="{\'ng-hide\': hide}" ng-transclude="" required-marker="" hide="isNotRequired"><span class="ng-scope">Hint text</span></span>');
    expect(elem.find('span').eq(0).hasClass('ng-hide')).toEqual(false);

    // Now set the scope.isNotRequired variable to true, which should add the 'ng-hide' class
    scope.isNotRequired = true;
    scope.$digest();
    expect(elem.find('span').eq(0).hasClass('ng-hide')).toEqual(true);
  });
});
