var gulp         = require('gulp'),
    gConfig      = require('../gulp-config'),
    pluginOpts   = gConfig.pluginOpts,
    sources      = gConfig.paths.sources,
    destinations = gConfig.paths.destinations,
    env          = require('./utils').getEnv(),
    plugins      = require('gulp-load-plugins')(pluginOpts.load);

var style = {
  compile: function() {
    return gulp.src(sources.style, {base: 'src/style'})
      .pipe(plugins.plumber())
      .pipe(plugins.order(pluginOpts.order.stylus))
      .pipe(plugins.concat(gConfig.pkg.name + '.styl'))
      .pipe(plugins.stylus())
      .pipe(plugins.prefix(pluginOpts.prefix))
      .pipe(gulp.dest(destinations.css))
      .pipe(plugins.minify())
      .pipe(plugins.rename(pluginOpts.rename))
      .pipe(gulp.dest(destinations.css));
  },
  watch: function() {
    gulp.watch(sources.style, ['style:compile']);
  }
};

module.exports = style;
