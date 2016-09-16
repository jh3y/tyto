const CookieView = Backbone.Marionette.ItemView.extend({
  template: function(args) {
    return Tyto.TemplateStore.cookieBanner(args);
  },
  ui: {
    closeBtn: '.tyto-cookies__accept'
  },
  events: {
    'click @ui.closeBtn': 'closeBanner'
  },
  closeBanner: function() {
    window.localStorage.setItem('tyto', true);
    Tyto.RootView.removeRegion('Cookie');
    this.destroy();
  }
});
export default CookieView;
