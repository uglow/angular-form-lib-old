module.exports = function(grunt) {
  'use strict';

  var paths = grunt.config.get('paths.buildHTML');

  grunt.extendConfig({
    copy: {
      html: paths.copyHTML,
      globalAssets: {
        files: [
          {expand:true, flatten:false, cwd: paths.globalAssets.srcDir, src: paths.globalAssets.files, dest: paths.globalAssets.destDir}
        ]
      },
      moduleAssets: {
        files: [
          {
            expand: true,
            flatten: false,
            cwd: paths.moduleAssets.srcDir,
            src: paths.moduleAssets.files,
            dest: paths.moduleAssets.destDir,
            rename: paths.moduleAssets.renameFunc
          }
        ]
      }
    },

    targethtml: {
      unoptimised: {
        files: [{src: paths.html.rootFilesDestDir + paths.html.rootFiles, dest: paths.html.rootFilesDestDir}]
        // There's some extra config here to generate the vendor scripts
      }
    },


    watch: {
      html: {
        files: paths.watchHTMLFiles,
        tasks: ['copy:html', 'targethtml:unoptimised']
      },
      globalAssets: {
        files: [paths.globalAssets.srcFiles],
        tasks: ['copy:globalAssets']
      },
      moduleAssets: {
        files: [paths.moduleAssets.srcDir + paths.moduleAssets.files],
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



  grunt.registerTask('_buildHTML', 'PRIVATE - do not use', ['copy:html', 'copy:moduleAssets', 'copy:globalAssets', 'targethtml:unoptimised']);
};
