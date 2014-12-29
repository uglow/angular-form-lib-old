module.exports = function(grunt) {
  'use strict';

  var paths = grunt.config.get('paths.optimise');

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
      dist: paths.dest.dir
    },

    concurrent: {
      distImages: ['imagemin:dist', 'svgmin:dist', 'cssmin:dist']
    },

    concat: {
      optimize: {
        files: [
          {src: paths.src.jsFilesToConcat, dest: paths.dest.jsDir + paths.dest.jsMinFile}
        ]
      }
    },

    copy: {
      dist: paths.copy,
      htmlPreOptimised: {
        files: [
          {expand: true, cwd: paths.src.dir, src: paths.src.htmlFiles, dest: paths.dest.dir},
          {expand: true, cwd: paths.src.rootHtmlFilesDir, src: paths.src.rootHtmlFiles, dest: paths.dest.dir}
        ]
      }
    },

    cssmin: {
      options: {
        report: 'min'
      },
      dist: {
        files: [
          {expand: true, cwd: paths.src.cssDir, src: paths.src.cssFiles, dest: paths.dest.cssDir}
        ]
      }
    },

    filerev: {
      dist: {
        src: paths.dest.filesToRev
      }
    },

    imagemin: {
      dist: {
        files: [
          {expand: true, cwd: paths.src.imagesDir, src: '{,*/}*.{png,jpg,jpeg,gif}', dest: paths.dest.imagesDir}
        ]
      }
    },

    svgmin: {
      dist: {
        files: [
          {expand: true, cwd: paths.src.imagesDir, src: '{,*/}*.svg', dest: paths.dest.imagesDir}
        ]
      }
    },

    targethtml: {
      optimised: {
        files: [{src: paths.dest.rootFilesDir + paths.src.rootHtmlFiles, dest: paths.dest.rootFilesDir}]
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
          {expand: true, cwd: paths.dest.dir, src: paths.src.htmlFiles, dest: paths.dest.dir},
          {expand: true, cwd: paths.dest.rootFilesDir, src: paths.dest.rootHtmlFiles, dest: paths.dest.rootFilesDir}
        ]
      }
    },

    usemin: {
      html: paths.dest.htmlFiles,
      css: paths.dest.cssFiles,
      options: {
        assetsDirs: [paths.dest.dir, paths.dest.dir + 'assets/']
      }
    }
  });


  grunt.registerMultiTask('buildDocs', 'Optimise the documentation for production', function () {
    grunt.log.writeln(this.target + ': ' + this.data);

    // Execute each task
    grunt.task.run(this.data);
  });
};
