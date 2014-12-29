module.exports = function(grunt) {
  'use strict';

  var paths = grunt.config.get('paths.buildHTML');

  grunt.extendConfig({
    copy: {
      html: paths.html.copy,
      moduleAssets: paths.moduleAssets.copy
    },

    targethtml: {
      unoptimised: paths.html.filesWithTemplateTags
      // There's some extra config here to generate the vendor scripts
    },

    watch: {
      html: {
        files: paths.html.watch,
        tasks: ['copy:html', 'targethtml:unoptimised']
      },
      moduleAssets: {
        files: paths.moduleAssets.watch,
        tasks: ['copy:moduleAssets']
      }
    }
  });



  function generateScriptTags(files) {
    var result = '';

    files.forEach(function(fileName) {
      result += '<script src="vendor/' + fileName + '"></script>\n';
    });

    return result;
  }

  // This task takes a list of vendorJS files and turns it into a string containing <script> tags, stored in a config variable
  grunt.config.set('targethtml.unoptimised.options.curlyTags.vendorScripts', generateScriptTags(paths.vendorJSFiles));
  grunt.config.set('targethtml.unoptimised.options.curlyTags.externalScripts', generateScriptTags(paths.externalJSFiles));
  grunt.config.set('targethtml.optimised.options.curlyTags.vendorScripts', generateScriptTags(paths.vendorJSFiles));
  grunt.config.set('targethtml.optimised.options.curlyTags.externalScripts', generateScriptTags(paths.externalJSFiles));



  grunt.registerTask('_buildHTML', 'PRIVATE - do not use', ['copy:html', 'copy:moduleAssets', 'targethtml:unoptimised']);
};
