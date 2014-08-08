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
          open: false
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
      },
      vendor_fonts: {
        files: [
          {
            flatten: true,
            expand: true,
            src: "vendor/fontawesome/fonts/*.*",
            dest: "out/fonts/"
          }
        ]
      },
      test_assets: {
        files: [
          {
            flatten: true,
            expand: true,
            src: "vendor/mocha/mocha.js",
            dest: "out/js/test/"
          },
          {
            flatten: true,
            expand: true,
            src: "vendor/mocha/mocha.css",
            dest: "out/css/test/"
          },
          {
            flatten: true,
            expand: true,
            src: "vendor/chai/chai.js",
            dest: "out/js/test/"
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
            "out/js/tyto.js": "src/coffeescript/tyto.coffee"
          },
          {
            "out/js/config.js": "src/coffeescript/config.coffee"
          },
          {
            "out/js/test/test.js": "src/coffeescript/test.coffee"
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
            "out/test/index.html": "src/templates/test.jade"
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
        options: {
          compress: true
        },
        files: {
          "out/css/style.css": [
            "src/less/actions.less",
            "src/less/barn.less",
            "src/less/cookiebanner.less",
            "src/less/header.less",
            "src/less/item.less",
            "src/less/modals.less",
            "src/less/notification.less",
            "src/less/tyto.less"
          ]
        }
      }
    },
    concat: {
      options: {
        seperator: ';'
      },
      scripts: {
        src: [
          "vendor/jquery/dist/jquery.min.js",
          "vendor/jquery-ui/jquery-ui.min.js",
          "vendor/jqueryui-touch-punch/jquery.ui.touch-punch.min.js",
          "vendor/bootstrap/dist/js/bootstrap.min.js",
          "vendor/handlebars/handlebars.min.js"
        ],
        dest: "out/js/vendor.js"
      },
      styles: {
        src: [
          "vendor/normalize.css/normalize.css",
          "vendor/bootstrap/dist/css/bootstrap.min.css",
          "vendor/fontawesome/css/font-awesome.min.css"
        ],
        dest: "out/css/vendor.css"
      }
    },
    watch: {
      scripts: {
        files: ["src/coffeescript/**/*.coffee"],
        tasks: ['coffee']
      },
      styles: {
        files: ["src/less/**/*.less"],
        tasks: ['less']
      },
      templates: {
        files: ["src/templates/**/*.jade"],
        tasks: ['jade']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('deploy:test', ['concat', 'jade', 'less', 'coffee', 'copy']);
  grunt.registerTask('default', ['connect', 'concat', 'jade', 'less', 'coffee', 'copy', 'watch']);

};
