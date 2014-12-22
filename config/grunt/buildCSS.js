module.exports = function(grunt) {
  'use strict';

  var paths = grunt.config.get('paths.buildCSS');

  grunt.extendConfig({
    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['> 2%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
      },
      dist: {
        files: [{
          expand: true,
          cwd: paths.compiledCSSDir,
          src: paths.compiledCSSFiles,
          dest: paths.compiledCSSDir
        }]
      }
    },
    copy: {
      externalCSS: {
        files: paths.externalCSSFiles
      }
    },
    //stylus implementation
    stylus: {
      compile: {
        options: {
          compress: false
        },
        paths: paths.stylusDirs,
        files: [{
          expand: true,
          flatten: true,
          cwd: paths.preCompiledCSSDir,
          src: paths.preCompiledCSSFiles,
          dest: paths.compiledCSSDir,
          ext: '.css'
        }]
      }
    },
    watch: {
      compileCss: {
        files: paths.preCompiledCSSDir + '**/*.styl',
        tasks: ['stylus', 'autoprefixer']
      }
    }
  });

  grunt.registerTask('_buildCSS', ['stylus', 'autoprefixer', 'copy:externalCSS']);
};
