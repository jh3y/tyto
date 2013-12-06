require.config({
  paths: {
    jquery: 'libs/jquery/jquery-min',
    handlebars: 'libs/handlebars/handlebars',
    config: 'config',
    tyto: 'tyto',
    draggable: 'libs/jh3y/draggable',
    tab: 'libs/jh3y/tab',
    templates: '../templates',
    text: 'libs/require/text'
  }
});

require(['app'], function(app) {
  return app.initialize();
});
