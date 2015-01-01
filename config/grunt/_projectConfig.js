module.exports = function(grunt) {
  'use strict';

  /**
   * There should a scheme where we can build a module.
   *
   * A module has JS, HTML, Assets (CSS, Images), Templates and Tests.
   * A module also contains sub-modules.
   *
   * For a library project, there is a documentation module and then the library.
   * When creating the distributable version, we don't really want the documentation module
   * to be optimised with the library code.
   *
   * Additionally, users may only want a few pieces of the library, not the entire bundle.
   *
   *
   *
   **/


  grunt.extendConfig({
    paths: {
      bower: {
        dir: 'bower_components/'
      },
      node: {
        dir: 'node_modules/'
      },
      config: {
        dir: 'config/',
        gruntFiles: ['Gruntfile.js', '<%= paths.config.dir %>grunt/*.js']
      },
      src: {
        dir: 'src/',
        assets: {
          dir: '<%= paths.src.modules.dir %>',
          files: ['*/assets/**/*']
        },
        css: {
          dir: '<%= paths.src.modules.dir %>',
          stylusDirs: '<%= paths.src.modules.dir %>**/styles',
          rootSourceFiles: [
            '**/styles/docs.styl',
            '**/styles/sampleFormStyle.styl'
          ]
        },
        includes: {
          dir: '<%= paths.src.modules.dir %>**/includes',
          files: '*'
        },
        js: {
          dir: '<%= paths.src.modules.dir %>',
          files: ['<%= paths.src.js.dir %>**/_*.js', '<%= paths.src.js.dir %>**/*.js', '!<%= paths.test.specs %>']
        },
        jsLib: {
          compilableFiles: [
            // Order is important - Angular should come first
            '<%= paths.bower.dir %>angular/angular.js',
            '<%= paths.bower.dir %>angular-animate/angular-animate.js',
            '<%= paths.bower.dir %>angular-translate/angular-translate.js',
            '<%= paths.bower.dir %>angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            '<%= paths.bower.dir %>angular-scroll/angular-scroll.js',
            '<%= paths.bower.dir %>angular-strap/dist/angular-strap.js',
            '<%= paths.bower.dir %>angular-strap/dist/angular-strap.tpl.js'
          ],
          externalFiles: [
            '<%= paths.bower.dir %>highlightjs/highlight.pack.js'
          ]
        },
        html: {
          dir: '<%= paths.src.modules.dir %>',
          files: ['**/*.{html,inc}'] //templates directory needs to be ignored
        },
        modules: {
          dir: '<%= paths.src.dir %>modules/'
        },
        templateHTML: {
          dir: '<%= paths.src.modules.dir %>',
          files: '**/template/*.html'
        }
      },
      test: {
        specs: '<%= paths.src.modules.dir %>**/unitTest/*.spec.js'
      },
      report: {
        dir: 'reports/'
      },

      build: {
        dev: {
          dir: 'dev/',
          assetsDir: '<%= paths.build.dev.dir %>/assets/',
          cssDir: '<%= paths.build.dev.dir %>/css/',
          jsDir: '<%= paths.build.dev.dir %>/js/',
          vendorDir: '<%= paths.build.dev.dir %>/vendor/',
          viewsDir: '<%= paths.build.dev.dir %>/views/',
          livereloadFiles: ['<%= paths.build.dev.dir %>**/*']
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
        includeTempDir: '<%= paths.build.temp.dir %>jsincludes/',
        clean: ['<%= paths.buildIncludes.includeTempDir %>'],
        copy: {
          files: [{expand: true, src: '<%= paths.src.includes.dir %><%= paths.src.includes.files %>', dest: '<%= paths.buildIncludes.includeTempDir %>'}]
        },
        watch: {
          files: ['<%= paths.src.includes.dir %><%= paths.src.includes.files %>']
        }
      },

      // Specific modules
      buildCSS: {
        compile: {
          sourceDirs: '<%= paths.src.css.stylusDirs %>',  // Stylus-specific property
          files: [{expand: true, flatten: true, cwd: '<%= paths.src.css.dir %>', src: '<%= paths.src.css.rootSourceFiles %>', dest: '<%= paths.build.dev.cssDir %>', ext: '.css'}]
        },

        copy: {
          files: [{
            expand: true,
            flatten: true,
            src: [
              '<%= paths.bower.dir %>angular-motion/dist/angular-motion.css',
              '<%= paths.bower.dir %>highlightjs/styles/github.css'
            ],
            dest: '<%= paths.build.dev.cssDir %>'
          }]
        },

        autoPrefix: {
          files: [{expand: true, cwd: '<%= paths.build.dev.dir %>css', src: '*.css', dest: '<%= paths.build.dev.cssDir %>'}]
        },

        watch: {
          files: ['<%= paths.src.css.dir %>**/*.styl']
        }
      },

      buildJS: {
        // Common variables
        tempJSDir: '<%= paths.build.temp.dir %>js/',
        tempTemplateDir: '<%= paths.build.temp.dir %>templates/',
        vendorJSFiles: ['<%= paths.src.jsLib.compilableFiles %>', '<%=paths.src.jsLib.externalFiles %>'],

        // Tasks
        clean: ['<%= paths.buildJS.tempTemplateDir %>', '<%= paths.buildJS.tempJSDir %>', '<%= paths.build.dev.vendorDir %>', '<%= paths.build.dev.jsDir %>'],

        copy: {
          htmlTemplatesToTemp: {
            files: [{expand: true, flatten: false, cwd: '<%= paths.src.templateHTML.dir %>', src: '<%= paths.src.templateHTML.files %>', dest: '<%= paths.buildJS.tempTemplateDir %>'}]
          },
          jsToTemp: {
            files: [{expand: true, flatten: false, cwd: '<%= paths.src.js.dir %>', src: ['**/_*.js', '**/*.js', '!**/unitTest/*.spec.js'], dest: '<%= paths.buildJS.tempJSDir %>'}]
          },
          vendorJS: {
            files: [{expand: true, flatten: false, src: '<%= paths.buildJS.vendorJSFiles %>', dest: '<%= paths.build.dev.vendorDir %>'}]
          }
        },

        /* This builds the moduleName.js file into the output/js folder */
        concat: {
          moduleJS: {
            files: [
              {
                expand: true,
                cwd: '<%= paths.buildJS.tempJSDir %>',
                src: ['**/_*.js', '**/*.js', '!**/unitTest/*.spec.js'], // Concat files starting with '_' first
                dest: '<%= paths.build.dev.jsDir %>',
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
            cwd: '<%= paths.buildJS.tempTemplateDir %>',  // Using this shortens the URL-key of the template name in the $templateCache
            moduleName: /^(.*)\/template/,    // Use the captured group as the module name
            src: '<%= paths.src.templateHTML.files %>',   // The HTML template files
            dest: '<%= paths.buildJS.tempJSDir %>'        // Base destination directory
          }]
        },

        includeFilesInJS: {
          sourceFiles: [{expand: true, cwd: '<%= paths.buildJS.tempJSDir %>', src: '**/*.js', dest: '<%= paths.buildJS.tempJSDir %>'}],
          includesDir: '<%= paths.buildIncludes.includeTempDir %>'
        },

        watch: {
          allJSSrc: {
            files: ['<%= paths.src.js.dir %>**/*.js', '<%= paths.config.gruntFiles %>', '<%= paths.test.specs %>']
          },
          jsHtmlTemplates: {
            files: ['<%= paths.src.templateHTML.dir %><%= paths.src.templateHTML.files %>']
          },
          vendorJS: {
            files: ['<%= paths.buildJS.vendorJSFiles %>']
          }
        }
      },


      buildHTML: {
        html: {
          copy: {
            files: [
              {expand: true, flatten: false, cwd: '<%= paths.src.html.dir %>', src: '<%= paths.src.html.files %>', dest: '<%= paths.build.dev.dir %>views/'},
              {expand: true, flatten: true, cwd: '<%= paths.src.dir %>', src: '*.html', dest: '<%= paths.build.dev.dir %>'},
              {expand: true, flatten: false, cwd: '<%= paths.src.dir %>', src: 'partials/*', dest: '<%= paths.build.dev.dir %>views/'}
            ]
          },
          watch: [
            '<%= paths.src.html.dir %><%= paths.src.html.files %>',
            '<%= paths.src.dir %>*.html',
            '<%= paths.src.dir %>partials/*'
          ],
          filesWithTemplateTags: {
            files: [
              {src: '<%= paths.build.dev.dir %>*.html', dest: '<%= paths.build.dev.dir %>'}
            ]
          }
        },

        moduleAssets: {
          copy: {
            files:[
              {
                expand: true,
                flatten: false,
                cwd: '<%= paths.src.assets.dir %>',
                src: '<%= paths.src.assets.files %>',
                dest: '<%= paths.build.dev.assetsDir %>',
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
          watch: ['<%= paths.src.assets.dir %>' + '<%= paths.src.assets.files %>']
        },
        vendorJSFiles: '<%= paths.src.jsLib.compilableFiles %>',
        externalJSFiles: '<%= paths.src.jsLib.externalFiles %>',

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
            expand: true, cwd: '<%= paths.build.dev.jsDir %>', src: ['**/*.js', '!**/docs.js'], dest: 'dist/src'
          }]
        },

        concat: {
          files: [{
            src: ['dist/src/**/*.js'],
            dest: '<%= paths.library.libFile %>'
          }]
        },

        uglify: {
          files: [{
            src: '<%= paths.library.libFile %>', dest: '<%= paths.library.minLibFile %>'
          }]
        }
      },

      optimise: {
        copy: {
          files: [
            {expand: true, cwd: '<%= paths.optimise.src.dir %>', src: '<%= paths.optimise.src.optimisedAssetFiles %>', dest: '<%= paths.optimise.dest.dir %>'},
            {expand: true, flatten: true, src: '<%= paths.library.libFile %>', dest: '<%= paths.optimise.dest.dir %>js/'},
            {expand: true, cwd: '<%= paths.optimise.src.dir %>assets/', src: '*/{config,language}/**/*', dest: '<%= paths.optimise.dest.dir %>assets/'},
            {expand: true, cwd: '<%= paths.optimise.src.dir %>', src: 'vendor/**/*', dest: '<%= paths.optimise.dest.dir %>'}
          ]
        },
        
        src: {
          dir: '<%= paths.build.dev.dir %>',
          cssDir: '<%= paths.optimise.src.dir %>css/',
          cssFiles: '*.css',
          htmlFiles: ['views/**/*.html'],
          imagesDir: '<%= paths.optimise.src.dir %>assets/images/',
          jsFilesToConcat: [
            '<%= paths.build.dev.jsDir %>**/docs.js'
          ],
          optimisedAssetFiles: [
            'assets/font/**/*',
            'assets/language/**/*'
          ],
          rootHtmlFiles: '*.html',
          rootHtmlFilesDir: '<%= paths.src.dir %>'
        },
        dest: {
          dir: '<%= paths.build.doc.dir %>',
          cssDir: '<%= paths.optimise.dest.dir %>css/',
          cssFiles: ['<%= paths.optimise.dest.cssDir %>*.css'],
          filesToRev: [
            '<%= paths.optimise.dest.dir %>assets/font/*',
            '<%= paths.optimise.dest.dir %>assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= paths.optimise.dest.dir %>css/*.css',
            '<%= paths.optimise.dest.dir %>js/*.js',
            '<%= paths.optimise.dest.dir %>vendor/**/*.js'
          ],
          htmlFiles: ['<%= paths.optimise.dest.dir %>*.html', '<%= paths.optimise.dest.dir %>views/**/*.html'],
          imagesDir: '<%= paths.optimise.dest.dir %>assets/images/',
          jsDir: '<%= paths.optimise.dest.dir %>js/',
          jsMinFile: 'ng-form-lib-docs.js',
          rootFilesDir: '<%= paths.optimise.dest.dir %>',
          rootHtmlFiles: '*.html'
        }
      },

      serve: {
        dev: {
          baseDir: ['<%= paths.build.dev.dir %>'],
          port: 8000,
          hostname: 'localhost'
        },
        prod: {
          baseDir: ['<%= paths.build.doc.dir %>'],
          port: 8000,
          hostname: 'localhost'
        }
      },

      unitTest: {
        reportDir: '<%= paths.report.dir %>',
        baseConfig: '<%= paths.config.dir %>karma/karma.conf.js',
        browserConfig: '<%= paths.config.dir %>karma/karma.conf.js',
        CIConfig: '<%= paths.config.dir %>karma/karma.conf.js',
        testFiles: [
          '<%= paths.src.jsLib.compilableFiles %>',
          '<%= paths.bower.dir %>angular-mocks/angular-mocks.js',

          // Our source code
          '<%= paths.src.modules.dir %>**/_*.js',        // Need to load these next
          '<%= paths.src.modules.dir %>**/*.js',         // Then all other source files

          // HTML Templates (which are converted to JS files by ng-html2js
          '<%= paths.src.modules.dir %>**/template/*.html',

          // Test specs
          '<%= paths.src.modules.dir %>**/unitTest/*.spec.js'
        ],
        excludeFiles: [
          '<%= paths.src.modules.dir %>docs/**/*.js',   // No need to test the docs module
          '<%= paths.src.modules.dir %>**/docs/*.js'    // No need to test the docs examples
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
        filesToBump: ['package.json', 'bower.json', 'src/modules/docs/assets/config/docsConfig.json', 'docs/assets/config/docsConfig.json'],
        filesToCommit: ['package.json', 'bower.json', 'CHANGELOG.md', 'src/modules/docs/assets/config/docsConfig.json']
      },

      verify: {
        allFiles: ['<%= paths.src.js.dir %>**/*.js', '<%= paths.config.gruntFiles %>', '<%= paths.test.specs %>'],
        srcFiles: ['<%= paths.src.js.files %>', '<%= paths.config.gruntFiles %>'],
        testFiles: ['<%= paths.test.specs %>'],
        reportDir: '<%= paths.report.dir %>',
        jshint: {
          baseConfig: '<%= paths.config.dir %>jshint/.jshintrc',
          testConfig: '<%= paths.config.dir %>jshint/.jshintrc',
          CIConfig: '<%= paths.config.dir %>jshint/.jshintrc'
        },
        jscs: {
          baseConfig: '<%= paths.config.dir %>jscs/.jscsrc',
          testConfig: '<%= paths.config.dir %>jscs/.jscsrc',
          CIConfig: '<%= paths.config.dir %>jscs/.jscsrc'
        }
      }
    }
  });
};
