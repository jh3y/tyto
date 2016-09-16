var gulp         = require('gulp'),
    gConfig      = require('../gulp-config'),
    pluginOpts   = gConfig.pluginOpts,
    sources      = gConfig.paths.sources,
    destinations = gConfig.paths.destinations,
    env          = require('./utils').getEnv(),
    plugins      = require('gulp-load-plugins')(pluginOpts.load);

var tmpl = {
  compile: function(){
    return gulp.src(sources.templates)
      .pipe(plugins.plumber())
      .pipe(plugins.pug(pluginOpts.pug))
      .pipe(plugins.template({
        name: 'templates.js',
        base: 'src/markup/templates/',
        variable: 'module.exports',
        options: {
          variable: 'tyto'
        }
      }))
      .pipe(gulp.dest(destinations.templates));
  },
  watch: function() {
    gulp.watch(sources.templates, ['tmpl:compile']);
  }
};

module.exports = tmpl;
