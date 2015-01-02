module.exports = function(grunt) {
  'use strict';

  var config = grunt.config.get('cfg.verify');

  grunt.extendConfig({
    verify: {
      all: ['jshint:all', 'jscs:all'],
      src: ['jshint:src', 'jscs:src'],
      test: ['jshint:test', 'jscs:test'],
      ci: ['jshint:ci', 'jscs:ci']
    },
    //jscs, check for code style errors
    jscs: {
      options: {
        config: config.jscs.baseConfig,
        reporter : 'text'
      },
      all: {
        files: {
          src: config.allFiles
        }
      },
      src: {
        files: {
          src: config.srcFiles
        }
      },
      test: {
        files: {
          src: config.testFiles
        }
      },
      ci: {
        options: {
          config: config.jscs.CIConfig,
          reporter: 'junit',
          reporterOutput : config.reportDir + 'jscs.xml'
        },
        files: {
          src: config.allFiles
        }
      }
    },
    jshint: {
      options: {
        jshintrc: config.jshint.baseConfig,
        reporter: require('jshint-stylish')
      },
      all: {
        src: config.allFiles
      },
      src: {
        src: config.srcFiles
      },
      test: {
        options: {
          jshintrc: config.jshint.testConfig
        },
        src: config.testFiles
      },
      ci: {
        options: {
          jshintrc: config.jshint.CIConfig,
          reporter: require('jshint-junit-reporter'),
          reporterOutput: config.reportDir + 'jshint.xml'
        },
        src: config.srcFiles
      }
    }
  });

  grunt.registerMultiTask('verify', 'Verify Javascript syntax and style', function () {
    grunt.log.writeln(this.target + ': ' + this.data);

    // Execute each task
    grunt.task.run(this.data);
  });
};
