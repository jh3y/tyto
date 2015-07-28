TimeModal = Backbone.Marionette.ItemView.extend
  template : Tyto.TemplateStore.timeModal

  className: ->
    this.domAttributes.VIEW_CLASS

  domAttributes:
    VIEW_CLASS: 'tyto-time'

  ui:
    closeBtn: '.tyto-cookies__accept'

  events:
    'click @ui.closeBtn': 'closeBanner'

  closeBanner: ->
    Tyto.RootView.getRegion('TimeModal').el.remove()
    Tyto.RootView.removeRegion 'TimeModal'
    this.destroy()

module.exports = TimeModal
