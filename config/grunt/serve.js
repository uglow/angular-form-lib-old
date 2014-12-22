module.exports = function(grunt) {
  'use strict';

  var config = grunt.config.get('paths.serve');

  grunt.extendConfig({
    serve: {
      dev: ['connect:dev'],
      prod: ['connect:prod']
    },
    // The actual grunt server settings
    connect: {
      dev: {
        options: {
          open: false,
          base: config.dev.baseDir,
          port: config.dev.port,
          hostname: config.dev.hostname,
          livereload: 35729
        }
      },
      prod: {
        options: {
          open: false,
          base: config.prod.baseDir,
          port: config.prod.port,
          hostname: config.dev.hostname,
          keepalive: true
        }
      }
    }
  });

  grunt.registerMultiTask('serve', 'Start a webserver and serve files', function () {
    grunt.log.writeln(this.target + ': ' + this.data);

    // Execute each task
    grunt.task.run(this.data);
  });
};
