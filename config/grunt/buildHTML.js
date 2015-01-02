module.exports = function(grunt) {
  'use strict';

  var config = grunt.config.get('cfg.buildHTML');

  grunt.extendConfig({
    copy: {
      html: config.html.copy,
      moduleAssets: config.moduleAssets.copy
    },

    targethtml: {
      unoptimised: config.html.filesWithTemplateTags
      // There's some extra config here to generate the vendor scripts
    },

    watch: {
      html: {
        files: config.html.watch,
        tasks: ['copy:html', 'targethtml:unoptimised']
      },
      moduleAssets: {
        files: config.moduleAssets.watch,
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
  grunt.config.set('targethtml.unoptimised.options.curlyTags.vendorScripts', generateScriptTags(config.vendorJSFiles));
  grunt.config.set('targethtml.unoptimised.options.curlyTags.externalScripts', generateScriptTags(config.externalJSFiles));
  grunt.config.set('targethtml.optimised.options.curlyTags.vendorScripts', generateScriptTags(config.vendorJSFiles));
  grunt.config.set('targethtml.optimised.options.curlyTags.externalScripts', generateScriptTags(config.externalJSFiles));


  function generateLinkTags(files) {
    var result = '';

    files.forEach(function(fileName) {
      result += '<link rel="stylesheet" href="' + fileName + '">\n';
    });

    return result;
  }

  // This task takes a list of vendorJS files and turns it into a string containing <script> tags, stored in a config variable
  grunt.config.set('targethtml.unoptimised.options.curlyTags.cssFiles', generateLinkTags(config.compiledCSSFiles));
  grunt.config.set('targethtml.optimised.options.curlyTags.cssFiles', generateLinkTags(config.compiledCSSFiles));



  grunt.registerTask('_buildHTML', 'PRIVATE - do not use', ['copy:html', 'copy:moduleAssets', 'targethtml:unoptimised']);
};
