appConfig = Marionette.Application.extend
  navigate: (route, opts) ->
    Backbone.history.navigate route, opts
  setRootLayout: ->
    Tyto.RootView = new Tyto.Views.Root()
  NAVIGATION_DURATION: 500
  TASK_COLORS        : [
    'yellow',
    'red',
    'blue',
    'navy',
    'green',
    'purple',
    'orange',
    'pink'
  ]
  ANIMATION_EVENT    : 'animationend webkitAnimationEnd oAnimationEnd'
  INTRO_JSON_SRC     : 'js/intro.json'
  LOADING_CLASS      : 'is--loading'

module.exports = appConfig
