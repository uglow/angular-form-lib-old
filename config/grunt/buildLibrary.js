module.exports = function(grunt) {
  'use strict';

  var paths = grunt.config.get('paths.library');

  grunt.extendConfig({
    buildLibrary: {
      pre: ['clean:library'],
      srcFiles: ['copy:libFiles'],
      distFiles: ['concat:library', 'uglify:library']
    },

    clean: {
      library: paths.dest.dir
    },

    concat: {
      library: {
        files: [
          {src: paths.src.jsFilesToConcat, dest: paths.dest.jsFile}
        ]
      }
    },

    copy: {
      libFiles: {
        files: paths.copy.files
      }
    },

    uglify: {
      library: {
        options: {
          report: 'min',
          compress: {
            /* Conditional compilation vars are conditionally removed by this step.
             * Leave prod.json > CONDITIONAL_COMPILATION as '' and set variables here (to remove left-over code)*/
            'global_defs': {
              //"DEBUG": '<%= env.environment.debugMode %>'
            },
            'dead_code': true
          },
          mangle: true
        },
        files: [
          {src: paths.dest.jsFile, dest: paths.dest.jsMinFile}
        ]
      }
    }
  });


  grunt.registerMultiTask('buildLibrary', 'Build the library for distribution via Bower', function () {
    grunt.log.writeln(this.target + ': ' + this.data);

    // Execute each task
    grunt.task.run(this.data);
  });
};
