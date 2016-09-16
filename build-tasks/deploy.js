var gulp         = require('gulp'),
    gConfig      = require('../gulp-config'),
    pluginOpts   = gConfig.pluginOpts,
    sources      = gConfig.paths.sources,
    destinations = gConfig.paths.destinations,
    env          = require('./utils').getEnv(),
    plugins      = require('gulp-load-plugins')(pluginOpts.load);

var deploy = {
  deploy: function () {
    return gulp.src(sources.overwatch)
      .pipe(plugins.deploy());
  }
};

module.exports = deploy;
