'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.extendConfig({
    includereplace: {
      options: {
        prefix: '//@@',  // This works for HTML and JS replacements
        suffix: '',
        globals: {}
      }
    }
  });


  grunt.registerTask('default', ['dev']);

  grunt.loadTasks('config/grunt');  // Loads all the Grunt tasks inside the config/grunt folder
};
