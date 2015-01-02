module.exports = function(grunt) {
  'use strict';

  var config = grunt.config.get('cfg.optimise');

  grunt.extendConfig({
    buildDocs: {
      pre: ['clean:dist'],
      images: ['concurrent:distImages'],
      copyAlreadyOptimised: ['copy:dist'],
      copyHTMLInPreparationForOptimisation: ['copy:htmlPreOptimised'],
      optimiseJS: ['concat:optimize'],
      useOptimisedHTMLFragments: ['targethtml:optimised'],
      fileRevAssets: ['filerev', 'usemin']/*,
      postHTMLProcessing: ['htmlmin:dist']*/
    },

    clean: {
      dist: config.dest.dir
    },

    concurrent: {
      distImages: ['imagemin:dist', 'svgmin:dist', 'cssmin:dist']
    },

    concat: {
      optimize: {
        files: [
          {src: config.src.jsFilesToConcat, dest: config.dest.jsDir + config.dest.jsMinFile}
        ]
      }
    },

    copy: {
      dist: config.copy,
      htmlPreOptimised: {
        files: [
          {expand: true, cwd: config.src.dir, src: config.src.htmlFiles, dest: config.dest.dir},
          {expand: true, cwd: config.src.rootHtmlFilesDir, src: config.src.rootHtmlFiles, dest: config.dest.dir}
        ]
      }
    },

    cssmin: {
      options: {
        report: 'min'
      },
      dist: {
        files: [
          {expand: true, cwd: config.src.cssDir, src: config.src.cssFiles, dest: config.dest.cssDir}
        ]
      }
    },

    filerev: {
      dist: {
        src: config.dest.filesToRev
      }
    },

    imagemin: {
      dist: {
        files: [
          {expand: true, cwd: config.src.imagesDir, src: '{,*/}*.{png,jpg,jpeg,gif}', dest: config.dest.imagesDir}
        ]
      }
    },

    svgmin: {
      dist: {
        files: [
          {expand: true, cwd: config.src.imagesDir, src: '{,*/}*.svg', dest: config.dest.imagesDir}
        ]
      }
    },

    targethtml: {
      optimised: {
        files: [{src: config.dest.rootFilesDir + config.src.rootHtmlFiles, dest: config.dest.rootFilesDir}]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: false,   // Setting this to true will reduce the required="true" attribute to required, which breaks the app.
          removeAttributeQuotes: true,
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [
          {expand: true, cwd: config.dest.dir, src: config.src.htmlFiles, dest: config.dest.dir},
          {expand: true, cwd: config.dest.rootFilesDir, src: config.dest.rootHtmlFiles, dest: config.dest.rootFilesDir}
        ]
      }
    },

    usemin: {
      html: config.dest.htmlFiles,
      css: config.dest.cssFiles,
      options: {
        assetsDirs: [config.dest.dir, config.dest.dir + 'assets/']
      }
    }
  });


  grunt.registerMultiTask('buildDocs', 'Optimise the documentation for production', function () {
    grunt.log.writeln(this.target + ': ' + this.data);

    // Execute each task
    grunt.task.run(this.data);
  });
};
