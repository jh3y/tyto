require.config({
  paths: {
    jquery: 'http://code.jquery.com/jquery-2.1.0.min',
    handlebars: 'libs/handlebars/handlebars',
    config: 'config',
    tyto: 'tyto',
    tab: 'libs/jh3y/tab',
    templates: '../templates',
    themes: '../css/themes',
    text: 'libs/require/text'
  }
});

require(['app'], function(app) {
  return app.initialize();
});
