module.exports = function(grunt) {
  'use strict';

  var paths = grunt.config.get('paths.verify');

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
        config: paths.jscs.baseConfig,
        reporter : 'text'
      },
      all: {
        files: {
          src: paths.allFiles
        }
      },
      src: {
        files: {
          src: paths.srcFiles
        }
      },
      test: {
        files: {
          src: paths.testFiles
        }
      },
      ci: {
        options: {
          config: paths.jscs.CIConfig,
          reporter: 'junit',
          reporterOutput : paths.reportDir + 'jscs.xml'
        },
        files: {
          src: paths.allFiles
        }
      }
    },
    jshint: {
      options: {
        jshintrc: paths.jshint.baseConfig,
        reporter: require('jshint-stylish')
      },
      all: {
        src: paths.allFiles
      },
      src: {
        src: paths.srcFiles
      },
      test: {
        options: {
          jshintrc: paths.jshint.testConfig
        },
        src: paths.testFiles
      },
      ci: {
        options: {
          jshintrc: paths.jshint.CIConfig,
          reporter: require('jshint-junit-reporter'),
          reporterOutput: paths.reportDir + 'jshint.xml'
        },
        src: paths.srcFiles
      }
    }
  });

  grunt.registerMultiTask('verify', 'Verify Javascript syntax and style', function () {
    grunt.log.writeln(this.target + ': ' + this.data);

    // Execute each task
    grunt.task.run(this.data);
  });
};
