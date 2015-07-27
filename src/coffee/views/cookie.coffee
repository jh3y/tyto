module.exports = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.cookieBanner
  ui:
    closeBtn: '.tyto-cookies__accept'
  events:
    'click @ui.closeBtn': 'closeBanner'
  closeBanner: ->
    window.localStorage.setItem 'tyto', true
    this.destroy()
