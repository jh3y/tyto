var gulp       = require('gulp'),
  browserSync  = require('browser-sync'),
  gConfig      = require('./gulp-config'),
  pluginOpts   = gConfig.pluginOpts,
  sources      = gConfig.paths.sources,
  destinations = gConfig.paths.destinations,
  plugins      = require('gulp-load-plugins')(pluginOpts.load),
  isTest       = (plugins.gUtil.env.test)   ? true: false,
  isMapped     = (plugins.gUtil.env.map)    ? true: false,
  isStat       = (plugins.gUtil.env.stat)   ? true: false,
  isDist       = (plugins.gUtil.env.dist)   ? true: false,
  isDeploy     = (plugins.gUtil.env.deploy) ? true: false;


gulp.task('serve', ['build:complete'], function() {
  browserSync(pluginOpts.browserSync);
  gulp.watch(sources.overwatch).on('change', browserSync.reload);
});


gulp.task('coffee:compile', function() {
  var testFilter = plugins.filter('test/**/*.js'),
    noTestFilter = plugins.filter([
      '**/*.js',
      '!test/**/*.js'
    ]);
  return gulp.src(sources.coffee, {base: 'src/coffee'})
    .pipe(plugins.plumber())
    .pipe(plugins.coffee(pluginOpts.coffee))
    .pipe(isTest ? testFilter: plugins.gUtil.noop())
    .pipe(isTest ? gulp.dest(destinations.test): plugins.gUtil.noop())
    .pipe(isTest ? testFilter.restore(): plugins.gUtil.noop())
    .pipe(noTestFilter)
    .pipe(isMapped ? gulp.dest(destinations.js): plugins.gUtil.noop())
    .pipe(isMapped ? plugins.sourcemaps.init(): plugins.gUtil.noop())
    .pipe(plugins.order(pluginOpts.order))
    .pipe(plugins.concat(gConfig.pkg.name + '.js'))
    .pipe(plugins.wrap(pluginOpts.wrap))
    .pipe(isStat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
    .pipe(isDeploy ? plugins.gUtil.noop(): gulp.dest(isDist ? destinations.dist: destinations.js))
    .pipe(isMapped ? plugins.sourcemaps.write('./'): plugins.gUtil.noop())
    .pipe(plugins.uglify())
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(isStat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
    .pipe(gulp.dest(isDist ? destinations.dist: destinations.js));
});
gulp.task('coffee:watch', function() {
  gulp.watch(sources.coffee, ['coffee:compile']);
});


gulp.task('less:compile', function() {
  return gulp.src(sources.less)
    .pipe(plugins.plumber())
    .pipe(plugins.less())
    .pipe(plugins.concat(gConfig.pkg.name + '.css'))
    .pipe(gulp.dest(destinations.css))
    .pipe(plugins.minify())
    .pipe(plugins.rename(pluginOpts.rename))
    .pipe(gulp.dest(destinations.css));
});
gulp.task('less:watch', function() {
  gulp.watch(sources.less, ['less:compile']);
});


gulp.task('jade:compile', function(){
  return gulp.src(sources.jade)
    .pipe(plugins.plumber())
    .pipe(plugins.jade(pluginOpts.jade))
    .pipe(gulp.dest(destinations.html));
});
gulp.task('jade:watch', function() {
  gulp.watch([
    sources.jade,
    'src/jade/layout/**/*.jade'
  ], ['jade:compile']);
});
gulp.task('tmpl:compile', function(){
  return gulp.src(sources.templates)
    .pipe(plugins.plumber())
    .pipe(plugins.jade(pluginOpts.jade))
    .pipe(gulp.dest(destinations.templates));
});
gulp.task('tmpl:watch', function() {
  gulp.watch(sources.templates, ['tmpl:compile']);
});


gulp.task('images:publish', function() {
  return gulp.src(sources.images)
    .pipe(plugins.plumber())
    .pipe(gulp.dest(destinations.images));
});

gulp.task('vendor:fonts:publish', function() {
  return gulp.src(sources.vendor.fonts)
    .pipe(plugins.plumber())
    .pipe(gulp.dest(destinations.fonts));
});
gulp.task('vendor:styles:publish', function() {
  return gulp.src(sources.vendor.css)
    .pipe(plugins.plumber())
    .pipe(plugins.concat('vendor.css'))
    .pipe(gulp.dest(destinations.css))
    .pipe(plugins.minify())
    .pipe(plugins.rename(pluginOpts.rename))
    .pipe(gulp.dest(destinations.css));
});
gulp.task('vendor:scripts:publish', function() {
  return gulp.src(sources.vendor.js)
    .pipe(plugins.plumber())
    .pipe(plugins.concat('vendor.js'))
    .pipe(gulp.dest(destinations.js))
    .pipe(plugins.uglify())
    .pipe(plugins.rename(pluginOpts.rename))
    .pipe(gulp.dest(destinations.js));
});
gulp.task('vendor:publish', [
  'vendor:scripts:publish',
  'vendor:styles:publish',
  'vendor:fonts:publish'
]);

gulp.task('deploy', ['build:complete'], function () {
  return gulp.src(sources.overwatch)
    .pipe(plugins.deploy());
});

gulp.task('build:complete', [
  'jade:compile',
  'tmpl:compile',
  'coffee:compile',
  'vendor:publish',
  'images:publish',
  'less:compile'
]);
gulp.task('watch', [
  'jade:watch',
  'tmpl:watch',
  'coffee:watch',
  'less:watch'
]);
gulp.task('default', [
  'serve',
  'watch'
]);
