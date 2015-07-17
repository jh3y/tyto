RootLayout = Backbone.Marionette.LayoutView.extend
  el: '#tyto-app',
  regions:
    Menu   : '#tyto-menu'
    Content: '#tyto-content'

module.exports = RootLayout
