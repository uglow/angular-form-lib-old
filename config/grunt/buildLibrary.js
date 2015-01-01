module.exports = function(grunt) {
  'use strict';

  var config = grunt.config.get('paths.library');

  grunt.extendConfig({
    clean: {
      library: config.clean
    },

    concat: {
      library: config.concat
    },

    copy: {
      libFiles: config.copy
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
        files: config.uglify.files
      }
    }
  });


  grunt.registerTask('buildLibrary', ['clean:library', 'copy:libFiles', 'concat:library', 'uglify:library']);
};
