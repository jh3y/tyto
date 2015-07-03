var env = 'public/';
module.exports = {
  pkg: {
    name: 'tyto'
  },
  pluginOpts: {
    jade: {
      pretty: true
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
        baseDir: './'
      }
    },
    rename: {
      suffix: '.min'
    },
    order: {
      stylus: [
        '_var.stylus',
        '_typography.stylus',
        '_functions.stylus',
        'base.stylus',
        '**/*.stylus'
      ]
    },
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
        'gulp-autoprefixer'         : 'prefix',
        'gulp-template-store'       : 'template'
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
          'src/vendor/jquery/dist/jquery.js',
          'src/vendor/lodash/lodash.js',
          'src/vendor/backbone/backbone.js',
          'src/vendor/Backbone.localStorage/backbone.localStorage.js',
          'src/vendor/backbone.relational/backbone-relational.js',
          'src/vendor/marionette/lib/backbone.marionette.js',
          'src/vendor/yap/dist/yap.min.js',
          'src/vendor/jquery-ui/jquery-ui.js',
          'src/vendor/jqueryui-touch-punch/jquery.ui.touch-punch.min.js'
        ],
        css: [
          'src/vendor/normalize.css/normalize.css',
          'src/vendor/fontawesome/css/font-awesome.css'
        ],
        fonts: [
          'src/vendor/roboto/out/RobotoTTF/Roboto-Regular.ttf',
          'src/vendor/material-design-icons/iconfont/**/*.{eot,ttf,woff,woff2}'
        ]
      },
      jade: [
        'src/jade/*.jade',
        'src/jade/layout-blocks/**/*.jade'
      ],
      docs: 'src/jade/*.jade',
      templates: 'src/jade/templates/**/*.jade',
      stylus: 'src/stylus/**/*.stylus',
      overwatch: env + '**/*.{html,js,css}'
    },
    destinations: {
      html: env,
      js: env + 'js/',
      css: env + 'css/',
      fonts: env + 'fonts/',
      templates: 'src/coffee/templates/',
      build: '',
      dist: './dist',
      test: 'testEnv/'
    }
  }
};
