describe('Form Policy Service configuration', function() {
  'use strict';

  describe('has default settings', function() {
    var defaultFormSettings = {}, formPolicyService;

    beforeEach(function() {
      angular.mock.module('ngFormLib', ['formPolicyServiceProvider', function(formPolicyServiceProvider) {
        defaultFormSettings = formPolicyServiceProvider.defaults;
      }]);

      inject(function(_formPolicyService_) {
        formPolicyService = _formPolicyService_;
      });
    });

    it('should have the default settings', function() {
      // By the time the service is created, the policy functions are stubbed if they are null
      expect(defaultFormSettings.formSubmitAttemptedClass).toEqual('form-submit-attempted');
      expect(defaultFormSettings.fieldErrorClass).toEqual('has-error');
      expect(typeof defaultFormSettings.behaviourOnStateChange).toEqual('function');
      expect(typeof defaultFormSettings.checkForStateChanges).toEqual('function');
      expect(typeof defaultFormSettings.stateDefinitions).toEqual('function');
    });
  });


  describe('can be changed using the service provider', function() {
    var mockFnA = function a() { return 'a'; },
      mockFnB = function b() { return 'b'; },
      mockFnC = function c() { return 'c'; },
      mockDefaults = {
        formSubmitAttemptedClass: 'abc',
        fieldErrorClass: 'efg',
        behaviourOnError: mockFnA,
        checkForStateChanges: mockFnB,
        stateDefinitions: mockFnC
      },
      formPolicyService;

    // Set the defaults using the provider method
    beforeEach(function() {
      angular.mock.module('ngFormLib', ['formPolicyServiceProvider', function(formPolicyServiceProvider) {
        formPolicyServiceProvider.defaults = mockDefaults;
      }]);

      inject(function(_formPolicyService_) {
        formPolicyService = _formPolicyService_;
      });
    });

    it('should have the new default settings', function() {
      var policyConfig = formPolicyService.getCurrentPolicy();
      expect(policyConfig).toEqual(mockDefaults);
    });
  });


});
