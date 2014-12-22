module.exports = function(grunt) {
  'use strict';

  var paths = grunt.config.get('paths.buildJS');

  /**
   * Build JS is complex! The basic premise is:
   * - JS files are sometimes compiled from a different format (e.g. HTML partials are wrapped as JS)
   * - JS files sometimes need to do a static import of data (so that we can keep the data separate at design time)
   *
   * Build Process:
   *  - copy VendorJs files (as they are already complete)
   *  - copy directive templates (HTML files) to the temp directory, ready for conversion
   *  - do the HTML -> JS conversion using prepareNGTemplates and ngTemplates
   *  - copy the mainstream JS to the temp directory
   *  - include any static data into the JS files
   *  - concat everything from the temp dir into the output dir
   */


  grunt.extendConfig({
    clean: {
      buildJS: [paths.tempTemplateDir, paths.tempJSDir, paths.tempJSIncludesDir]
    },
    copy: {
      directiveTemplatesToTemp: {
        files: [{expand: true, flatten: false, cwd: paths.moduleHTMLTemplateDir, src: paths.moduleHTMLTemplateFiles, dest: paths.tempTemplateDir}]
      },
      jsToTemp: {
        files: [{expand: true, cwd: paths.moduleJSDir, src: paths.moduleJSFiles, dest: paths.tempJSDir}]
      },
      jsIncludesToTemp: {
        files: [{expand: true, src: paths.jsIncludes, dest: paths.tempJSIncludesDir}]
      },
      vendorJS: {
        files: [{expand: true, flatten: false, src: paths.vendorJSFiles, dest: paths.vendorJSDestDir}]
      }
    },
    concat: {
      /* This builds the moduleName.js file in the output/js folder */
      moduleJS: {
        files: [
          {
            expand: true,
            cwd: paths.tempJSDir,
            src: paths.moduleJSFiles,
            dest: paths.moduleJSDestDir,
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

    includereplace: {
      js: {
        files: [{expand: true, cwd: paths.tempJSDir, src: '**/*.js', dest: paths.tempJSDir}],
        options: {
          includesDir: paths.tempJSIncludesDir
        }
      }
    },

    prepareNGTemplates: {
      app: {
        files: [{
          cwd: paths.tempTemplateDir,      // Using this shortens the URL-key of the template name in the $templateCache
          moduleName: /^(.*)\/template/,    // Use the captured group as the module name
          src: paths.moduleHTMLTemplateFiles,  // The templates files
          dest: paths.tempJSDir        // Base destination directory
        }]
      }
    },

    ngtemplates: {
      options: {
        htmlmin: {
          collapseBooleanAttributes:      true,
          collapseWhitespace:             true,
          removeAttributeQuotes:          true,
          removeComments:                 true, // Only if you don't use comment directives!
          removeEmptyAttributes:          true,
          removeRedundantAttributes:      true,
          removeScriptTypeAttributes:     true,
          removeStyleLinkTypeAttributes:  true
        }
      }//,
      // The prepareNGTemplate task generates the config for ngTemplates, using the module-folder hierarchy
      // See prepareNGTemplate config (above)
//      'ui.accessible.controls.tooltip.template': {
//        src: '<%= paths.dest.partialsDir %>**/ui/accessible/template/AccessibleTooltipTemplate.html',
//        dest: '<%= paths.dest.jsDir %>ui/ui.accessible.controls.tooltip.template.js',
//        options: {
//          standalone: true
//        }
//      }
    },

    watch: {
      // JS task is in watch.js, as it needs to be run other tasks besides concat:moduleJS
      directiveTemplates: {
        files: paths.moduleDirHTMLTemplateFiles,
        tasks: ['_buildJS']
      },
      jsFilestoInclude: {
        files: [paths.jsIncludes],
        tasks: ['_buildJS']
      },
      vendorJS: {
        files: paths.vendorJSDir + '**/*.js',
        tasks: ['copy:vendorJS']
      }
    }
  });


  grunt.registerMultiTask('prepareNGTemplates', 'Compile AngularJS templates for $templateCache', function() {
    // The module name should be unique, as the module generator will use: angular.module(name, []) to
    // CREATE the module (not reference an existing module)

    var moduleConfigs = {};

    // Iterate over all source files
    this.files.forEach(function (fileSet) {
      //grunt.log.writeln(fileSet.src);
      fileSet.src.forEach(function (srcFile) {
        var templatePath = srcFile.match(fileSet.moduleName)[1],
            moduleName = srcFile,
            templateName =  templatePath;

        //grunt.log.writeln('First line: ' + firstLine);

        //grunt.log.writeln('Module name: ' + moduleName);
        //grunt.log.writeln('Dest path: ' + fileSet.dest + templateName + '/' + moduleName + '.js');

        //grunt.log.writeln('fs: ' + fileSet.dest);
        var newConfig = {
          cwd: fileSet.cwd,
          src: srcFile,
          dest: fileSet.dest + templateName + '/' + moduleName.replace(/\//g, '_') + '.js',
          options: {
            standalone: true
          }
        };
        moduleConfigs[moduleName] = newConfig;
      });
    });

    // Now apply the moduleConfigs to the ngtemplates config
    var ngConfig = grunt.config.get('ngtemplates');

    //grunt.log.writeln('MOD: ' + JSON.stringify(moduleConfigs, null, '\t'));

    for (var key in moduleConfigs) {
      if (!ngConfig[key]) {
        ngConfig[key] = moduleConfigs[key];
      }
    }
    //grunt.log.writeln('CONFIG: ' + JSON.stringify(ngConfig, null, '\t'));
    grunt.config.set('ngtemplates', ngConfig);
  });


  grunt.registerTask('_convertHTML2JS', 'PRIVATE - do not use', ['copy:directiveTemplatesToTemp', 'prepareNGTemplates', 'ngtemplates']);

  grunt.registerTask('_buildJS', 'PRIVATE - do not use', [
    'clean:buildJS',
    'copy:vendorJS',
    '_convertHTML2JS',
    'copy:jsToTemp',
    'copy:jsIncludesToTemp',
    'includereplace:js',
    'concat:moduleJS'
  ]);

};
