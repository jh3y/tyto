module.exports = Backbone.Marionette.ItemView.extend
  template: Tyto.templateStore.cookieBanner
  ui:
    accept: '#accept-cookies'
  events:
    'click @ui.accept': 'acceptCookies'
  acceptCookies: ->
    Tyto.vent.trigger 'setup:localStorage'
