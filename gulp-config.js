var env     = 'public/',
  vendorDir = 'node_modules/',
  pkg       = require('./package.json');
module.exports = {
  pkg: {
    name: pkg.name
  },
  pluginOpts: {
    pug: {
      data  : {
        name       : pkg.name,
        description: pkg.description
      }
    },
    coffee: {
      bare: true
    },
    minify: {
      keepSpecialComments: 1
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
    uglify: {
      preserveComments: 'license'
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
      script: [
        'src/script/**/*.js'
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
          vendorDir + 'lodash/index.js',
          vendorDir + 'backbone/backbone.js',
          vendorDir + 'backbone.wreqr/lib/backbone.wreqr.js',
          vendorDir + 'backbone.localstorage/backbone.localStorage.js',
          vendorDir + 'backbone.marionette/lib/backbone.marionette.js',
          /**
            * In order to use jquery/jquery-ui, need to require specific
            * modules in order to get sortable working.
          */
          vendorDir + 'jquery-ui/ui/data.js',
          vendorDir + 'jquery-ui/ui/widget.js',
          vendorDir + 'jquery-ui/ui/widgets/mouse.js',
          vendorDir + 'jquery-ui/ui/widgets/sortable.js',
          vendorDir + 'jquery-ui/ui/scroll-parent.js',
          vendorDir + 'jquery-ui/ui/version.js',
          vendorDir + 'jquery-ui/ui/ie.js',
          vendorDir + 'jquery-ui-touch-punch/jquery.ui.touch-punch.min.js',
          vendorDir + 'material-design-lite/material.js',
          vendorDir + 'marked/marked.min.js'
        ],
        css: [
          vendorDir + 'normalize.css/normalize.css',
          vendorDir + 'material-design-lite/material.css'
        ],
        fonts: [
          vendorDir + 'material-design-icons/iconfont/**/*.{eot,ttf,woff,woff2}'
        ]
      },
      markup: [
        'src/markup/*.pug',
        'src/markup/layout-blocks/**/*.pug'
      ],
      docs     : 'src/markup/*.pug',
      templates: 'src/markup/templates/**/*.pug',
      style    : 'src/style/**/*.styl',
      overwatch: env + '**/*.*'
    },
    destinations: {
      html     : env,
      js       : env + 'js/',
      css      : env + 'css/',
      img      : env + 'img/',
      fonts    : env + 'fonts/',
      templates: 'src/script/templates/',
      build    : '',
      dist     : './dist',
      test     : 'testEnv/'
    }
  }
};
