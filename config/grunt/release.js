module.exports = function(grunt) {
  'use strict';

  var colors = require('colors'); /* jshint ignore:line */

  var config = grunt.config.get('cfg.release');

  grunt.extendConfig({
    PKG: grunt.file.readJSON('package.json'),
    bump: {
      options: {
        files: config.filesToBump,
        updateConfigs: ['PKG'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: config.filesToCommit,
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
      }
    },
    exec: {
      checkIfAnyUncommittedChanges: {
        command: 'test -z "$(git status --porcelain)"',  // http://stackoverflow.com/questions/2657935/checking-for-a-dirty-index-or-untracked-files-with-git
        stdout: true,
        stderr: true,
        callback: function (error/*, stdout, stderr*/) {
          //console.log('error: ' + error);
          //console.log('stdout: ' + stdout);
          //console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('>>> You have uncommitted changes! <<<'.red.bold.inverse);
          } else {
            console.log('No outstanding changes ---> proceed :) '.green.bold.inverse);
          }
        }
      }
    },
    changelog: {
      options: {
      }
    }
  });

  grunt.registerTask('preReleaseCheck', 'Return non-zero code if there are uncommitted changes', function() {
    grunt.task.run('build');
    grunt.task.run('exec:checkIfAnyUncommittedChanges');
  });

  grunt.registerTask('preChangelog', 'Reads the existing value of the project to use as the "from" tag when reading commit messages', function () {
    // Read current version value
    var oldVer = grunt.file.readJSON('package.json').version;
    grunt.config.set('changelog.options.from', 'v' + oldVer);
    //grunt.config.set('changelog.options.to', 'v0.3.0');
    grunt.log.ok('old version = ' + grunt.config.get('changelog.options.from'));
  });

  // Note: Do NOT call release until you have committed all your changes already.
  grunt.registerTask('release', 'Releases a new version (update version, changelog, commit)', function (versionChange) {
    var target = versionChange || 'patch';
    grunt.task.run('preReleaseCheck', 'preChangelog', 'bump-only' + ':' + target, 'changelog', 'bump-commit', 'releaseDocs');
  });


};
