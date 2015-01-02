module.exports = function(grunt) {
  'use strict';

  var config = grunt.config.get('cfg.buildJS');

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
      buildJS: config.clean
    },
    copy: {
      htmlTemplatesToTemp: config.copy.htmlTemplatesToTemp,
      jsToTemp: config.copy.jsToTemp,
      vendorJS: config.copy.vendorJS
    },
    concat: {
      moduleJS: config.concat.moduleJS
    },

    includereplace: {
      js: {
        files: config.includeFilesInJS.sourceFiles,
        options: {
          includesDir: config.includeFilesInJS.includesDir
        }
      }
    },

    prepareNGTemplates: {
      app: config.prepareNGTemplates
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
//        src: '<%= cfg.dest.partialsDir %>**/ui/accessible/template/AccessibleTooltipTemplate.html',
//        dest: '<%= cfg.dest.jsDir %>ui/ui.accessible.controls.tooltip.template.js',
//        options: {
//          standalone: true
//        }
//      }
    },

    watch: {
      // JS task is in watch.js, as it needs to be run other tasks besides concat:moduleJS
      jsHtmlTemplates: {
        files: config.watch.jsHtmlTemplates.files,
        tasks: ['_buildJS']
      },
      vendorJS: {
        files: config.watch.vendorJS.files,
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


  grunt.registerTask('_convertHTML2JS', 'PRIVATE - do not use', ['copy:htmlTemplatesToTemp', 'prepareNGTemplates', 'ngtemplates']);

  grunt.registerTask('_buildJS', 'PRIVATE - do not use', [
    'clean:buildJS',
    '_convertHTML2JS',
    'copy:vendorJS',
    'copy:jsToTemp',
    'includereplace:js',
    'concat:moduleJS'
  ]);

};
