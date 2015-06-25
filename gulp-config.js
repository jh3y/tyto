var env = 'out/';
module.exports = {
  pkg: {
    name: 'tyto'
  },
  pluginOpts: {
    jade: {
      pretty: false
    },
    coffee: {
      bare: true
    },
    gSize: {
      showFiles: true
    },
    browserSync: {
      port   : 1987,
      server : {
        baseDir: env
      }
    },
    rename: {
      suffix: '.min'
    },
    order: [
      'config.js',
      'tyto.js'
    ],
    prefix: [
      'last 3 versions',
      'Blackberry 10',
      'Android 3',
      'Android 4'
    ],
    wrap: '(function() { <%= contents %> }());',
    load: {
      rename: {
        'gulp-gh-pages'             : 'deploy',
        'gulp-util'                 : 'gUtil',
        'gulp-minify-css'           : 'minify',
        'gulp-autoprefixer'         : 'prefix'
      }
    }
  },
  paths: {
    base: env,
    sources: {
      coffee: [
        'src/coffee/**/*.coffee'
      ],
      vendor: {
        js: [
          "src/vendor/jquery/dist/jquery.js",
          "src/vendor/jquery-ui/jquery-ui.js",
          "src/vendor/jqueryui-touch-punch/jquery.ui.touch-punch.min.js",
          "src/vendor/bootstrap/dist/js/bootstrap.min.js",
          "src/vendor/handlebars/handlebars.min.js"
        ],
        css: [
          "src/vendor/normalize.css/normalize.css",
          "src/vendor/bootstrap/dist/css/bootstrap.min.css",
          "src/vendor/fontawesome/css/font-awesome.min.css"
        ],
        fonts: [
          'src/vendor/fontawesome/fonts/**/*.*'
        ]
      },
      images: 'src/images/**/*.*',
      jade: 'src/jade/*.jade',
      templates: 'src/jade/templates/**/*.jade',
      less: 'src/less/**/*.less',
      overwatch: env + '**/*.*'
    },
    destinations: {
      testing: {
        screenshots: './testing/screenshots'
      },
      dist: './dist',
      build: '',
      js: env + 'js/',
      html: env,
      fonts: env + 'fonts/',
      images: env + 'images/',
      css: env + 'css/',
      test: 'testEnv/',
      templates: env + 'templates/'
    }
  }
};
