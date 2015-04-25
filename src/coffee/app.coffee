TytoApp = Marionette.Application.extend
  initialize: (opts) ->
    console.log 'Hey! you are making an application.'
  navigate: (route, opts) ->
    Backbone.history.navigate route, opts
  setRootLayout: ->
    console.log 'Setting Root Layout now'
    this.root = new Tyto.Layout.Root()

window.Tyto = new TytoApp()


Tyto.on 'before:start', ->
  Tyto.setRootLayout()
