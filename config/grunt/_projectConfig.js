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
          rootFiles: [
            '**/styles/docs.styl',
            '**/styles/sampleFormStyle.styl'
          ]
        },
        globalAssets: {
          dir: '<%= paths.src.dir %>',
          files: ['**/language/*']
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

      build: {
        dev: {
          dir: 'dev/',
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

      report: {
        dir: 'reports/'
      },
      // Specific modules
      buildCSS: {
        stylusDirs: '<%= paths.src.css.stylusDirs %>',
        preCompiledCSSDir: '<%= paths.src.css.dir %>',
        preCompiledCSSFiles: '<%= paths.src.css.rootFiles %>',
        compiledCSSDir: '<%= paths.build.dev.dir %>css',
        compiledCSSFiles: '*.css',
        externalCSSFiles: [
          {
            expand: true,
            flatten: true,
            dest: '<%= paths.build.dev.dir %>css/',
            src: [
              '<%= paths.bower.dir %>angular-motion/dist/angular-motion.css',
              '<%= paths.bower.dir %>highlightjs/styles/github.css'
            ]
          }
        ]
      },

      buildJS: {
        moduleJSDir: '<%= paths.src.js.dir %>',
        moduleJSFiles: ['**/_*.js', '**/*.js', '!**/unitTest/*.spec.js'],
        moduleDirJSFiles: ['<%= paths.src.js.files %>'],
        moduleJSDestDir: '<%= paths.build.dev.dir %>js/',

        moduleHTMLTemplateDir: '<%= paths.src.templateHTML.dir %>',
        moduleHTMLTemplateFiles: '<%= paths.src.templateHTML.files %>',
        moduleDirHTMLTemplateFiles: '<%= paths.src.templateHTML.dir %><%= paths.buildJS.moduleHTMLTemplateFiles %>',
        tempTemplateDir: '<%= paths.build.temp.dir %>templates/',
        tempJSDir: '<%= paths.build.temp.dir %>js/',

        jsIncludes: '<%= paths.src.dir %>refdata/**/*',
        tempJSIncludesDir: '<%= paths.build.temp.dir %>jsincludes/',

        vendorJSFiles: ['<%= paths.src.jsLib.compilableFiles %>', '<%=paths.src.jsLib.externalFiles %>'],
        vendorJSDestDir: '<%= paths.build.dev.dir %>vendor/'
      },

      buildHTML: {
        // This object (copyHTML) is much more natural and easier to maintain than injecting variables into buildHTML.js
        copyHTML: {
          files: [
            {expand: true, flatten: false, cwd: '<%= paths.src.html.dir %>', src: '<%= paths.src.html.files %>', dest: '<%= paths.buildHTML.html.destDir %>'},
            {expand: true, flatten: true, cwd: '<%= paths.src.dir %>', src: '*.html', dest: '<%= paths.build.dev.dir %>'},
            {expand: true, flatten: false, cwd: '<%= paths.src.dir %>', src: 'partials/*', dest: '<%= paths.buildHTML.html.destDir %>'}
          ]
        },
        watchHTMLFiles: [
          '<%= paths.src.html.dir %><%= paths.src.html.files %>',
          '<%= paths.src.dir %>*.html',
          '<%= paths.src.dir %>partials/*'
        ],
        html: {
          rootFiles: '*.html',
          rootFilesSrcDir: '<%= paths.src.dir %>',
          rootFilesDestDir: '<%= paths.build.dev.dir %>',
          srcDir: '<%= paths.src.html.dir %>',
          files: ['<%= paths.src.html.files %>', '<%= paths.src.dir %>partials/*'],
          destDir: '<%= paths.build.dev.dir %>views/'
        },
        globalAssets: {
          srcDir: '<%= paths.src.globalAssets.dir %>',
          files: ['<%= paths.src.globalAssets.files %>'],
          srcFiles: ['<%= paths.src.globalAssets.dir %>**/language/*'],    // This is a flawed implementation. We really want to bind the cwd to each file elemen
          destDir: '<%= paths.build.dev.dir %>assets/'
        },
        moduleAssets: {
          srcDir: '<%= paths.src.assets.dir %>',
          files: '<%= paths.src.assets.files %>',
          destDir: '<%= paths.build.dev.dir %>assets/',
          renameFunc: function(dest, src) {
            grunt.log.writeln('Copy: ' + src + ', ' + dest);
            // Remove the 'prefix/assets/ portion of the path
            var newPath = src.substr(src.indexOf('/assets/') + 8);
            return dest + newPath;
          }
        },
        vendorJSFiles: '<%= paths.src.jsLib.compilableFiles %>',
        externalJSFiles: '<%= paths.src.jsLib.externalFiles %>'
      },

      library: {
        src: {
          dir: '<%= paths.build.dev.dir %>js/',
          allSrc: ['**/*.js', '!**/docs.js'],
          jsFilesToConcat: ['<%= paths.library.dest.src %>/**/*.js']
        },
        dest: {
          dir: 'dist/',
          src: '<%= paths.library.dest.dir %>src/',
          libFileName: 'ng-form-lib.js',
          libMinFileName: 'ng-form-lib.min.js',
          jsFile: '<%= paths.library.dest.dir %><%= paths.library.dest.libFileName %>',
          jsMinFile: '<%= paths.library.dest.dir %><%= paths.library.dest.libMinFileName %>'
        },
        copy: {
          files: [
            {expand: true, cwd: '<%= paths.library.src.dir %>', src: '<%= paths.library.src.allSrc %>', dest: '<%= paths.library.dest.src %>'}
          ]
        }
      },

      optimise: {
        copy: {
          files: [
            {expand: true, cwd: '<%= paths.optimise.src.dir %>', src: '<%= paths.optimise.src.optimisedAssetFiles %>', dest: '<%= paths.optimise.dest.dir %>'},
            {expand: true, cwd: '<%= paths.library.dest.dir %>', src: '<%= paths.library.dest.libFileName %>', dest: '<%= paths.optimise.dest.dir %>js/'},
            {expand: true, cwd: '<%= paths.optimise.src.dir %>assets/', src: '{config,modules}/**/*', dest: '<%= paths.optimise.dest.dir %>assets/'},
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
            '<%= paths.build.dev.dir %>js/**/docs.js'
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
