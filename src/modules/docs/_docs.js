(function(angular) {
  'use strict';

  var mod = angular.module('ngFormLibDocs', [
    'mgcrea.ngStrap',
    'ngFormLib',
    'ngFormLib.policy.behaviourOnStateChange',
    'ngFormLib.policy.checkForStateChanges',
    'ngFormLib.policy.stateDefinitions',


    'pascalprecht.translate',   // Language module
    'duScroll'                  // Smooth-scroll module
  ]);

  mod.config(['$locationProvider', function($locationProvider) {
    // configure html5 to get links working on jsfiddle
    $locationProvider.html5Mode(false);
  }])
  .config(['$anchorScrollProvider', function($anchorScrollProvider) {
    $anchorScrollProvider.disableAutoScrolling();
  }])
  .config(['$translateProvider', function($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/docs/language/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('enAU');
  }])
    // Set the field-error-focus-scroll-position, to allow for the website's fixed header
  .config(['formPolicyServiceProvider', function(formPolicyServiceProvider) {
    formPolicyServiceProvider.defaults.fieldFocusScrollOffset = 80;
  }]);


  mod.controller('MainController', ['$http', function($http) {
    var vm = this; // view-model

    // Fetch the documentation config and store it on the rootScope (for laughs :)
    $http.get('assets/docs/config/docsConfig.json').then(function(result) {
      vm.DOC_CONFIG = result.data;
      vm.REPO_HOST = result.data.repository.host;
      vm.REPO = vm.REPO_HOST + result.data.repository.branch;
      vm.VERSION = result.data.version;
    });
  }]);


  // These directives are purely needed for documentation purposes
  mod.directive('code', function() {
    return {restrict: 'E', terminal: true};
  })

    .directive('appendSource', ['$window', '$compile', 'indent', function($window, $compile, indent) {

      return {
        compile: function(element, attr) {

          // Directive options
          var options = {placement: 'after'};
          angular.forEach(['placement', 'hlClass'], function(key) {
            if (angular.isDefined(attr[key])) {
              options[key] = attr[key];
            }
          });

          var hlElement = angular.element('<div class="highlight" ng-non-bindable><pre><code class="html" style="margin:0"></code></pre></div>');
          var codeElement = hlElement.children('pre').children('code');
          var elementHtml = indent(element.html());
          codeElement.text(elementHtml);
          if (options.hlClass) {
            codeElement.addClass(options.hlClass);
          }
          element[options.placement](hlElement);
          $window.hljs.highlightBlock(codeElement[0]);

        }
      };

    }])

    .directive('highlightBlock', ['$window', 'indent', function($window, indent) {

      return {
        compile: function(element) {
          element.html(indent(element.html()));
          return function postLink(scope, element) {
            $window.hljs.highlightBlock(element[0]);
          };
        }
      };
    }])

    .value('indent', function(text, spaces) {

      if (!text) {
        return text;
      }
      var lines = text.split(/\r?\n/);
      var prefix = '      '.substr(0, spaces || 0);
      var i;

      // Remove any leading blank lines
      while (lines.length && lines[0].match(/^\s*$/)) {
        lines.shift();
      }
      // Remove any trailing blank lines
      while (lines.length && lines[lines.length - 1].match(/^\s*$/)) {
        lines.pop();
      }
      // Calculate proper indent
      var minIndent = 999;
      for (i = 0; i < lines.length; i++) {
        var line = lines[0];
        var indent = line.match(/^\s*/)[0];
        if (indent !== line && indent.length < minIndent) {
          minIndent = indent.length;
        }
      }

      for (i = 0; i < lines.length; i++) {
        lines[i] = prefix + lines[i].substring(minIndent).replace(/=""/g, '');
      }
      lines.push('');
      return lines.join('\n');

    });


  // Anchor directive
  // Add anchor-like behaviour to any element, and take advantage of smooth scrolling
  mod.directive('ahref', ['$location', '$document', 'scrollContainerAPI', 'duScrollDuration',
    function($location, $document, scrollContainerAPI, duScrollDuration) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          element.on('click', function() {
            // The anchor reference should be valid
            var ahref = attrs.ahref;
            if (!ahref || ahref.indexOf('#') === -1) {
              return;
            }
            var elemId = ahref.replace(/.*(?=#[^\s]+$)/, '').substring(1);

            // Only add the scroll to the history if directed to
            if (attrs.useHash) {
              $location.hash(elemId);  // Change the URL
              scope.$apply();
            }
            var target = $document[0].getElementById(elemId);
            if (!target || !target.getBoundingClientRect) {
              return;
            }

            var offset = parseInt(attrs.scrollOffset || 0) + (attrs.scrollBottom === 'true' ? -target.offsetHeight : 0);
            var duration = attrs.duration ? parseInt(attrs.duration, 10) : duScrollDuration;
            var container = scrollContainerAPI.getContainer(scope);
            container.scrollToElement(angular.element(target), isNaN(offset) ? 0 : offset, isNaN(duration) ? 0 : duration);
          });
        }
      };
    }
  ]);

})(window.angular);
