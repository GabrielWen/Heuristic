'use strict';

module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,
    jshint: {
      gruntfile: ['Gruntfile.js'],
      common: ['main.js', 'config.js', 'src/common/**/*.js'],
      client: {
        files: {
          hunter: ['src/hunter/**/*.js'],
          prey: ['src/prey/**/*.js']
        },
        options: pkg.jshintConfig
      },
      options: {
        devel: true,
        strict: true,
        node: true
      }
    },
    express: {
      hunter: {
        options: {
          node_env: "hunter",
          port: 1991,
          script: 'main.js'
        }
      },
      prey: {
        options: {
          node_env: "prey",
          port: "1992",
          script: 'main.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', 'Should not use without specifying role', function(environment) {
    grunt.fail.fatal(new Error('Need to specify role playing... (hunter or prey)'));
  });
  grunt.registerTask('hunter', ['jshint', 'express:hunter']);
  grunt.registerTask('prey', ['jshint', 'express:prey']);
};
