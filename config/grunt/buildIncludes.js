module.exports = function(grunt) {
  'use strict';

  var config = grunt.config.get('cfg.buildIncludes');

  /**
   // "includes" refers to files that are separated from code (JS/HTML/CSS) at design time,
   // but are *included* into the code at *compile-time*. They should NOT
   // exist in the destination folder, but are normally copied to a temporary
   // directory that is near the file that will include them.
   // They should be module-specific, with "global" includes in the "core" module.
   */


  grunt.extendConfig({
    clean: {
      buildIncludes: config.clean
    },
    copy: {
      includesToTemp: config.copy
    },

    watch: {
      includes: {
        files: config.watch.files,
        tasks: ['_build']
      }
    },

    includereplace: {
      options: {
        prefix: '//@@',  // This works for HTML and JS replacements
        suffix: '',
        globals: {}
      }
    }
  });


  grunt.registerTask('_buildIncludes', 'PRIVATE - do not use', [
    'clean:buildIncludes',
    'copy:includesToTemp'
  ]);

};
