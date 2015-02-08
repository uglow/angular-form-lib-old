(function (angular) {
  'use strict';

  angular.module('common.utility', []);
  angular.module('common', ['common.utility']);
})(window.angular);

(function (angular) {
  'use strict';

  var mod = angular.module('common.utility', []);

  mod.constant('DateUtil', {
    convertDate: function (dateStr, newSep) {
      // Converts a date between dd/mm/yyyy and yyyy-mm-dd
      if (!dateStr || !newSep || !(newSep === '/' || newSep === '-')) {
        return dateStr;
      }

      // Choose a separator string that is the 'opposite' of the desired separator
      var oldSep = (newSep === '/') ? '-' : '/',
        parts = dateStr.split(oldSep);

      // if we get a dodgy date OR you tried to convert a date that was already in the correct format, return the input
      if (isNaN(parts.join('')) || parts.length !== 3) {
        return dateStr;
      }

      // Swap the year and day parts around
      return parts[2] + newSep + parts[1] + newSep + parts[0];
    },
    formatDay: function(dayOrDate, month, year) {
      var dd = dayOrDate, mm = month, yyyy = year;
      if (dayOrDate.getUTCDay) {
        dd = dayOrDate.getDate();
        mm = dayOrDate.getMonth() + 1;//January is 0!`
        yyyy = dayOrDate.getFullYear();
      }
      return ((dd < 10) ? '0' + dd : dd) + '/' + ((mm < 10) ? '0' + mm : mm) + '/' + yyyy;
    },
    dateAdd: function (dateStr, numDays) {
      // Return a modified date in ISO format
      var myDate = this.getDate(dateStr);
      myDate.setDate(myDate.getDate() + numDays);

      return this.formatDay(myDate);
    },
    getToday: function(optionalDate) {
      return this.formatDay(optionalDate || new Date());
    },
    isISODate: function (dateStr) {
      return (typeof dateStr === 'string' && dateStr.indexOf('-') > 0);
    },
    getDate: function (dateStr) {
      if (!this.isISODate(dateStr)) {
        dateStr = this.convertDate(dateStr, '-');
      }
      return new Date(dateStr);
    },
    monthsBetween: function(date1, date2) {
      return date2.getMonth() - date1.getMonth() + (12 * (date2.getFullYear() - date1.getFullYear()));
    }
  });


  mod.constant('StringUtil', (function () {
    var trimRegExp = /^\s+|\s+$/g;

    return {
      trim: function (text) {
        if (typeof text === 'string') {
          return text.replace(trimRegExp, '');
        }
        return text;
      }
    };
  })());


  mod.constant('NumberUtil', (function () {
    var isDigitsRegExp = /^\d+$/;

    return {
      isDigits: function (text) {
        return isDigitsRegExp.test(text);
      }
    };
  })());


  mod.constant('ObjectUtil', {
    getUniqueId: function () {
      return ('' + (new Date()).getTime() + Math.random()).replace(/\./, '');
    },
    toArray: function (obj) {
      var arr = [];
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          arr[arr.length] = {key: i, value: obj[i]};
        }
      }
      arr.sort(function compare(a, b) {
        return a.key < b.key;
      });
      return arr;
    }
  });

})(window.angular);

(function (angular) {
  'use strict';

  // Define modules
  angular.module('ngFormLib', ['ngAnimate',
    'ngFormLib.policy',
//    Add the policies you want, or define your own:
//    'ngFormLib.policy.checkForStateChanges',
//    'ngFormLib.policy.displayError',
//    'ngFormLib.policy.focusBehaviour',
    'ngFormLib.controls'
  ]);

})(window.angular);

(function (angular) {
  'use strict';

  // We need the utility module for the DateUtil.getDate() method for the formDateFormat directive, and StringUtil.trim() in controls.common
  angular.module('ngFormLib.controls', [
    'ngFormLib.controls.errorMessageContainer',
    'ngFormLib.controls.formCheckbox',
    'ngFormLib.controls.formDate',
    'ngFormLib.controls.formInput',
    'ngFormLib.controls.formRadioButton',
    'ngFormLib.controls.formSelect',
    'ngFormLib.controls.formReset',
    'ngFormLib.controls.formSubmit'
  ]);

})(window.angular);

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
  // Not so great for IE8, but neccessary for using radio buttons inside of dynamic forms (ng-repeat)
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
                .removeAttr('input-type').removeAttr('hide-label').removeAttr('hideRequiredIndicator')
                .removeAttr('label-class').removeAttr('field-errors').removeAttr('text-errors');
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

              if (origAttrName === 'class') {
                inputElem.addClass(attr[a]);

              // Special case for type property. It *must* be read-only. Therefore, don't write it to the element
              // See http://stackoverflow.com/questions/8378563/why-cant-i-change-the-type-of-an-input-element-to-submit
              } else if (origAttrName !== 'type') {
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
        this.$element = $element;
      }]
    };
  }]);

})(window.angular);

(function (angular) {
  'use strict';

  angular.module('ngFormLib.controls.errorMessageContainer', ['pascalprecht.translate'])

  /**
   * This directive is really a FIELD error message container - it is designed to work with fields exclusively
   */

  .directive('errorContainer', ['$compile', '$filter', function ($compile, $filter) {

    function translateError(errorMessage, fieldLabel) {
      var firstLetterIsAVowel = fieldLabel ? ('aeiou'.indexOf(fieldLabel[0].toLowerCase()) !== -1) : undefined;
      return $filter('translate')(errorMessage, {pronoun: firstLetterIsAVowel ? 'an' : 'a', fieldLabel: fieldLabel});
    }

    function ErrorController(element) {
      var errors = [],
        ariaElement = element;

      return {
        addError: function (errorType, errorMessage, fieldLabel) {
          errors[errorType] = translateError(errorMessage, fieldLabel);
        },

        removeError: function (errorType) {
          delete errors[errorType];
        },

        refreshErrorText: function () {
          var str = '', i = 0;
          for (var type in errors) {
            if (errors.hasOwnProperty(type)) {
              str += 'Error ' + (++i) + ', ' + errors[type] + ',';
            }
          }

          if (i === 1) {
            str = '. There is 1 error for this field. ' + str;
          } else if (i > 1) {
            str = '. There are ' + i + ' errors for this field. ' + str;
          }
          ariaElement.text(str);
        }
      };
    }

    function generateErrorTag(errorType, errorText, fieldLabel) {
      return '<div class="text-error ec2-' + errorType + '"><span class="text-error-wrap">' + translateError(errorText, fieldLabel) + '</span></div>';
    }

    /**
     * Handle the field-based error messages
     */
    function toggleErrorVisibilityOnError(controller, formController, scope, element, watchExpr, errorType, errorText, fieldLabel) {
      //console.log('watchExpr = ' + watchExpr);
      scope.$watch(watchExpr, function (newValue) {
        if (newValue) {
          // The error text could contain an interpolation string, so we need to compile it
          var val = $compile(generateErrorTag(errorType, errorText, fieldLabel))(scope);
          element.append(val);
          controller.addError(errorType, errorText, fieldLabel);
        } else {
          removeErrorMessage(controller, formController, element, errorType);
        }
        controller.refreshErrorText();
      });
    }

    /**
     * Handle text errors. Text errors are associated with a scope, rather than with a field.
     * This means we can clear them from the scope when the field-they-are-associated-with is changed.
     */
    function toggleErrorVisibilityForTextError(errorController, formController, fieldController, scope, element, watchExpr, fieldLabel) {
      //console.log('Watching error: ' + watchExpr);

      scope.$watch(watchExpr, function (newValue) {
        // Update the validity of the field's "watchExpr" error-key to match the value of the errorText
        fieldController.$setValidity(watchExpr, !newValue);

        // Remove the old error message for this same errorType first, in cases where the error message is changing.
        removeErrorMessage(errorController, formController, element, watchExpr);

        if (newValue) {
          // No need to compile the error message as we already have its value
          element.append(generateErrorTag(watchExpr, newValue, fieldLabel));
          errorController.addError(watchExpr, newValue, fieldLabel);

          // Turn the border red by sending a 'form-submit-attempted' event
          formController.setSubmitted(true);
        }
        errorController.refreshErrorText();
      });

      // When the field changes, clear the errorText value
      fieldController.$viewChangeListeners.push(function () {
        if (scope.$eval(watchExpr)) {
          scope.$eval(watchExpr + ' = null');
        }
      });
    }


    function removeErrorMessage(controller, formController, element, errorType) {
      // find the div with our special class, then remove it
      var divs = element.find('div');
      for (var len = divs.length, i = len - 1; i > -1; i--) {
        if (divs.eq(i).hasClass('ec2-' + errorType)) {
          divs.eq(i).remove();
        }
      }
      controller.removeError(errorType);
    }

    return {
      restrict: 'AE',
      require: ['^form'], // Require the formController controller somewhere in the parent hierarchy (mandatory for field-errors)
      template: '<div class="container-error"></div>',
      replace: true,
      link: function (scope, element, attr, controllers) {

        var fieldName = attr.fieldName,
          fieldLabel = attr.fieldLabel || '',
          formController = controllers[0],
          formName = formController.$name,
          formField = formName + '.' + fieldName,
          fieldErrors = scope.$eval(attr.fieldErrors || []),  // You can escape interpolation brackets inside strings by doing  \{\{   - wow!
          textErrors = scope.$eval(attr.textErrors || []);

        element.attr('id', formName + '-' + fieldName + '-errors');
        element.append('<span class="sr-only" aria-hidden="true" id="' + formName + '-' + fieldName + '-errors-aria"></span>');

        var ariaElement = element.find('span'),
          errorController = new ErrorController(ariaElement);   // new? Maybe make this the directive's controller instead

        for (var error in fieldErrors) {
          if (fieldErrors.hasOwnProperty(error)) {
            var errorShowCondition = formField + '.fieldState === "error" && ' + formField + '.$error.' + error;
            toggleErrorVisibilityOnError(errorController, formController, scope, element, errorShowCondition, error, fieldErrors[error], fieldLabel);
          }
        }

        // Watch formController[fieldName] - it may not have loaded yet. When it loads, call the main function.
        if (textErrors) {
          //console.log('textErrors: ' + textErrors + ', fieldName = ' + fieldName);
          var fieldWatcher = scope.$watch(function () {
            return formController[fieldName];
          }, function (newValue) {
            if (newValue) {
              fieldWatcher(); // Cancel the watcher

              // Do the actual thing you planned to do...
              for (var item in textErrors) {
                if (textErrors.hasOwnProperty(item)) {
                  toggleErrorVisibilityForTextError(errorController, formController, formController[fieldName], scope, element, textErrors[item], fieldLabel);
                }
              }
            }
          });
        }

        element.removeAttr('error-container').removeAttr('field-name').removeAttr('field-errors').removeAttr('text-errors');
      }
    };
  }]);
})(window.angular);

(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.formCheckbox', [
    'ngFormLib.controls.common',
    'ngFormLib.controls.errorMessageContainer'
  ]);

  // INPUT:
  //  <form-checkbox id="id" name="name" required="{{expression}}"
  //      ff-class="span12" ff-ng-model="application.contentType" ff-value="software" ff-aria-label="Software"
  //        ff-ng-click="doSomething()"
  //      field-errors="{required: 'Please select'}"
  //      text-errors="['wrong value']"
  //      >My label with <a href="http://www.google.com/">HTML bits</a> in it</form-checkbox>

  // OUTPUT:


  mod.directive('formCheckbox', ['formControlService', function (formControlService) {

    return formControlService.buildDirective({
      controlName: 'formCheckbox',
      templateType: 'templateUrl',
      expectedTemplateElements: ['input', 'label', 'div'],
      expectedAttributes: [],
      configFn: function(tElement, tAttr, id, name, inputElem) {
        // Move the class attribute from the outer-DIV to the checkbox DIV (special case)
        var checkboxDiv = tElement.find('div');
        checkboxDiv.addClass(tElement.attr('class'));
        tElement.removeAttr('class');

        formControlService.createErrorFeatures(tElement, inputElem, name, '', tAttr.fieldErrors, tAttr.textErrors);
        formControlService.buildNgClassExpression(inputElem, inputElem);  // Put the ng-class onto the input element itself, as this makes styling easier
      }
    });

  }]);
})(window.angular);

angular.module('ngFormLib/controls/formCheckbox/template/FormCheckboxTemplate.html', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ngFormLib/controls/formCheckbox/template/FormCheckboxTemplate.html',
    "<div form-group><div class=checkbox><input type=checkbox field-error-controller><label><span ng-transclude></span></label></div></div>"
  );

}]);

/*jshint maxstatements:30 */
(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.formDate', [
    'ngFormLib.controls.common',
    'ngFormLib.controls.errorMessageContainer'
  ]);

// INPUT:
//    <div form-date-input id="toDate" name="toDate" label="To date" hide-label="true" input-type="text"
//    ff-ng-model="acctCtrl.search.toDate" ff-max-date="today" ff-bs-show="acctCtrl.datePickers.datePickerTo"
//    ff-ng-blur="acctCtrl.toggleDatePicker('datePickerTo', true)"
//    ff-ng-focus="acctCtrl.toggleDatePicker('datePickerFrom', true)"
//    ff-class="form-control input-beta input-date"
//    field-errors="{date: 'ERROR.DATE_INVALID'}" >
//      <i class="calendar" ng-click="acctCtrl.toggleDatePicker('datePickerTo')"></i>
//    </div>


  mod.directive('formDate', ['formControlService', function (formControlService) {

    return formControlService.buildDirective({
      controlName: 'formDate',
      templateType: 'templateUrl',
      expectedTemplateElements: ['input', 'label'],
      expectedAttributes: ['label'],
      configFn: function(tElement, tAttr, id, name, inputElem, labelElem) {
        labelElem.prepend(tAttr.label);

        //formControlService.decorateInputGroup(tElement.find('div'), tAttr.inputGroupClass);
        formControlService.createFieldHint(tElement, inputElem, tAttr.fieldHint, id + '-hint', tAttr.fieldHintDisplay);
        formControlService.createErrorFeatures(inputElem.parent(), inputElem, name, tAttr.label, tAttr.fieldErrors, tAttr.textErrors);
      }
    });
  }]);

  mod.directive('formDateFormat', ['DateUtil', function (DateUtil) {
    // All dates greater than AD 0 and less than AD 10000 in dd/mm/yyyy format
    // RegEx behaves oddly if /g is uses in Regexp.test() situations
    var dateRegEx = /^(((0[1-9]|[12][0-9]|3[01])([\/])(0[13578]|10|12)([\/])(\d{4}))|(([0][1-9]|[12][0-9]|30)([\/])(0[469]|11)([\/])(\d{4}))|((0[1-9]|1[0-9]|2[0-8])([\/])(02)([\/])(\d{4}))|((29)(\/)(02)([\/])([02468][048]00))|((29)([\/])(02)([\/])([13579][26]00))|((29)([\/])(02)([\/])([0-9][0-9][0][48]))|((29)([\/])(02)([\/])([0-9][0-9][2468][048]))|((29)([\/])(02)([\/])([0-9][0-9][13579][26])))$/;

    return {
      require: 'ngModel',
      priority: 150,    // Higher priority than ui-mask (100), so the postLink function runs last
      link: function (scope, elem, attrs, ctrl) {


        ctrl.$parsers.unshift(function (viewValue) {


          // If viewValue is undefined or null, jump out
          if (!viewValue) {
            ctrl.$setValidity('date', true);
            ctrl.$setValidity('minDate', true);  // Turn off the error if the date format isn't valid
            ctrl.$setValidity('maxDate', true);  // Turn off the error if the date format isn't valid
            return viewValue;
          }

          // If viewValue is a string of 8 digits, then convert it to dd/dd/dddd first
          if (viewValue.length === 8 && !isNaN(viewValue * 1)) {
            viewValue = viewValue.substr(0, 2) + '/' + viewValue.substr(2, 2) + '/' + viewValue.substr(4);
          }

          // Check that it is a valid date
          var dateFormatValid = dateRegEx.test(viewValue) || typeof viewValue === 'undefined' || !viewValue;
          ctrl.$setValidity('date', dateFormatValid);

          //console.log('dateInput: ' + viewValue + ', ' + ctrl.$modelValue);

          // If the date is valid
          if (dateFormatValid && viewValue) {
            var fieldDate = DateUtil.getDate(viewValue);
            // and there is a min date, check if the value is greater than the min date
            if (attrs.minDate) {
              var minDate = DateUtil.getDate(attrs.minDate);
              ctrl.$setValidity('minDate', fieldDate.getTime() >= minDate.getTime());
            } else {
              ctrl.$setValidity('minDate', true);
            }
            // and there is a max date, check if the value is less than the max date
            if (attrs.maxDate) {
              var maxDate;

              if (attrs.maxDate === 'today') {
                maxDate = DateUtil.getDate(DateUtil.getToday());
              } else {
                maxDate = DateUtil.getDate(attrs.maxDate);
              }

              ctrl.$setValidity('maxDate', fieldDate.getTime() <= maxDate.getTime());
            } else {
              ctrl.$setValidity('maxDate', true);
            }
          } else {
            ctrl.$setValidity('minDate', true);  // Turn off the error if the date format isn't valid
            ctrl.$setValidity('maxDate', true);  // Turn off the error if the date format isn't valid
          }
          return viewValue;
        });

        ctrl.$viewChangeListeners.push(function () {
          // If there is a date-change attribute, execute it when the control is valid
          if (attrs.dateChange && ctrl.$valid) {
            scope.$eval(attrs.dateChange);
          }
        });
      }
    };
  }]);

})(window.angular);

angular.module('ngFormLib/controls/formDate/template/FormDateInputTemplate.html', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ngFormLib/controls/formDate/template/FormDateInputTemplate.html',
    "<div class=form-group><label class=control-label></label><div class=control-row><input class=form-control maxlength=10 placeholder=dd/mm/yyyy bs-datepicker form-date-format mask-date-digits><span ng-transclude></span></div></div>"
  );

}]);

(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.formInput', [
    'ngFormLib.controls.common',
    'ngFormLib.controls.errorMessageContainer'
  ]);

  // INPUT:
  //  <form-input id="" name="" label="Last name" required="{{expression}}"
  //      ff-class="span12" input-type="text|tel|email" ff-ng-model="application.lastName"
  //      ff-maxlength="40" ff-ng-pattern="/^[a-zA-Z0-9 \-.']+$/"
  //      field-hint="This must be the last name of the person who originally applied for the service."
  //      field-errors="{required: 'Please enter a valid last name', pattern: 'Please enter a valid last name'}"
  //      text-errors="['data.errors.']"
  //      content-class="span3"
  //      >My content</form-input>

  // OUTPUT:


  mod.directive('formInput', ['formControlService', function (formControlService) {

    return formControlService.buildDirective({
      controlName: 'formInput',
      templateType: 'template',
      expectedTemplateElements: ['input', 'label'],
      expectedAttributes: ['label', 'inputType'],
      configFn: function(tElement, tAttr, id, name, inputElem, labelElem) {
        labelElem.prepend(tAttr.label);

        formControlService.createFieldHint(tElement, inputElem, tAttr.fieldHint, id + '-hint', tAttr.fieldHintDisplay);
        formControlService.createErrorFeatures(inputElem.parent(), inputElem, name, tAttr.label, tAttr.fieldErrors, tAttr.textErrors);
      }
    });
  }]);
})(window.angular);

(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.formRadioButton', [
    'ngFormLib.controls.common',
    'ngFormLib.controls.errorMessageContainer'
  ]);

  // INPUT:
  //  <form-radio-button uid="fld" name="name" aria-label="Book Type" label-class="btn btn-toggle"
  //    ff-class="someCSS" ff-ng-model="application.bookType" ff-value="Fiction" ng-click="loadFiction()" class="span6">
  //     <icon class="icon-fiction"></icon>Fiction
  //  </form-radio-button>

  // OUTPUT:


  mod.directive('formRadioButton', ['formControlService', function (formControlService) {

    return formControlService.buildDirective({
      controlName: 'formRadioButton',
      templateType: 'templateUrl',
      expectedTemplateElements: ['input', 'label', 'div'],
      expectedAttributes: [], // The template should NOT have a form-group element inside it, as this has to be specified externally (due to the group-nature of radio buttons)
      configFn: function(tElement, tAttr, id, name, inputElem) {
        // Move the class attribute from the outer-DIV to the radio-button DIV (special case)
        var rbDiv = tElement.find('div');
        rbDiv.addClass(tElement.attr('class'));
        tElement.removeAttr('class');

        formControlService.createErrorFeatures(tElement, inputElem, name, '', tAttr.fieldErrors, tAttr.textErrors);
        formControlService.buildNgClassExpression(inputElem, inputElem);  // Put the ng-class onto the input element itself, as this makes styling easier
      }
    });

  }]);
})(window.angular);

angular.module('ngFormLib/controls/formRadioButton/template/FormRadioButtonTemplate.html', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ngFormLib/controls/formRadioButton/template/FormRadioButtonTemplate.html',
    "<div><div class=radio><input type=radio field-error-controller><label><span ng-transclude></span></label></div></div>"
  );

}]);

(function (angular) {

  'use strict';

  var mod = angular.module('ngFormLib.controls.formReset', []);

  mod.directive('formReset', ['$parse', function ($parse) {

    function resetFieldState(controlMap) {
    // Loops through the controlMap and reset's each field's state
      for (var item in controlMap) {
        if (controlMap.hasOwnProperty(item)) {
          var controlList = controlMap[item];
          for (var j = 0, jLen = controlList.length; j < jLen; j++) {
            var control = controlList[j].controller;
            control.fieldState = '';
          }
        }
      }
    }


    return {
      restrict: 'A',
      require: '^form',
      link: function(scope, element, attr, controller) {
        var ngModelGet = $parse(attr.formReset),
            ngModelSet = ngModelGet.assign;

        if (!ngModelSet) {
          throw Error('formReset requires an assignable scope-expression. "' + attr.formReset + '" is un-assignable.');
        }

        // Get a copy of the data as soon as the directive is created, which is after the scope/controller has been initialised (safe)
        var originalData = angular.copy(ngModelGet(scope));

        element.on('click', function () {
          if (typeof controller.setSubmitted === 'function') {
            controller.setSubmitted(false);
          }
          // Use a *copy* of the original data, as we don't want originalData to be modified by subsequent changes to the model by the form controls
          ngModelSet(scope, angular.copy(originalData));
          resetFieldState(controller._controls || {});
          controller.$setPristine();

          scope.$emit('event:FormReset');
          scope.$digest();
        });
      }
    };
  }]);
})(window.angular);

(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.formSelect', [
    'ngFormLib.controls.common',
    'ngFormLib.controls.errorMessageContainer'
  ]);

  // INPUT:
  //  <form-select id="frm-size" name="bookSize" required="true" label="Approximate size"
  //    ff-class="span12" ff-ng-model="model.size" placeholder="Select a size bracket"
  //    ff-ng-options="option.value as option.name for option in refData.bookSizes"
  //    field-errors="{required: 'Please select a size bracket'}"
  //    text-errors="['data.errors']"></form-select>

  // OUTPUT:



  mod.directive('formSelect', ['formControlService', function (formControlService) {

    function addPlaceholder(selectElem, placeholderText) {
      if (placeholderText) {
        selectElem.append('<option translate value="">' + placeholderText + '</option>');
      }
    }

    return formControlService.buildDirective({
      controlName: 'formSelect',
      templateType: 'templateUrl',
      inputElementName: 'select',
      expectedTemplateElements: ['select', 'label'],
      expectedAttributes: ['label'],
      configFn: function(tElement, tAttr, id, name, inputElem, labelElem) {
        labelElem.prepend(tAttr.label);
        addPlaceholder(inputElem, tAttr.placeholder);  // Adds the extra option element to the start of the <option>

        formControlService.createFieldHint(tElement, inputElem, tAttr.fieldHint, id + '-hint', tAttr.fieldHintDisplay);
        formControlService.createErrorFeatures(inputElem.parent(), inputElem, name, tAttr.label, tAttr.fieldErrors, tAttr.textErrors);
      }
    });

  }]);
})(window.angular);

angular.module('ngFormLib/controls/formSelect/template/FormSelectTemplate.html', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ngFormLib/controls/formSelect/template/FormSelectTemplate.html',
    "<div class=form-group><label class=control-label></label><div class=control-row><select class=form-control></select></div></div>"
  );

}]);

(function (angular) {

  'use strict';

  var mod = angular.module('ngFormLib.controls.formSubmit', []);

  /**
   *  formSubmitted - Executes an expression when the form is valid (essentially a form.submit() handler).
   *
   *  It can be applied to either the form element or to a button.
   *
   */
  mod.directive('formSubmit', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      require: ['^form'],   // Get the form controller
      link: function (scope, element, attr, controller) {

        var fn = $parse(attr.formSubmit) || angular.noop,
          isForm = element[0].tagName === 'FORM',
          formController = controller[0];

        element.bind(isForm ? 'submit' : 'click', function (event) {

          formController.setSubmitted(true);

          scope.$apply(function () {
            //scope.$emit('event:FormSubmitAttempted');

            if (formController.$valid) {
              if (fn(scope, {$event: event}) !== false) {
                // Needed by the tracking tool as it clears the input data after a submission.
                // Potentially, form field validation to be done here, but unnecessary at the moment.
                // The reset behaviour can be over-ridden by returning false from the called function (maybe prevent default aswell?)
                formController.setSubmitted(false);
                formController.$setPristine();
              }

            } else {
              event.preventDefault();
            }
          });
        });
      }
    };
  }]);
})(window.angular);

(function (angular) {
  'use strict';

  var mod = angular.module('ngFormLib.controls.requiredMarker', [
    'ngFormLib.controls.common',
    'ngFormLib/controls/requiredMarker/template/RequiredMarkerTemplate.html'
  ]);

  // Add a simple "required" marker that is not read-out by screen readers (as the field should also have a required indicator)
  //
  // INPUT:
  //  <span required-marker></span>
  //  <span required-marker hide="isNotRequired">Some Text</span>

  // OUTPUT:
  //  <span class="required" aria-hidden="true" ng-class="{\'ng-hide\': hide}" ng-transclude=""></span>
  //  <span class="required" aria-hidden="true" ng-class="{\'ng-hide\': hide}" ng-transclude="" hide="isNotRequired">Some Text</span>

  mod.directive('requiredMarker', ['formControlService', function (formControlService) {

    return {
      restrict: 'AE',
      replace: true,
      transclude: true,
      templateUrl: function(element, attr) {
        return attr.template || formControlService.getHTMLTemplate(element, 'requiredMarker');
      },
      scope: {
        hide: '='
      }
    };
  }]);
})(window.angular);

angular.module('ngFormLib/controls/requiredMarker/template/RequiredMarkerTemplate.html', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ngFormLib/controls/requiredMarker/template/RequiredMarkerTemplate.html',
    "<span class=required aria-hidden=true ng-class=\"{'ng-hide': hide}\" ng-transclude></span>"
  );

}]);

(function (angular) {
  'use strict';

  // The form policy intentionally has no hard dependencies.
  // If there are form-policy values that exist when the service is being constructed, it will use them.
  // Otherwise it will use no-op policy functions.
  var mod = angular.module('ngFormLib.policy', []);


  // This is a configurable service
  // It should contain the _default_ values for form policies

  mod.provider('formPolicyService', function () {
    var self = this,
      noop = angular.noop,
      nullBehaviourOnStateChange = function () {
        return {
          applyBehaviour: noop,
          resetBehaviour: noop
        };
      },
      nullStateChanges = function () {
        return {};
      };

    self.defaults = {
      formSubmitAttemptedClass: 'form-submit-attempted',
      fieldErrorClass: 'has-error',
      fieldSuccessClass: 'has-success',
      behaviourOnStateChange: null,    // Previously called focusBehavior
      checkForStateChanges: null,
      stateDefinitions: null
    };

    this.$get = ['$injector', function ($injector) {

      function getService(name) {
        try {
          return $injector.get(name);
        } catch (e) {
          return null;    // Provider-not-found error, ignore and move on
        }
      }

      // Policy precedence: this.defaults, policy-value-object, noop
      self.defaults.behaviourOnStateChange = self.defaults.behaviourOnStateChange || getService('formPolicyBehaviourOnStateChange') || nullBehaviourOnStateChange;
      self.defaults.checkForStateChanges = self.defaults.checkForStateChanges || getService('formPolicyCheckForStateChanges') || noop;
      self.defaults.stateDefinitions = self.defaults.stateDefinitions || getService('formPolicyStateDefinitions') || nullStateChanges;

      var policyService = {
        getCurrentPolicy: function () {
          return angular.copy(self.defaults);
        }
      };

      return policyService;
    }];
  });


  function formDirective(formPolicyService) {

    return {
      //priority: -1,
      restrict: 'AE',
      scope: {
        formPolicy: '&' // Trick - we don't want two-way binding, only want to do this once
      },
      require: ['?form'], // Tells the directive to get the controller for the 'form' directive, which is the FormController controller
      compile: function(tElement, tAttr) {

        // Use element.data() to store a reference to this element for use by child.inheritedData()
        // Will storing an element this way cause a memory leak? Or should I just store the data I currently need (attr.class)
        // This has to happen during the compile step, as the children need access to the variable when they are compiled
        tElement.data('formElementClasses', tAttr.class);

        return {
          pre: function (scope, element, attr, controller) {
            // We want to extend the FormController by adding a form policy
            var formController = controller[0];
            formController._policy = angular.extend(formPolicyService.getCurrentPolicy(), scope.formPolicy());

            // Determine if we have a parent form controller. If we do, we want to use it for the focus behaviour
            formController._parentController = element.parent().controller('form');

            if (!formController._parentController) {
              // We also want to add an element reference when a control is added
              formController._controls = {};
            }

            // Generate the focus policy function for use by other directive
            formController._applyFormBehaviourOnStateChangePolicy = formController._policy.behaviourOnStateChange(formController);

            // Add/remove a class onto the form based on the value of the formSubmitted variable
            formController.setSubmitted = function (value, tellNoOne) {
              element[value ? 'addClass' : 'removeClass'](formController._policy.formSubmitAttemptedClass);
              formController._formSubmitAttempted = value;
              formController._applyFormBehaviourOnStateChangePolicy.resetBehaviour();

              if (value && !tellNoOne) {
                // We need to use the parent scope because this scope is an isolate scope at the moment
                scope.$parent.$broadcast('event:FormSubmitAttempted');
              }
            };

            // Flag to indicate whether the form has been submitted
            formController._formSubmitAttempted = false;
            formController._applyFormBehaviourOnStateChangePolicy.resetBehaviour();

            // If this form is an ngForm (in that it has a parent 'form'), then we need to make sure that
            // when the parent form is submitted or reset, the same thing happens to the child forms
            if (formController._parentController) {
              scope.$watch(function() { return formController._parentController._formSubmitAttempted; }, function(value) {
                if (value !== undefined) {
                  //formController.setSubmitted(!!value, true);  // Don't send another notification, just update our own state
                  formController.setSubmitted(!!value);  // Don't send another notification, just update our own state
                }
              });
            }
          }
        };
      }
    };
  }
  mod.directive('form', ['formPolicyService', formDirective]);
  mod.directive('ngForm', ['formPolicyService', formDirective]);


  // We want our formController to expose the list of controls that are registered with the form,
  // including controls inside sub-forms. That allows us to reset them directly. Relying simply on the fieldName
  // does not work when using sub-forms inside ng-repeaters.

  var inputElements = ['input', 'select'];

  angular.forEach(inputElements, function (inputElem) {
    mod.directive(inputElem, function () {

      function hookupElementToNameToElementMap(formController, element, fieldName, fieldController) {
        // Each element in the map is an array, because form elements *can have the same name*!
        var map = formController._controls;
        if (!map[fieldName]) {
          map[fieldName] = [];
        }
        // Add the field to the end of the list of items with the same name
        map[fieldName][map[fieldName].length] = {'element': element, 'controller': fieldController};


        element.on('$destroy', function () {
          // Delete just this element from the map of controls
          var map = formController._controls[element.attr('name')];
          var elementId = element.attr('id');
          for (var i = 0; i < map.length; i++) {
            if (map[i].element.attr('id') === elementId) {
              map.splice(i, 1);
              break;
            }
          }
        });
      }

      return {
        restrict: 'E',
        require: ['?^form', '?ngModel'],
        link: {
          pre: function (scope, element, attr, controllers) {
            if (!controllers[0]) {
              return;
            }

            var rootFormController = controllers[0]._parentController || controllers[0],
                fieldController = controllers[1],
                name = attr.name;

            if (rootFormController && rootFormController._controls) {
              hookupElementToNameToElementMap(rootFormController, element, name, fieldController);
            }
          }
        }
      };
    });
  });

})(window.angular);

(function (win, angular) {
  'use strict';

  // Helper functions
  var timeoutPromise, scrollPromise;

  function setFocusOnField($document, $timeout, duration, element) {
    // If no offsetHeight then assume it's invisible and let the next error field take the scroll position
    // Safe because no element will ever have offsetTop of 0 due to our header
    if (element[0].offsetHeight) {
//      //console.log('Error focus set to: ' + domElement.id);
      $timeout.cancel(timeoutPromise);
      $timeout.cancel(scrollPromise);   // This doesn't seem to make a difference on a Mac - user-generated scrolling does not get cancelled
      timeoutPromise = $timeout(function() { element[0].focus();}, duration);
      scrollPromise = $document.scrollToElement(element, 0, duration);  // scrollToElement() comes from the angular-scroll directive // No offset
      return true;
    }
    return false; // Indicate that we did NOT set the focus
  }



  /**
   * Returns a function that can be called when an error is showing FOR THIS FIELD. The function is dynamically created
   *  based on the form policy.
   *
   *  The dynamic function sets the focus if the form policy allows it to
   *  The input parameters are:
   *    - DOMElement of the current form-field control that could get focus
   *    - whether an error is showing on the form-field
   *    - whether the form was just attempted to be submitted
   *
   *  The returned function is stored against the form controller as _applyFormFocusPolicy(...)
   *  _applyFormFocusPolicy() should be called by the field-error-controller directive whenever the field state changes,
   *   and when a form-submit event occurs.
   */
  angular.module('ngFormLib.policy.behaviourOnStateChange', ['duScroll'])
    .service('formPolicyBehaviourOnStateChangeLibrary', ['$document', '$timeout', 'duScrollDuration',
      function ($document, $timeout, duScrollDuration) {

        // Policy implementation functions
        function behaviourOnErrorFocusFirstField(formController) {
          // We want to pretend that there is a single controller for the form, for the purpose of managing the focus.
          // Otherwise, the main form sets the focus, then the subform (ng-form) also sets the focus
          var focusController = formController._parentController || formController;

          return {
            // This function is called by the fieldErrorController when the fieldState changes and when the form is submitted
            applyBehaviour: function (fieldElem, fieldState, formSubmitAttempted) {
              // Set the focus to the field if there is an error showing and a form-submit has been attempted
              if (fieldState === 'error' && formSubmitAttempted) {
                // ...and if the focusErrorElement is blank...
                if (!focusController._focusErrorElement && setFocusOnField($document, $timeout, duScrollDuration, fieldElem)) {
                  focusController._focusErrorElement = fieldElem;
                }
              }
            },
            resetBehaviour: function() {
              focusController._focusErrorElement = null;
            }
          };
        }

        return {
          onSubmitFocusFirstFieldIfError: behaviourOnErrorFocusFirstField
        };
      }
    ])
    .factory('formPolicyBehaviourOnStateChange', ['formPolicyBehaviourOnStateChangeLibrary', function(formPolicyBehaviourOnStateChangeLibrary) {
      return formPolicyBehaviourOnStateChangeLibrary.onSubmitFocusFirstFieldIfError;
    }]);
})(window, window.angular);

(function (angular) {
  'use strict';

  // Policy implementation functions
  function checkForStateChangesOnBlurUntilSubmitThenOnChange(scope, element, name, stateDefinitions, ngModelController) {
    var errorWatch;

    scope.$on('event:FormSubmitAttempted', function () {
      (errorWatch || angular.noop)(); // Remove the error watcher, which may-or-may-not be present
      errorWatch = watchForErrorChanges(scope, stateDefinitions, ngModelController);
      //console.log('heard formSubmitAttempted');
    });


    // Listen for the form reset event and cancel the submit-watcher
    scope.$on('event:FormReset', function () {
      (errorWatch || angular.noop)(); // Remove the error watcher, which may-or-may-not be present
      //console.log('heard formReset');
    });

    watchForBlurEvent(scope, element, name, stateDefinitions, ngModelController);
  }


  function checkForStateChangesOnChange(scope, element, name, stateDefinitions, ngModelController) {
    // Watch the error condition for changes, and flag the field as inErrorShowing when the errorCondition is true
    watchForErrorChanges(scope, stateDefinitions, ngModelController);
  }

  function checkForStateChangesOnBlur(scope, element, name, stateDefinitions, ngModelController) {
    watchForBlurEvent(scope, element, name, stateDefinitions, ngModelController);
  }


  // Helper methods
  function createWatch(scope, ngModelController, stateName, stateCondition) {
    scope.$watch(stateCondition, function (value) {
      if (value === true) {
        ngModelController.fieldState = stateName;       // THIS IS THE KEY FLAG
        //console.log('A: ' + stateCondition + ' = ' + value);
      }
    });
  }

  function watchForErrorChanges(scope, stateDefinitions, ngModelController) {
    // Set up a watch for each state definition... expensive?
    for (var stateName in stateDefinitions) {
      if (stateDefinitions.hasOwnProperty(stateName)) {
        createWatch(scope, ngModelController, stateName, stateDefinitions[stateName]);
      }
    }
  }

  function evaluateFieldStates(scope, stateDefinitions, ngModelController) {
    for (var prop in stateDefinitions) {
      if (scope.$eval(stateDefinitions[prop]) === true) {
        ngModelController.fieldState = prop;
        //console.log('B: ' + stateDefinitions[prop] + ' = ' + prop);
        break;
      }
    }
  }

  function watchForBlurEvent(scope, element, fieldName, stateDefinitions, ngModelController) {
    // Determine the initial field state. First state to evaluate to TRUE wins
    evaluateFieldStates(scope, stateDefinitions, ngModelController);

    element.bind('blur', function ngShowWatchAction() {
      evaluateFieldStates(scope, stateDefinitions, ngModelController);
      scope.$apply(); // We are in a jQueryLite handler and have changed a scope property - fire the watchers!
    });
  }

  // Define the different display trigger implementations available
  angular.module('ngFormLib.policy.checkForStateChanges', [])
    .constant('formPolicyCheckForStateChangesLibrary', (function () {
      return {
        onChange: checkForStateChangesOnChange,
        onBlur: checkForStateChangesOnBlur,
        onBlurUntilSubmitThenOnChange: checkForStateChangesOnBlurUntilSubmitThenOnChange
      };
    })())

    // This 'service' is the default implementation of the check-for-errors policy
    .factory('formPolicyCheckForStateChanges', ['formPolicyCheckForStateChangesLibrary', function(formPolicyCheckForStateChangesLibrary) {
      return formPolicyCheckForStateChangesLibrary.onBlurUntilSubmitThenOnChange;
    }]);

})(window.angular);

(function (angular) {
  'use strict';

  // Define the different display trigger implementations available
  var mod = angular.module('ngFormLib.policy.stateDefinitions', []);


  // Error Conditions
  function errorOnSubmit(formName, fieldName) {
    return formName + '._formSubmitAttempted && ' + fieldName + '.$invalid';
  }

  function errorOnDirty(formName, fieldName) {
    return fieldName + '.$dirty && ' + fieldName + '.$invalid';
  }

  function errorImmediately(formName, fieldName) {
    return fieldName + '.$invalid';
  }

  function errorOnSubmitAndDirty(formName, fieldName) {
    return formName + '._formSubmitAttempted && ' + fieldName + '.$dirty && ' + fieldName + '.$invalid';
  }

  function errorOnSubmitOrDirty(formName, fieldName) {
    return '(' + formName + '._formSubmitAttempted || ' + fieldName + '.$dirty) && ' + fieldName + '.$invalid';
  }

  mod.value('formPolicyErrorDefinitionLibrary', (function () {
    return {
      onSubmit: errorOnSubmit,
      onDirty: errorOnDirty,
      immediately: errorImmediately,
      onSubmitAndDirty: errorOnSubmitAndDirty,
      onSubmitOrDirty: errorOnSubmitOrDirty
    };
  })());


  // Success Definitions
  function successOnSubmit(formName, fieldName) {
    return formName + '._formSubmitAttempted && ' + fieldName + '.$valid';
  }

  function successOnDirty(formName, fieldName) {
    return fieldName + '.$dirty && ' + fieldName + '.$valid';
  }

  function successImmediately(formName, fieldName) {
    return fieldName + '.$valid';
  }

  function successOnSubmitAndDirty(formName, fieldName) {
    return formName + '._formSubmitAttempted && ' + fieldName + '.$dirty && ' + fieldName + '.$valid';
  }

  function successOnSubmitOrDirty(formName, fieldName) {
    return '(' + formName + '._formSubmitAttempted || ' + fieldName + '.$dirty) && ' + fieldName + '.$valid';
  }

  mod.value('formPolicySuccessDefinitionLibrary', (function () {
    return {
      onSubmit: successOnSubmit,
      onDirty: successOnDirty,
      immediately: successImmediately,
      onSubmitAndDirty: successOnSubmitAndDirty,
      onSubmitOrDirty: successOnSubmitOrDirty
    };
  })());

    // This 'service' is the default implementation of the check-for-errors policy
  mod.factory('formPolicyStateDefinitions', ['formPolicyErrorDefinitionLibrary', 'formPolicySuccessDefinitionLibrary',
    function(formPolicyErrorDefinitionLibrary, formPolicySuccessDefinitionLibrary) {

      // The FieldErrorController will ask for the stateDefinitions, passing the formName and fieldName as parameters
      return function(formName, fieldName) {
        // Return an object with the stateName(key) and the stateDefinition string(value)
        return {
          'error': formPolicyErrorDefinitionLibrary.onSubmitOrDirty(formName, fieldName),
          'success': formPolicySuccessDefinitionLibrary.onSubmitOrDirty(formName, fieldName)
        };
      };
    }
  ]);
})(window.angular);
