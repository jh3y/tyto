Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Root = Backbone.Marionette.LayoutView.extend
    el: '#tyto-app',
    regions:
      header: '#header'
      menu:   '#tyto-menu'
      content: '#tyto-content'
