Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.CookieBanner = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.cookieBanner
    ui:
      accept: '#accept-cookies'
    events:
      'click @ui.accept': 'acceptCookies'
    acceptCookies: ->
      Tyto.vent.trigger 'setup:localStorage'
