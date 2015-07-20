module.exports = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.cookieBanner
  ui:
    closeBtn: '.tyto-cookies__accept'
  events:
    'click @ui.closeBtn': 'closeBanner'
  initialize: ->
    ###
      As we are stating that cookies will be used upon use.
      We can simply set a localStorage reference upon view initialization.
    ###
    window.localStorage.setItem 'tyto', true
  closeBanner: ->
    this.destroy()
