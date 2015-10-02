var env     = 'public/',
  vendorDir = 'src/vendor/',
  pkg       = require('./package.json');
module.exports = {
  pkg: {
    name: pkg.name
  },
  pluginOpts: {
    jade: {
      data  : {
        name       : pkg.name,
        description: pkg.description
      }
    },
    coffee: {
      bare: true
    },
    gSize: {
      showFiles: true
    },
    browserSync: {
      port     : 1987,
      startPath: '/public',
      server   : {
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
    base   : env,
    sources: {
      coffee: [
        'src/coffee/**/*.coffee'
      ],
      img: [
        'src/img/**/*.*'
      ],
      json: [
        'src/json/**/*.json'
      ],
      vendor: {
        js: [
          vendorDir + 'jquery/dist/jquery.js',
          vendorDir + 'lodash/lodash.js',
          vendorDir + 'backbone/backbone.js',
          vendorDir + 'Backbone.localStorage/backbone.localStorage.js',
          vendorDir + 'marionette/lib/backbone.marionette.js',
          vendorDir + 'yap/dist/yap.min.js',
          vendorDir + 'jquery-ui/jquery-ui.js',
          vendorDir + 'jqueryui-touch-punch/jquery.ui.touch-punch.min.js',
          vendorDir + 'material-design-lite/material.js',
          vendorDir + 'marked/marked.min.js'
        ],
        css: [
          vendorDir + 'normalize.css/normalize.css',
          vendorDir + 'material-design-lite/material.css'
        ],
        fonts: [
          vendorDir + 'roboto/out/RobotoTTF/Roboto-Regular.ttf',
          vendorDir + 'material-design-icons/iconfont/**/*.{eot,ttf,woff,woff2}'
        ]
      },
      jade: [
        'src/jade/*.jade',
        'src/jade/layout-blocks/**/*.jade'
      ],
      docs     : 'src/jade/*.jade',
      templates: 'src/jade/templates/**/*.jade',
      stylus   : 'src/stylus/**/*.stylus',
      overwatch: env + '**/*.{html,js,css}'
    },
    destinations: {
      html     : env,
      js       : env + 'js/',
      css      : env + 'css/',
      img      : env + 'img/',
      fonts    : env + 'fonts/',
      templates: 'src/coffee/templates/',
      build    : '',
      dist     : './dist',
      test     : 'testEnv/'
    }
  }
};
