'use strict';

module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,
    jshint: {
      gruntfile: ['Gruntfile.js'],
      common: ['main.js'],
      frontend: {
        files: {
          game: ['src/**/*.+(js|jsx)'],
          common: ['src/common/*.+(js|jsx)']
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
      server: {
        options: {
          port: "1992",
          script: 'main.js'
        }
      }
    },
    watch: {
      options: {
        interrupt: true
      },
      server: {
        files: [
        '<%= jshint.frontend.files.game %>',
        '<%= jshint.frontend.files.common %>',
        '<%= jshint.common %>',
        '<%= jshint.gruntfile %>',
        'views/*'
        ],
        tasks: ['jshint', 'browserify', 'express:server'],
        options: {
          spawn: false
        }
      }
    },
    browserify: {
      options: {
        transform: ['reactify'],
        borwserifyOptions: {
          fullPaths: false
        }
      },
      game: {
        files: {
          'static/index.js': [
            'src/game.jsx'
          ]
        },
        options: {
          watch: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsxhint');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['jshint', 'browserify', 'express:server', 'watch:server']);
};
