appConfig = Marionette.Application.extend
  navigate: (route, opts) ->
    Backbone.history.navigate route, opts
  setRootLayout: ->
    this.root = new Tyto.Layout.Root()

module.exports = appConfig
