'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // The actual project configuration - this will be different for each project
  grunt.extendConfig({
    cfg: {
      bower: {
        dir: 'bower_components/'
      },
      node: {
        dir: 'node_modules/'
      },
      config: {
        dir: 'config/',
        gruntFiles: ['Gruntfile.js', '<%= cfg.config.dir %>grunt/*.js']
      },
      src: {
        dir: 'src/',
        assets: {
          dir: '<%= cfg.src.modules.dir %>',
          files: ['*/assets/**/*']
        },
        css: {
          dir: '<%= cfg.src.modules.dir %>',
          stylusDirs: '<%= cfg.src.modules.dir %>**/styles',
          rootSourceFiles: [
            '**/styles/docs.styl',
            '**/styles/sampleFormStyle.styl'
          ]
        },
        includes: {
          dir: '<%= cfg.src.modules.dir %>**/includes/',
          files: '*'
        },
        js: {
          dir: '<%= cfg.src.modules.dir %>',
          files: ['<%= cfg.src.js.dir %>**/_*.js', '<%= cfg.src.js.dir %>**/*.js', '!<%= cfg.test.specs %>']
        },
        jsLib: {
          compilableFiles: [
            // Order is important - Angular should come first
            '<%= cfg.bower.dir %>angular/angular.js',
            '<%= cfg.bower.dir %>angular-animate/angular-animate.js',
            '<%= cfg.bower.dir %>angular-translate/angular-translate.js',
            '<%= cfg.bower.dir %>angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            '<%= cfg.bower.dir %>angular-scroll/angular-scroll.js',
            '<%= cfg.bower.dir %>angular-strap/dist/angular-strap.js',
            '<%= cfg.bower.dir %>angular-strap/dist/angular-strap.tpl.js'
          ],
          externalFiles: [
            '<%= cfg.bower.dir %>highlightjs/highlight.pack.js'
          ]
        },
        html: {
          dir: '<%= cfg.src.modules.dir %>',
          files: ['**/*.{html,inc}'] //templates directory needs to be ignored
        },
        modules: {
          dir: '<%= cfg.src.dir %>modules/'
        },
        templateHTML: {
          dir: '<%= cfg.src.modules.dir %>',
          files: '**/template/*.html'
        }
      },
      test: {
        specs: '<%= cfg.src.modules.dir %>**/unitTest/*.spec.js'
      },
      report: {
        dir: 'reports/'
      },

      build: {
        dev: {
          dir: 'dev/',
          assetsDir: '<%= cfg.build.dev.dir %>assets/',
          cssDir: '<%= cfg.build.dev.dir %>css/',
          jsDir: '<%= cfg.build.dev.dir %>js/',
          vendorDir: '<%= cfg.build.dev.dir %>vendor/',
          viewsDir: '<%= cfg.build.dev.dir %>views/',
          livereloadFiles: ['<%= cfg.build.dev.dir %>**/*']
        },
        prod: {
          dir: 'dist/'
        },
        doc: {
          dir: 'docs/'
        },
        temp: {
          dir: '.tmp/'
        }
      },

      buildIncludes: {
        includeTempDir: '<%= cfg.build.temp.dir %>jsincludes/',
        clean: ['<%= cfg.buildIncludes.includeTempDir %>'],
        copy: {
          files: [{expand: true, src: '<%= cfg.src.includes.dir %><%= cfg.src.includes.files %>', dest: '<%= cfg.buildIncludes.includeTempDir %>'}]
        },
        watch: {
          files: ['<%= cfg.src.includes.dir %><%= cfg.src.includes.files %>']
        }
      },

      // Specific modules
      buildCSS: {
        compile: {
          sourceDirs: '<%= cfg.src.css.stylusDirs %>',  // Stylus-specific property
          files: [{expand: true, flatten: true, cwd: '<%= cfg.src.css.dir %>', src: '<%= cfg.src.css.rootSourceFiles %>', dest: '<%= cfg.build.dev.cssDir %>', ext: '.css'}]
        },

        copy: {
          files: [{
            expand: true,
            flatten: true,
            src: [
              '<%= cfg.bower.dir %>angular-motion/dist/angular-motion.css',
              '<%= cfg.bower.dir %>highlightjs/styles/github.css'
            ],
            dest: '<%= cfg.build.dev.cssDir %>'
          }]
        },

        autoPrefix: {
          files: [{expand: true, cwd: '<%= cfg.build.dev.dir %>css', src: '*.css', dest: '<%= cfg.build.dev.cssDir %>'}]
        },

        watch: {
          files: ['<%= cfg.src.css.dir %>**/*.styl']
        }
      },

      buildJS: {
        // Common variables
        tempJSDir: '<%= cfg.build.temp.dir %>js/',
        tempTemplateDir: '<%= cfg.build.temp.dir %>templates/',
        vendorJSFiles: ['<%= cfg.src.jsLib.compilableFiles %>', '<%= cfg.src.jsLib.externalFiles %>'],

        // Tasks
        clean: ['<%= cfg.buildJS.tempTemplateDir %>', '<%= cfg.buildJS.tempJSDir %>', '<%= cfg.build.dev.vendorDir %>', '<%= cfg.build.dev.jsDir %>'],

        copy: {
          htmlTemplatesToTemp: {
            files: [{expand: true, flatten: false, cwd: '<%= cfg.src.templateHTML.dir %>', src: '<%= cfg.src.templateHTML.files %>', dest: '<%= cfg.buildJS.tempTemplateDir %>'}]
          },
          jsToTemp: {
            files: [{expand: true, flatten: false, cwd: '<%= cfg.src.js.dir %>', src: ['**/_*.js', '**/*.js', '!**/unitTest/*.spec.js'], dest: '<%= cfg.buildJS.tempJSDir %>'}]
          },
          vendorJS: {
            files: [{expand: true, flatten: false, src: '<%= cfg.buildJS.vendorJSFiles %>', dest: '<%= cfg.build.dev.vendorDir %>'}]
          }
        },

        /* This builds the moduleName.js file into the output/js folder */
        concat: {
          moduleJS: {
            files: [
              {
                expand: true,
                cwd: '<%= cfg.buildJS.tempJSDir %>',
                src: ['**/_*.js', '**/*.js', '!**/unitTest/*.spec.js'], // Concat files starting with '_' first
                dest: '<%= cfg.build.dev.jsDir %>',
                rename: function(dest, src) {
                  // Use the source directory(s) to create the destination file name
                  // e.g. ui/common/icon.js -> ui/common.js
                  //      ui/special/foo.js -> ui/special.js
                  //grunt.log.writeln('Concat: ' + src);
                  //grunt.log.writeln('------->: ' + src.substring(0, src.lastIndexOf('/')));

                  return dest + src.substring(0, src.lastIndexOf('/')) + '.js';
                }
              }
            ]
          }
        },

        // This task-config prepares the templates for use *** within-each-module *** !
        prepareNGTemplates: {
          files: [{
            cwd: '<%= cfg.buildJS.tempTemplateDir %>',  // Using this shortens the URL-key of the template name in the $templateCache
            moduleName: /^(.*)\/template/,    // Use the captured group as the module name
            src: '<%= cfg.src.templateHTML.files %>',   // The HTML template files
            dest: '<%= cfg.buildJS.tempJSDir %>'        // Base destination directory
          }]
        },

        includeFilesInJS: {
          sourceFiles: [{expand: true, cwd: '<%= cfg.buildJS.tempJSDir %>', src: '**/*.js', dest: '<%= cfg.buildJS.tempJSDir %>'}],
          includesDir: '<%= cfg.buildIncludes.includeTempDir %>'
        },

        watch: {
          allJSSrc: {
            files: ['<%= cfg.src.js.dir %>**/*.js', '<%= cfg.config.gruntFiles %>', '<%= cfg.test.specs %>']
          },
          jsHtmlTemplates: {
            files: ['<%= cfg.src.templateHTML.dir %><%= cfg.src.templateHTML.files %>']
          },
          vendorJS: {
            files: ['<%= cfg.buildJS.vendorJSFiles %>']
          }
        }
      },


      buildHTML: {
        html: {
          copy: {
            files: [
              {expand: true, flatten: false, cwd: '<%= cfg.src.html.dir %>', src: '<%= cfg.src.html.files %>', dest: '<%= cfg.build.dev.viewsDir %>'},
              {expand: true, flatten: true, cwd: '<%= cfg.src.dir %>', src: '*.html', dest: '<%= cfg.build.dev.dir %>'},
              {expand: true, flatten: false, cwd: '<%= cfg.src.dir %>', src: 'partials/*', dest: '<%= cfg.build.dev.viewsDir %>'}
            ]
          },
          watch: [
            '<%= cfg.src.html.dir %><%= cfg.src.html.files %>',
            '<%= cfg.src.dir %>*.html',
            '<%= cfg.src.dir %>partials/*'
          ],
          filesWithTemplateTags: {
            files: [
              {src: '<%= cfg.build.dev.dir %>*.html', dest: '<%= cfg.build.dev.dir %>'}
            ]
          }
        },

        moduleAssets: {
          copy: {
            files:[
              {
                expand: true,
                flatten: false,
                cwd: '<%= cfg.src.assets.dir %>',
                src: '<%= cfg.src.assets.files %>',
                dest: '<%= cfg.build.dev.assetsDir %>',
                rename: function(dest, src) {
                  grunt.log.writeln('Copy: ' + src + ', ' + dest);
                  // Remove the 'prefix/assets/ portion of the path
                  var moduleName = src.substr(0, src.indexOf('/assets/'));
                  //grunt.log.ok('module name = ' + moduleName);
                  var newPath = src.substr(src.indexOf('/assets/') + 8);
                  return dest + '/' + moduleName + '/' + newPath;
                }
              }
            ]
          },
          watch: ['<%= cfg.src.assets.dir %>' + '<%= cfg.src.assets.files %>']
        },
        vendorJSFiles: '<%= cfg.src.jsLib.compilableFiles %>',
        externalJSFiles: '<%= cfg.src.jsLib.externalFiles %>',

        compiledCSSFiles: [
          'css/angular-motion.css',
          'css/github.css',
          'css/docs.css',
          'css/sampleFormStyle.css'
        ]
      },

      library: {
        // Common vars
        libFile: 'dist/ng-form-lib.js',
        minLibFile: 'dist/ng-form-lib.min.js',

        // Task config
        clean: ['dist/'],

        copy: {
          files: [{
            expand: true, cwd: '<%= cfg.build.dev.jsDir %>', src: ['**/*.js', '!**/docs.js'], dest: 'dist/src'
          }]
        },

        concat: {
          files: [{
            src: ['dist/src/**/*.js'],
            dest: '<%= cfg.library.libFile %>'
          }]
        },

        uglify: {
          files: [{
            src: '<%= cfg.library.libFile %>', dest: '<%= cfg.library.minLibFile %>'
          }]
        }
      },

      optimise: {
        copy: {
          files: [
            {expand: true, cwd: '<%= cfg.optimise.src.dir %>', src: '<%= cfg.optimise.src.optimisedAssetFiles %>', dest: '<%= cfg.optimise.dest.dir %>'},
            {expand: true, flatten: true, src: '<%= cfg.library.libFile %>', dest: '<%= cfg.optimise.dest.dir %>js/'},
            {expand: true, cwd: '<%= cfg.optimise.src.dir %>assets/', src: '*/{config,language}/**/*', dest: '<%= cfg.optimise.dest.dir %>assets/'},
            {expand: true, cwd: '<%= cfg.optimise.src.dir %>', src: 'vendor/**/*', dest: '<%= cfg.optimise.dest.dir %>'}
          ]
        },

        src: {
          dir: '<%= cfg.build.dev.dir %>',
          cssDir: '<%= cfg.optimise.src.dir %>css/',
          cssFiles: '*.css',
          htmlFiles: ['views/**/*.html'],
          imagesDir: '<%= cfg.optimise.src.dir %>assets/images/',
          jsFilesToConcat: [
            '<%= cfg.build.dev.jsDir %>**/docs.js'
          ],
          optimisedAssetFiles: [
            'assets/font/**/*',
            'assets/language/**/*'
          ],
          rootHtmlFiles: '*.html',
          rootHtmlFilesDir: '<%= cfg.src.dir %>'
        },
        dest: {
          dir: '<%= cfg.build.doc.dir %>',
          cssDir: '<%= cfg.optimise.dest.dir %>css/',
          cssFiles: ['<%= cfg.optimise.dest.cssDir %>*.css'],
          filesToRev: [
            '<%= cfg.optimise.dest.dir %>assets/font/*',
            '<%= cfg.optimise.dest.dir %>assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= cfg.optimise.dest.dir %>css/*.css',
            '<%= cfg.optimise.dest.dir %>js/*.js',
            '<%= cfg.optimise.dest.dir %>vendor/**/*.js'
          ],
          htmlFiles: ['<%= cfg.optimise.dest.dir %>*.html', '<%= cfg.optimise.dest.dir %>views/**/*.html'],
          imagesDir: '<%= cfg.optimise.dest.dir %>assets/images/',
          jsDir: '<%= cfg.optimise.dest.dir %>js/',
          jsMinFile: 'ng-form-lib-docs.js',
          rootFilesDir: '<%= cfg.optimise.dest.dir %>',
          rootHtmlFiles: '*.html'
        }
      },

      serve: {
        dev: {
          baseDir: ['<%= cfg.build.dev.dir %>'],
          port: 8000,
          hostname: 'localhost'
        },
        prod: {
          baseDir: ['<%= cfg.build.doc.dir %>'],
          port: 8000,
          hostname: 'localhost'
        }
      },

      unitTest: {
        reportDir: '<%= cfg.report.dir %>',
        baseConfig: '<%= cfg.config.dir %>karma/karma.conf.js',
        browserConfig: '<%= cfg.config.dir %>karma/karma.conf.js',
        CIConfig: '<%= cfg.config.dir %>karma/karma.conf.js',
        testFiles: [
          '<%= cfg.src.jsLib.compilableFiles %>',
          '<%= cfg.bower.dir %>angular-mocks/angular-mocks.js',

          // Our source code
          '<%= cfg.src.modules.dir %>**/_*.js',        // Need to load these next
          '<%= cfg.src.modules.dir %>**/*.js',         // Then all other source files

          // HTML Templates (which are converted to JS files by ng-html2js
          '<%= cfg.src.modules.dir %>**/template/*.html',

          // Test specs
          '<%= cfg.src.modules.dir %>**/unitTest/*.spec.js'
        ],
        excludeFiles: [
          '<%= cfg.src.modules.dir %>docs/**/*.js',   // No need to test the docs module
          '<%= cfg.src.modules.dir %>**/docs/*.js'    // No need to test the docs examples
        ],
        preprocessors: {
          // Source files, that you wanna generate coverage for.
          // Do not include tests or libraries
          // (these files will be instrumented by Istanbul)
          'src/modules/**/!(*.spec).js': ['coverage'],
          '**/*.html': ['ng-html2js']
        }
      },

      release: {
        // Modify both the docsConfig.json SRC and the temporary documentation version (in /docs), but only commit the SRC version.
        filesToBump: ['package.json', 'bower.json', 'src/modules/docs/assets/config/docsConfig.json', 'docs/assets/docs/config/docsConfig.json'],
        filesToCommit: ['package.json', 'bower.json', 'CHANGELOG.md', 'src/modules/docs/assets/config/docsConfig.json']
      },

      verify: {
        allFiles: ['<%= cfg.src.js.dir %>**/*.js', '<%= cfg.config.gruntFiles %>', '<%= cfg.test.specs %>'],
        srcFiles: ['<%= cfg.src.js.files %>', '<%= cfg.config.gruntFiles %>'],
        testFiles: ['<%= cfg.test.specs %>'],
        reportDir: '<%= cfg.report.dir %>',
        jshint: {
          baseConfig: '<%= cfg.config.dir %>jshint/.jshintrc',
          testConfig: '<%= cfg.config.dir %>jshint/.jshintrc',
          CIConfig: '<%= cfg.config.dir %>jshint/.jshintrc'
        },
        jscs: {
          baseConfig: '<%= cfg.config.dir %>jscs/.jscsrc',
          testConfig: '<%= cfg.config.dir %>jscs/.jscsrc',
          CIConfig: '<%= cfg.config.dir %>jscs/.jscsrc'
        }
      }
    }
  });


  grunt.loadTasks('config/grunt');  // Loads all the Grunt tasks inside the config/grunt folder AFTER the above config

  grunt.registerTask('default', ['dev']);
};
