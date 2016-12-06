var gulp         = require('gulp'),
    gConfig      = require('../gulp-config'),
    pluginOpts   = gConfig.pluginOpts,
    sources      = gConfig.paths.sources,
    destinations = gConfig.paths.destinations,
    env          = require('./utils').getEnv(),
    plugins      = require('gulp-load-plugins')(pluginOpts.load);

var assets = {
  scripts: function() {
    return gulp.src(sources.vendor.js)
      .pipe(plugins.plumber())
      .pipe(plugins.concat('vendor.js'))
      .pipe(gulp.dest(destinations.js))
      .pipe(plugins.uglify(pluginOpts.uglify))
      .pipe(plugins.rename(pluginOpts.rename))
      .pipe(gulp.dest(destinations.js));
  },
  fonts: function() {
    return gulp.src(sources.vendor.fonts)
      .pipe(plugins.plumber())
      .pipe(gulp.dest(destinations.fonts));
  },
  styles: function() {
    return gulp.src(sources.vendor.css)
      .pipe(plugins.plumber())
      .pipe(plugins.concat('vendor.css'))
      .pipe(gulp.dest(destinations.css))
      .pipe(plugins.minify(pluginOpts.minify))
      .pipe(plugins.rename(pluginOpts.rename))
      .pipe(gulp.dest(destinations.css));
  },
  img: function() {
    return gulp.src(sources.img)
      .pipe(plugins.plumber())
      .pipe(gulp.dest(destinations.img));
  },
  json: function() {
    return gulp.src(sources.json)
      .pipe(plugins.plumber())
      .pipe(gulp.dest(destinations.js));
  }
};

module.exports = assets;
