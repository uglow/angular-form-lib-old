module.exports = function(grunt) {
  'use strict';

  grunt.extendConfig({
    exec: {
      githooks: {
        command: 'mkdir -p .git/hooks && ln -sf ../../config/git/validate-commit-msg.js .git/hooks/commit-msg',
        stdout: true
      },
      gittemplate: {
        command: 'git config commit.template config/git/git-commit-template.txt',
        stdout: true
      },
      // This command makes it possible for SourceTree to show a commit-error from the validate-commit-msg.js file when
      // you type an invalid message. It links the node directory to the /usr/bin directory, which allows Sourcetree to see it.
      putNodeOnPathForSourceTree: {
        command: 'sudo ln -sf /usr/local/bin/node /usr/bin/node',
        stdout: true
      }
    }
  });


  grunt.registerTask('install', 'Post-installation tasks for the project',
      ['exec:githooks', 'exec:gittemplate', 'exec:putNodeOnPathForSourceTree']);
};
