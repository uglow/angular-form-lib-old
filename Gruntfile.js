'use strict';

module.exports = function(grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // The actual project configuration - this will be different for each project
  grunt.initConfig({
    // Configuration to be run (and then tested).
    modularProject: {

      buildCSS: {
        rootSourceFiles:  ['**/styles/docs.styl', '**/styles/sampleFormStyle.styl'],
        externalCSSFiles: [
          '<%= modularProject.bowerDir %>angular-motion/dist/angular-motion.css',
          '<%= modularProject.bowerDir %>highlightjs/styles/github.css'
        ]
      },

      buildHTML: {
        compiledCSSFiles: [
          'css/angular-motion.css',
          'css/github.css',
          'css/docs.css',
          'css/sampleFormStyle.css'
        ],
        compilableVendorJSFiles: [
          // Order is important - Angular should come first
          '<%= modularProject.bowerDir %>angular/angular.js',
          '<%= modularProject.bowerDir %>angular-animate/angular-animate.js',
          '<%= modularProject.bowerDir %>angular-translate/angular-translate.js',
          '<%= modularProject.bowerDir %>angular-translate-loader-static-files/angular-translate-loader-static-files.js',
          '<%= modularProject.bowerDir %>angular-scroll/angular-scroll.js',
          '<%= modularProject.bowerDir %>angular-strap/dist/angular-strap.js',
          '<%= modularProject.bowerDir %>angular-strap/dist/angular-strap.tpl.js'
        ],
        nonCompilableVendorJSFiles: [
          '<%= modularProject.bowerDir %>highlightjs/highlight.pack.js'
        ]
      },

      // Custom config for building a JS library - used by the mpBuildLibrary task
      buildLibrary: {
        libFileNamePrefix: 'ng-form-lib',
        libSrcFiles: ['**/*.js', '!**/docs.js']
      },

      optimise: {
        tasks: ['mpBuildLibrary', 'mpOptimise', 'beep:twobits'],

        // Modify the optimise task so that it builds the docs.js files together, and copies the library JS file to the output
        // Also need to disable whitespace escaping due to the use of <pre><code> blocks (can't get htmlmin to ignroe blocks at the moment)
        jsMinFile: 'ng-form-lib-docs.js',
        jsFilesToConcat: ['<%= modularProject.build.dev.jsDir %>**/docs.js'],
        filesToCopy: [{expand: true, flatten: true, src: '<%= modularProject.buildLibrary.libFile %>', dest: '<%= modularProject.optimise.dest.jsDir %>'}],
        htmlmin: {
          options: {
            collapseWhitespace: false
          }
        }
      },

      release: {
        // Modify both the docsConfig.json SRC and the temporary documentation version (in /docs), but only commit the SRC version.
        filesToBump: ['package.json', 'bower.json', 'src/modules/docs/assets/config/docsConfig.json', 'dist/assets/docs/config/docsConfig.json'],
        filesToCommit: ['package.json', 'bower.json', 'CHANGELOG.md', 'src/modules/docs/assets/config/docsConfig.json'],
        tasks: ['gh-pages']
      },

      unitTest: {
        testLibraryFiles: [
          '<%= modularProject.buildHTML.compilableVendorJSFiles %>',
          '<%= modularProject.bowerDir %>angular-mocks/angular-mocks.js'
        ]
      }
    },
    'gh-pages': {
      options: {
        tag: 'v<%= PKG.version %>_doc',
        message: 'docs(v<%= PKG.version %>): Update documentation',
        base: 'dist',
        push: true,
        branch: 'gh-pages'
      },
      src: ['**']
    }
  });


  // jit-grunt saves about 3 seconds per cycle now - valuable!
  require('jit-grunt')(grunt, {
    ngtemplates: 'grunt-angular-templates',
    includereplace: 'grunt-include-replace',
    coverage: 'grunt-istanbul-coverage',
    usebanner: 'grunt-banner',
    'bump-only': 'grunt-bump',
    'dev': 'grunt-modular-project',
    'test': 'grunt-modular-project',
    'verify': 'grunt-modular-project',
    'build': 'grunt-modular-project',
    'mpBuildJS': 'grunt-modular-project',
    'release': 'grunt-modular-project'
  });

};
