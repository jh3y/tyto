App = Marionette.Application.extend
  ###TODO
    Here is where you are passing in your options and this could be a brilliant
    place to pass in the tyto config realistically.
  ###
  initialize: (opts) ->
    console.log 'Hey! you are making an application.'
  setRootLayout: ->
    this.root = new Tyto.Layout.Root()

window.Tyto = new App()

Tyto.on 'start', ->
  Tyto.setRootLayout()
  Backbone.history.start()
