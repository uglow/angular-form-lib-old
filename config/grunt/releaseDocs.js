module.exports = function(grunt) {
  'use strict';

  grunt.extendConfig({

    // Documentation tasks
    gitcheckout: {
      documentation: {
        options: {
          branch: 'gh-pages'
        }
      },
      master: {
        options: {
          branch: 'master'
        }
      }
    },

    gitadd: {
      documentation: {
        options: {
          all: true
        },
        files: {
          src: ['site/**/*']
        }
      }
    },

    gitcommit: {
      documentation: {
        options: {
          message: 'docs(v' + grunt.file.readJSON('package.json').version + '): Update documentation',
          noStatus: true
        },
        files: {
          src: ['site/**/*']
        }
      }
    },

    copy: {
      docsToSite: {
        files: [{expand: true, cwd: 'docs/', src: '**/*', dest: 'site/'}]
      }
    }
  });

  grunt.registerTask('releaseDocs', [
    'gitcheckout:documentation',
    'copy:docsToSite',
    'gitadd:documentation',
    'gitcommit:documentation',
    'gitcheckout:master'
  ]);

};
