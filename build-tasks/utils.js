var getEnv = function() {
  var gutil = require('gulp-util'),
    activeEnvs = {},
    envs = [
      'dist',
      'dev',
      'deploy',
      'mapped',
      'stat'
    ];
  for (var i = 0; i < envs.length; i++) {
    activeEnvs[envs[i]] = (gutil.env[envs[i]]) ? true: false;
  }
  return activeEnvs;
};
module.exports = {
  getEnv: getEnv
};
