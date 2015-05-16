var gulp       = require('gulp'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
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



gulp.task('coffee:compile', ['tmpl:compile'], function () {

  var b = browserify({
    entries: './src/coffee/app.coffee',
    transform: 'coffeeify',
    extensions: '.coffee',
    debug: isMapped ? true: false
  });

  return b.bundle()
    .pipe(plugins.plumber())
    .pipe(source(gConfig.pkg.name + '.js'))
    .pipe(buffer())
    .pipe(isMapped ? plugins.sourcemaps.init({loadMaps: true}): plugins.gUtil.noop())
    .pipe(plugins.wrap(pluginOpts.wrap))
    .pipe(isStat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
    .pipe(gulp.dest(destinations.js))
    .pipe(plugins.uglify())
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(isMapped ? plugins.sourcemaps.write('./'): plugins.gUtil.noop())
    .pipe(isStat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
    .pipe(gulp.dest(isDist ? destinations.dist: destinations.js));
    // DO SOME OTHER MAGIC HERE TO MAKE IT PRODUCTION READY BLAH BLAH...
});

// gulp.task('coffee:compile', ['tmpl:compile'], function() {
//   var testFilter = plugins.filter('test/**/*.coffee'),
//     coffeeFilter = plugins.filter('**/*.coffee'),
//     noTestFilter = plugins.filter([
//       '**/*.js',
//       '!test/**/*.js'
//     ]);
//   return gulp.src(sources.coffee.concat([destinations.templates + '**/*.*']), {base: 'src/coffee'})
//     .pipe(plugins.plumber())
//     .pipe(coffeeFilter)
//     .pipe(plugins.coffee(pluginOpts.coffee))
//     .pipe(isTest ? testFilter: plugins.gUtil.noop())
//     .pipe(isTest ? gulp.dest(destinations.test): plugins.gUtil.noop())
//     .pipe(isTest ? testFilter.restore(): plugins.gUtil.noop())
//     .pipe(coffeeFilter.restore())
//     .pipe(noTestFilter)
//     .pipe(isMapped ? gulp.dest(destinations.js): plugins.gUtil.noop())
//     .pipe(plugins.order(pluginOpts.order.js))
//     .pipe(plugins.concat(gConfig.pkg.name + '.js'))
//     .pipe(isDeploy ? plugins.gUtil.noop(): gulp.dest(isDist ? destinations.dist: destinations.js))
// });
gulp.task('coffee:watch', function() {
  gulp.watch(sources.coffee, ['coffee:compile']);
});


gulp.task('stylus:compile', function() {
  return gulp.src(sources.stylus, {base: 'src/stylus'})
    .pipe(plugins.plumber())
    .pipe(plugins.order(pluginOpts.order.stylus))
    .pipe(plugins.concat(gConfig.pkg.name + '.stylus'))
    .pipe(plugins.stylus())
    .pipe(gulp.dest(destinations.css))
    .pipe(plugins.minify())
    .pipe(plugins.rename(pluginOpts.rename))
    .pipe(gulp.dest(destinations.css));
});
gulp.task('stylus:watch', function() {
  gulp.watch(sources.stylus, ['stylus:compile']);
});


gulp.task('jade:compile', function(){
  return gulp.src(sources.docs)
    .pipe(plugins.plumber())
    .pipe(plugins.jade(pluginOpts.jade))
    .pipe(gulp.dest(destinations.html));
});
gulp.task('jade:watch', function() {
  gulp.watch(sources.jade, ['jade:compile']);
});

gulp.task('tmpl:compile', function(){
  return gulp.src(sources.templates)
    .pipe(plugins.plumber())
    .pipe(plugins.jade(pluginOpts.jade))
    .pipe(plugins.template({
      name: 'templates.js',
      base: 'src/jade/templates/',
      variable: 'module.exports'
    }))
    .pipe(gulp.dest(destinations.templates));
});
gulp.task('tmpl:watch', function() {
  gulp.watch(sources.templates, ['coffee:compile']);
});



gulp.task('vendor:scripts:publish', function() {
  var yapFilter = plugins.filter([
    '**/*.js',
    '!**/yap.min.js'
  ]);
  return gulp.src(sources.vendor.js)
    .pipe(plugins.plumber())
    .pipe(isDist ? yapFilter: plugins.gUtil.noop())
    .pipe(plugins.concat('vendor.js'))
    .pipe(gulp.dest(destinations.js))
    .pipe(plugins.uglify())
    .pipe(plugins.rename(pluginOpts.rename))
    .pipe(gulp.dest(destinations.js));
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


gulp.task('vendor:publish', [
  'vendor:scripts:publish',
  'vendor:styles:publish',
  'vendor:fonts:publish'
]);

gulp.task('build:complete', [
  'jade:compile',
  'tmpl:compile',
  'coffee:compile',
  'vendor:publish',
  'stylus:compile'
]);
gulp.task('watch', [
  'jade:watch',
  'tmpl:watch',
  'coffee:watch',
  'stylus:watch'
]);
gulp.task('default', [
  'serve',
  'watch'
]);
