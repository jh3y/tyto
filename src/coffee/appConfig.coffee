appConfig = Marionette.Application.extend
  navigate: (route, opts) ->
    Backbone.history.navigate route, opts
  setRootLayout: ->
    Tyto.RootView = new Tyto.Views.Root()

module.exports = appConfig
