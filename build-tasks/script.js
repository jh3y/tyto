var gulp         = require('gulp'),
    browserify   = require('browserify'),
    source       = require('vinyl-source-stream'),
    buffer       = require('vinyl-buffer'),
    fs           = require('fs'),
    gConfig      = require('../gulp-config'),
    pluginOpts   = gConfig.pluginOpts,
    sources      = gConfig.paths.sources,
    destinations = gConfig.paths.destinations,
    env          = require('./utils').getEnv(),
    plugins      = require('gulp-load-plugins')(pluginOpts.load);

var scripts = {
  compile: function () {
    var b = browserify({
      entries: [
        './src/script/app.js'
      ],
      transform: 'babelify',
      extensions: '.js',
      debug: env.mapped ? true: false
    });

    return b.bundle()
      .pipe(plugins.plumber())
      .pipe(source(gConfig.pkg.name + '.js'))
      .pipe(buffer())
      .pipe(env.mapped ? plugins.sourcemaps.init({loadMaps: true}): plugins.gUtil.noop())
      .pipe(plugins.wrap(pluginOpts.wrap))
      .pipe(plugins.header(fs.readFileSync('./LICENSE', 'utf-8')))
      .pipe(env.stat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
      .pipe(gulp.dest(destinations.js))
      .pipe(plugins.uglify(pluginOpts.uglify))
      .pipe(plugins.rename(pluginOpts.rename))
      .pipe(env.mapped ? plugins.sourcemaps.write('./'): plugins.gUtil.noop())
      .pipe(env.stat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
      .pipe(gulp.dest(env.dist ? destinations.dist: destinations.js));

  },
  watch: function() {
    gulp.watch(sources.script, ['script:compile']);
  }
};

module.exports = scripts;
