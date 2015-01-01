module.exports = function(grunt) {
  'use strict';

  // Tasks should generally watch their own files.
  // When multiple tasks watch the same files, put the watch config here

  grunt.extendConfig({
    watch: {
      js: {
        files: ['<%= paths.buildJS.watch.allJSSrc.files %>'],
        tasks: ['_buildJS', 'newer:jshint:all', 'newer:jscs:all', 'karma:unit']
      }
    }
  });

};
