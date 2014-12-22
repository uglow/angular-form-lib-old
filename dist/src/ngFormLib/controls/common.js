(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.common', [
    'common.utility',
    'ngFormLib.controls.requiredMarker',
    // Template-modules (HTML that is converted into an Angular template)
    'ngFormLib/controls/formCheckbox/template/FormCheckboxTemplate.html',
    'ngFormLib/controls/formDate/template/FormDateInputTemplate.html',
    'ngFormLib/controls/formRadioButton/template/FormRadioButtonTemplate.html',
    'ngFormLib/controls/formSelect/template/FormSelectTemplate.html'
  ]);


  // Workaround for bug #1404
  // https://github.com/angular/angular.js/issues/1404
  // Source: http://plnkr.co/edit/hSMzWC?p=preview
  // Not so great for IE8, but necesary for using radio buttons inside of dynamic forms (ng-repeat)
  mod.config(['$provide', function($provide) {
    $provide.decorator('ngModelDirective', ['$delegate', function($delegate) {
      var ngModel = $delegate[0], controller = ngModel.controller;
      ngModel.controller = ['$scope', '$element', '$attrs', '$injector', function(scope, element, attrs, $injector) {
        var $interpolate = $injector.get('$interpolate');
        attrs.$set('name', $interpolate(attrs.name || '')(scope));
        $injector.invoke(controller, this, {
          '$scope': scope,
          '$element': element,
          '$attrs': attrs
        });
      }];
      return $delegate;
    }]);
    $provide.decorator('formDirective', ['$delegate', function($delegate) {
      var form = $delegate[0], controller = form.controller;
      form.controller = ['$scope', '$element', '$attrs', '$injector', function(scope, element, attrs, $injector) {
        var $interpolate = $injector.get('$interpolate');
        attrs.$set('name', $interpolate(attrs.name || attrs.ngForm || '')(scope));
        $injector.invoke(controller, this, {
          '$scope': scope,
          '$element': element,
          '$attrs': attrs
        });
      }];
      return $delegate;
    }]);
  }]);


  // Shared code for the accessible controls
  mod.provider('formControlService', function () {
    var self = this,
        counter = 0;    // Private variable

    //
    self.defaults = {
      idPrefix: 'fpFld',
      templates: {
        formCheckbox: {
          default:           'ngFormLib/controls/formCheckbox/template/FormCheckboxTemplate.html'
        },
        formDate: {
          default:           'ngFormLib/controls/formDate/template/FormDateInputTemplate.html'
        },
        formInput: {              // This has to be a string as we need to dynamically replace the #type# variable BEFORE the template is turned into a DOM element
          default:           '<div class="form-group"><label class="control-label"></label><div class="control-row"><input #type# class="form-control"><span ng-transclude></span></div></div>'
        },
        formRadioButton: {
          default:           'ngFormLib/controls/formRadioButton/template/FormRadioButtonTemplate.html'
        },
        formSelect: {
          default:           'ngFormLib/controls/formSelect/template/FormSelectTemplate.html'
        },
        requiredMarker: {
          default:           'ngFormLib/controls/requiredMarker/template/RequiredMarkerTemplate.html'
        }
      }
    };

    this.$get = ['StringUtil', '$interpolate', function (StringUtil) {

      var service = {
        defaults: self.defaults,

        buildDirective: function(params) {
          var directive = {
            restrict: 'AE',
            replace: true,
            transclude: true,
            compile: function (tElement, tAttr) {

              service.validateComponentStructure(params.controlName, tElement, params.expectedTemplateElements, tAttr, params.expectedAttributes);

              // For items that are inside repeaters, if more than one element has the same id, the checkbox stops working.
              // By using an attribute that is not called 'id', we can avoid this issue
              var id = tAttr.uid || service.getUniqueFieldId(),
                name = tAttr.name || id,// Doing this *will* break radio buttons, but they SHOULD provide a name anyway (for their own good)
                inputElem = tElement.find(params.inputElementName || 'input'),
                labelElem = tElement.find('label'),
                required = service.getRequiredAttribute(tAttr.required);

              service.decorateLabel(labelElem, required, id, tAttr.labelClass, tAttr.hideLabel, tAttr.hideRequiredIndicator, tAttr.labelSuffix);
              service.decorateInputField(inputElem, tElement, tAttr, id, name, required);

              // Do component-specific config last
              params.configFn(tElement, tAttr, id, name, inputElem, labelElem);

              // Clean up special attributes (to make HTML look nicer
              tElement.removeAttr('uid').removeAttr('name').removeAttr('label').removeAttr('required').removeAttr('field-hint')
                .removeAttr('input-type').removeAttr('hide-label').removeAttr('label-class').removeAttr('field-errors').removeAttr('text-errors');
            }
          };

          // The directive can elect to use a template-string or a template-url
          directive[params.templateType] = function(element, attr) {
            // Depending on the type, we may have to load different templates, as IE isn't happy when you change input types
            return attr.template || service.getHTMLTemplate(element, params.controlName, attr.inputType);
          };

          return directive;
        },

        getUniqueFieldId: function () {
          return '' + self.defaults.idPrefix + counter++;
        },

        getHTMLTemplate: function(element, type, inputType) {
          // Check this element's parent-form-element-classes to see if they match. First match, wins
          var parentFormClasses = (element.inheritedData('formElementClasses') || '').split(' ');
          var result = self.defaults.templates[type].default;

          for (var i = 0; i < parentFormClasses.length; i++) {
            var template = self.defaults.templates[type][parentFormClasses[i]];
            if (template) {
              result = template;
              break;
            }
          }

          // Replace the #type# string with our input type, if we have one
          if (inputType) {
            result = result.replace('#type#', 'type=' + inputType);
          }
          return result;
        },

        addToAttribute: function (element, attributeName, value) {
          var existingVal = element.attr(attributeName);
          element.attr(attributeName, ((existingVal) ? existingVal + ' ' : '') + value);
        },


        removeFromAttribute: function (element, attributeName, value) {
          // Borrowed this statement from Angular.js
          var newValue = StringUtil.trim(
            (' ' + (element.attr(attributeName) || '') + ' ')
            .replace(/[\n\t]/g, ' ')
            .replace(' ' + StringUtil.trim(value) + ' ', ' ')
          );

          // Remove the attribute if it is empty
          if (newValue === '') {
            element.removeAttr(attributeName);
          } else {
            element.attr(attributeName, newValue);
          }
        },


        getRequiredAttribute: function (required) {
          var result = required || 'false';

          // When we set required="true" on a parent directive (like on-off-button), inputElem.attr('required', 'true')
          // becomes <input required="required" due to browser interference. So detect this case, and replace it with "true"
          if (required === 'required') {
            result = 'true';
          }
          return result;
        },


        decorateLabel: function (labelElem, required, id, labelClass, hideLabelExpr, hideRequiredIndicator, labelSuffix) {
          if (id) {
            labelElem.attr('for', id);
          }
          if (labelClass) {
            labelElem.addClass(labelClass);
          }
          if (hideLabelExpr) {
            labelElem.attr('ng-class', '{\'sr-only\': ' + hideLabelExpr + '}');
          }
          if (!hideRequiredIndicator) {
            labelElem.append('<span required-marker hide="!(' + required + ')"></span>');
          }
          // Some labels have suffix text - text that helps with describing the label, but isn't really the label text.
          // E.g. Amount ($AUD)
          if (labelSuffix) {
            labelElem.text(labelElem.text() + ' ' + labelSuffix);
          }
        },



        decorateInputField: function (inputElem, hostElement, attr, id, name, required) {
          inputElem.attr('id', id);

          // Allow the name to be interpolated
          inputElem.attr('name', name);

          // Apply all of the ff-* attributes to the input element. Use the original attribute names
          // attr.$attr contains the snake-case names e.g. 'form-field' vs camel case 'formField'
          for (var a in attr.$attr) {
            if (a.indexOf('ff') === 0) {    // Don't search for 'ff-' as the '-' has been replaced with camel case now
              var origAttrName = attr.$attr[a].substr(3);

              // Special case for type property. It *must* be read-only.
              // See http://stackoverflow.com/questions/8378563/why-cant-i-change-the-type-of-an-input-element-to-submit
              if (origAttrName === 'type') {
                //inputElem.prop(origAttrName, attr[a]); // Do nothing, need to specify your own template
              } else if (origAttrName === 'class') {
                inputElem.addClass(attr[a]);
              } else {
                inputElem.attr(origAttrName, attr[a]);
              }

              // Remove all attributes off the host element
              hostElement.removeAttr(attr.$attr[a]);
            }
          }

          inputElem.attr('ng-required', required);
          inputElem.attr('aria-required', '{{!!(' + required + ')}}');  // evaluates to true / false
        },


        createErrorFeatures: function (parentElement, inputElement, name, fieldLabel, fieldErrors, textErrors) {
          if (fieldErrors || textErrors) {
            // Add an fieldErrorControllers attribute to the element, to hook-up the error features
            inputElement.attr('field-error-controller', '');

            var fieldLabelStr = (fieldLabel) ? ' field-label="' + fieldLabel + '"' : '';
            var errorContainerElem = angular.element('<div error-container field-name="' + name + '"' + fieldLabelStr + '></div>');
            if (fieldErrors) {
              errorContainerElem.attr('field-errors', fieldErrors);
            }
            if (textErrors) {
              errorContainerElem.attr('text-errors', textErrors);
            }
            parentElement.append(errorContainerElem);
          }
        },

        createFieldHint: function (hostElement, inputElement, fieldHint, fieldHintId, fieldHintDisplay) {
          var hintElement;

          if (fieldHint) {
            // If we have a field hint, add that as well
            if (fieldHintDisplay) {
              // If a field hint display rule exists, implement.
              hintElement = angular.element('<p ng-if="' + fieldHintDisplay + '" class="help-block" id="' + fieldHintId + '">' + fieldHint + '</p>');
            } else {
              hintElement = angular.element('<p class="help-block" id="' + fieldHintId + '">' + fieldHint + '</p>');
            }
            hostElement.append(hintElement);
            inputElement.attr('aria-describedby', fieldHintId);
          }
        },

        buildNgClassExpression: function(inputElem, targetElem) {
          // If the inputElem has an ngModel and/or ngChecked attribute, create the ng-class attribute
          //todo.. test checkbox implementation
          var modelStr = inputElem.attr('ng-model'),
              checkedStr = inputElem.attr('ng-checked'),
              disabledStr = inputElem.attr('ng-disabled'),
              value = inputElem.attr('value'),        // a string - used for Radio buttons
              ngValue = inputElem.attr('ng-value'),   // an expression - used for Radio buttons
              ngTrueValue = inputElem.attr('ng-true-value');

          if (modelStr) {
            if (ngValue || ngTrueValue) {
              modelStr += ' === ' + (ngValue || ngTrueValue);
            } else if (value) {
              // The value is ALWAYS a string
              modelStr += ' === \'' + value + '\'';
            } else {
              modelStr += ' === true';  // For checkboxes, in the absence of ng-true-value
            }
          }

          if (modelStr && checkedStr) {
            modelStr += ' || ' + checkedStr;
          } else if (checkedStr) {
            modelStr = checkedStr;
          }

          if (modelStr && disabledStr) {
            targetElem.attr('ng-class', '{\'checked\': ' + modelStr + ', \'disabled\': ' + disabledStr + '}');
          } else if (modelStr) {
            targetElem.attr('ng-class', '{\'checked\': ' + modelStr + '}');
          }
        },

        validateComponentStructure: function(componentName, element, requiredElements, attr, requiredAttributes) {
          for (var i = 0; i < requiredElements.length; i++) {
            if (!element.find(requiredElements[i])) {
              throw new Error('The ' + componentName + ' component template requires a ' + requiredElements[i] + ' element.');
            }
          }

          for (var j = 0; j < requiredAttributes.length; j++) {
            if (!attr[requiredAttributes[j]]) {
              throw new Error('The ' + componentName + ' component requires a ' + requiredAttributes[j] + ' attribute.');
            }
          }
        }

      };
      return service;
    }];
  });
})(window.angular);

(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.common');
  /**
   * The Field Error Controller directive is designed to indicate to the browser when the field is in error
   *  and what the errors are. It applies the form-policy for showing errors
   *
   * It works in tandem with the form controller (and FormPolicy.js) to identify when a form-element has an error, and decorates
   *  the element accordingly.
   *
   * It also toggles the fieldController.fieldState flag, based on the form policy provided
   *
   */

  // INPUT:
  //  <input ... field-error-controller></input>

  // OUTPUT:
  //  <input ... aria-invalid="false/true" aria-describedby="fieldId-errors">


  mod.directive('fieldErrorController', ['formControlService', '$timeout', function (formControlService, $timeout) {

    function updateAriaFeatures(fieldState, element, formName, fieldName) {
      element.attr('aria-invalid', fieldState === 'error');
      var errorElemId = formName + '-' + fieldName + '-errors-aria';

      if (fieldState === 'error') {
        // Use the errorContainer's special ARIA element as the source of the error text
        formControlService.addToAttribute(element, 'aria-describedby', errorElemId);
      } else {
        formControlService.removeFromAttribute(element, 'aria-describedby', errorElemId);
      }
    }

    function updateElementStyle(fieldState, element, formPolicy) {
      element[(fieldState === 'error') ? 'addClass' : 'removeClass'](formPolicy.fieldErrorClass);
      element[(fieldState === 'success') ? 'addClass' : 'removeClass'](formPolicy.fieldSuccessClass);
    }

    function setupCanShowErrorPropertyOnNgModelController(scope, formController, ngModelController, element, name) {
      // Using the form policy, determine when to show errors for this field
      var formPolicy = formController._policy,
        formName = formController.$name,
        fieldName = formName + '.' + name,
        stateConditions = formPolicy.stateDefinitions(formName, fieldName);

      formPolicy.checkForStateChanges(scope, element, name, stateConditions, ngModelController, formController);
    }


    return {
      restrict: 'AE',
      require: ['?ngModel', '?^form', '?^formGroup'],  // Require the formController controller somewhere in the parent hierarchy
      replace: true,
      link: function (scope, element, attr, controllers) {
        // Tried to use a template string, but the model was not binding properly. Using $compile() works :)
        var ngModelController = controllers[0],
          formController = controllers[1],
          formGroupElement = (controllers[2] || {}).$element || element,// This looks for a parent directive called formGroup, which has a controller, which has an $element property
          name = attr.name;


        if (formController) {
          var formName = formController.$name,
            errorBehaviour = formController._applyFormBehaviourOnStateChangePolicy; // returns a function which encapsulates the form policy rules for the behaviour to apply when errors show

          if (ngModelController) {
            setupCanShowErrorPropertyOnNgModelController(scope, formController, ngModelController, element, name);
          }

          // When the error-showing flag changes, update the field style
          scope.$watch(formName + '.' + name + '.fieldState', function (fieldState) {
            updateAriaFeatures(fieldState, element, formName, name);
            updateElementStyle(fieldState, formGroupElement, formController._policy);

            // Apply the error behaviour behaviour
            errorBehaviour.applyBehaviour(element, fieldState, false);
          });

          // Listen to form-submit events, to determine what to focus on too
          scope.$on('event:FormSubmitAttempted', function () {
            // Make sure that the field-level watchers have a chance to fire first, so use a timeout
            $timeout(function () {
              errorBehaviour.applyBehaviour(element, ngModelController.fieldState, true);
            }, 1);
          });
        }
      }
    };
  }]);


  mod.directive('formGroup', [function () {

    return {
      restrict: 'AC',
      controller: ['$scope', '$element', function($scope, $element) {
        return {
          '$element': $element
        };
      }]
    };
  }]);

})(window.angular);
