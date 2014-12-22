module.exports = function(grunt) {
  'use strict';

  var paths = grunt.config.get('paths');

  grunt.extendConfig({
    clean: {
      dev: paths.build.dev.dir
    },

    compress: {
      main: {
        options: {
          mode: 'zip',
          archive: 'artifacts/build.zip'
        },
        files: [{
          expand: true,
          src: '**/*',
          cwd: paths.build.prod.dir,
          dot: true
        }]
      }
    },

    watch: {
      // Watch the Grunt config files - if they change, rebuild
      gruntConfig: {
        files: paths.config.gruntFiles,
        tasks: ['_build']
      },
      // Watch the output files
      dev: {
        files: paths.build.dev.livereloadFiles,
        options: {
          livereload: true
        }
      }
    }
  });


  grunt.registerTask('_build', 'PRIVATE - do not use', ['clean:dev', '_buildJS', '_buildCSS', '_buildHTML', 'verify:all']);


  /****************** BUILD TYPE ******************/
  grunt.registerTask('_build_unoptimised', 'PRIVATE - do not use. Create an UN-optimised build', ['_build']);

  grunt.registerTask('_build_optimised', 'PRIVATE - do not use. Create an optimised build',      ['_build', 'buildLibrary', 'buildDocs', 'beep:twobits']);

  grunt.registerTask('_build_watch', 'PRIVATE - do not use. Create an UN-optimised build & watch it.', ['_build_unoptimised', 'serve:dev', 'watch']);


  /****************** CI ENVIRONMENT **************/

  /* No need to package - Nexus will do this via the nexus:client task. */
  /* For the production build, you need a production task  */
  grunt.registerTask('dev:ci', 'Create a dev build for CI', ['_build_unoptimised']);


  /****************** USER ENVIRONMENTS **************/
  // There are only 2 kinds of builds - development and production (optimized).
  // Unit tests run against development source code (unminified, but concatenated)

  grunt.registerTask('dev', 'Create a dev build then watch for changes', ['_build_watch']);

  grunt.registerTask('build', 'Create a release build', function(target) {
    if (target === 'serve') {
      return grunt.task.run(['_build_optimised', 'serve:prod']);
    } else {
      return grunt.task.run(['_build_optimised']);
    }
  });
};
