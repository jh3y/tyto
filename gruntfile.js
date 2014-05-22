module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      options: {
        port: 1987,
        livereload: 35729,
        // Change this to '0.0.0.0' to access the server from outside
        base: "out/",
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: true
        }
      }
    },
    copy: {
      images: {
        files: [
          {
            flatten: true,
            expand: true,
            src: "src/images/**/*.*",
            dest: "out/images/"
          }
        ]
      }
    },
    coffee: {
      compile: {
        options: {
          join: true,
          bare: false
        },
        files: [
          {
            "out/js/tyto.js": ["src/coffeescript/config.coffee",
              "src/coffeescript/tyto.coffee"]
          }
        ]
      }
    },
    jade: {
      compile: {
        files: [
          {
            "out/index.html": "src/templates/index.jade"
          },
          {
            "out/cookies.html": "src/templates/cookies.jade"
          },
          {
            expand: true,
            flatten: true,
            src: ["src/templates/tyto/*.jade"],
            dest: "out/templates/",
            ext: ".html"
          }
        ]
      }
    },
    less: {
      development: {
        files: {
          "out/css/style.css": "src/less/style.less"
        }
      }
    },
    watch: {
      scripts: {
        files: [
            "src/templates/**/*.jade",
            "src/less/**/*.less",
            "src/coffeescript/**/*.coffee",
        ],
        tasks: ['jade', 'less', 'coffee']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['connect', 'copy', 'watch']);

};
