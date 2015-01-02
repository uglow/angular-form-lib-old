module.exports = function(grunt) {
  'use strict';

  var config = grunt.config.get('cfg.unitTest');

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
        root: config.reportDir
      }
    },
    // Test settings
    karma: {
      options: {
        'files': config.testFiles,
        'exclude': config.excludeFiles,
        'preprocessors': config.preprocessors
      },
      unit: {
        configFile: config.baseConfig,
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: ['progress', 'coverage']
      },
      browser: {
        configFile: config.browserConfig,
        singleRun: false,
        browsers: ['Chrome'],
        reporters: []
      },
      ci: {
        configFile: config.CIConfig,
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: ['progress', 'junit', 'coverage'],
        junitReporter: {
          outputFile: config.reportDir + 'unit-tests.xml'
        }
      }
    }
  });


  grunt.registerTask('test', ['unitTest']);

  grunt.registerTask('unitTest', ['verify:all', 'karma:ci', 'coverage']);
};
