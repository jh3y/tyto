var gulp = require('gulp'),
  script = require('./build-tasks/script'),
  style  = require('./build-tasks/style'),
  markup = require('./build-tasks/markup'),
  tmpl   = require('./build-tasks/tmpl'),
  deploy = require('./build-tasks/deploy'),
  server = require('./build-tasks/serve'),
  assets = require('./build-tasks/assets');

gulp.task('serve', ['build:complete'], server.start);

gulp.task('script:compile', ['tmpl:compile'], script.compile);
gulp.task('script:watch', script.watch);

gulp.task('style:compile', style.compile);
gulp.task('style:watch', style.watch);

gulp.task('markup:compile', markup.compile);
gulp.task('markup:watch', markup.watch);

gulp.task('tmpl:compile', tmpl.compile);
gulp.task('tmpl:watch', tmpl.watch);

gulp.task('vendor:scripts:publish', assets.scripts);
gulp.task('vendor:fonts:publish', assets.fonts);
gulp.task('vendor:styles:publish', assets.styles);
gulp.task('img:publish', assets.img);
gulp.task('json:publish', assets.json);


gulp.task('vendor:publish', [
  'vendor:scripts:publish',
  'vendor:styles:publish',
  'vendor:fonts:publish',
  'img:publish',
  'json:publish'
]);

gulp.task('deploy', ['build:complete'], deploy.deploy);

gulp.task('build:complete', [
  'markup:compile',
  'tmpl:compile',
  'script:compile',
  'vendor:publish',
  'style:compile'
]);
gulp.task('watch', [
  'markup:watch',
  'tmpl:watch',
  'script:watch',
  'style:watch'
]);
gulp.task('default', [
  'serve',
  'watch'
]);
