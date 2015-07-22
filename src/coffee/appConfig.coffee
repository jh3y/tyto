appConfig = Marionette.Application.extend
  navigate: (route, opts) ->
    Backbone.history.navigate route, opts
  setRootLayout: ->
    Tyto.RootView = new Tyto.Views.Root()
  NAVIGATION_DURATION: 500
  ANIMATION_EVENT    : 'animationend webkitAnimationEnd oAnimationEnd'

module.exports = appConfig
