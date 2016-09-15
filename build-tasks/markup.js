var gulp         = require('gulp'),
    gConfig      = require('../gulp-config'),
    pluginOpts   = gConfig.pluginOpts,
    sources      = gConfig.paths.sources,
    destinations = gConfig.paths.destinations,
    env          = require('./utils').getEnv(),
    plugins      = require('gulp-load-plugins')(pluginOpts.load);

var markup = {
  compile: function() {
    return gulp.src(sources.docs)
      .pipe(plugins.plumber())
      .pipe(plugins.pug(pluginOpts.pug))
      .pipe(gulp.dest(destinations.html));
  },
  watch: function() {
    gulp.watch(sources.markup, ['markup:compile']);
  }
};

module.exports = markup;
