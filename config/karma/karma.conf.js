// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-07-02 using
// generator-karma 0.8.2

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // base path, that will be used to resolve files and exclude
    basePath: '../../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser - defined in /config/grunt/unitTest.js

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-junit-reporter',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-ng-html2js-preprocessor'
    ],

    coverageReporter: {
      reporters: [
        { type: 'html' },
        { type: 'lcov' },
        { type: 'text' },         // Needed for grunt-istanbul-coverage task
        { type: 'json' }          // Needed for grunt-istanbul-coverage task
      ],
      dir : 'reports/coverage/'
    },

    ngHtml2JsPreprocessor: {
      // Define a custom module name function (stripping the 'src/modules/' from the file path)
      // which gives you something like:
      //   angular.module('form/template/FormCheckboxTemplate.html', []).run(function($templateCache) {
      //     $templateCache.put('form/template/FormCheckboxTemplate.html',
      //         '<!-- form.controls.checkbox.template -->\n' +
      //         '<div>\n' +
      //         '  <div class="checkbox">\n' +
      //         '    <input type="checkbox" field-error-controller>\n' +
      //         '    <label><span ng-transclude></span></label>\n' +
      //         '  </div>\n' +
      //         '</div>');
      //   });
      cacheIdFromPath: function(filepath) {
        return filepath.substr('src/modules/'.length);
      }//,

      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      //moduleName: 'foo'
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_ERROR//,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
