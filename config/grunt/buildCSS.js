module.exports = function(grunt) {
  'use strict';

  var config = grunt.config.get('cfg.buildCSS');

  grunt.extendConfig({
    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['> 2%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
      },
      dist: config.autoPrefix
    },
    copy: {
      externalCSS: config.copy
    },
    //stylus implementation
    stylus: {
      compile: {
        options: {
          compress: false
        },
        paths: config.compile.sourceDirs,
        files: config.compile.files
      }
    },
    watch: {
      compileCss: {
        files: config.watch.files,
        tasks: ['stylus', 'autoprefixer']
      }
    }
  });

  grunt.registerTask('_buildCSS', ['stylus', 'autoprefixer', 'copy:externalCSS']);
};
