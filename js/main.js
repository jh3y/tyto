require.config({
  paths: {
    jquery: 'http://code.jquery.com/jquery-2.1.0.min',
    jqueryUI: "//code.jquery.com/ui/1.10.4/jquery-ui",
    jqueryUItouchpunch: "//cdn.jsdelivr.net/jquery.ui.touch-punch/0.2.2/jquery.ui.touch-punch.min",
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
