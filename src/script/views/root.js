const RootLayout = Backbone.Marionette.LayoutView.extend({
  el     : '#tyto-app',
  regions: {
    Menu   : '#tyto-menu',
    Content: '#tyto-content'
  }
});

export default RootLayout;
