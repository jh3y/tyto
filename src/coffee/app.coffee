TytoApp = Marionette.Application.extend
  navigate: (route, opts) ->
    Backbone.history.navigate route, opts
  setRootLayout: ->
    this.root = new Tyto.Layout.Root()

window.Tyto = new TytoApp()


Tyto.on 'before:start', ->
  Tyto.setRootLayout()
