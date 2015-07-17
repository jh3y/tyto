module.exports = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.cookieBanner
  ui:
    accept: '#accept-cookies'
  events:
    'click @ui.accept': 'acceptCookies'
  acceptCookies: ->
    Tyto.vent.trigger 'setup:localStorage'
