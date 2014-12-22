module.exports = function(grunt) {
  'use strict';

  var paths = grunt.config.get('paths.unitTest');

  grunt.extendConfig({
    coverage: {
      options: {
        thresholds: {
          statements: 80,
          branches: 80,
          lines: 70,  // This should move to 80
          functions: 80
        },
        dir: 'coverage',
        root: paths.reportDir
      }
    },
    // Test settings
    karma: {
      options: {
        'files': paths.testFiles,
        'exclude': paths.excludeFiles,
        'preprocessors': paths.preprocessors
      },
      unit: {
        configFile: paths.baseConfig,
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: ['progress', 'coverage']
      },
      browser: {
        configFile: paths.browserConfig,
        singleRun: false,
        browsers: ['Chrome'],
        reporters: []
      },
      ci: {
        configFile: paths.CIConfig,
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: ['progress', 'junit', 'coverage'],
        junitReporter: {
          outputFile: paths.reportDir + 'unit-tests.xml'
        }
      }
    }
  });


  grunt.registerTask('test', ['unitTest']);

  grunt.registerTask('unitTest', ['verify:all', 'karma:ci', 'coverage']);
};
