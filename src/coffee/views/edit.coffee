EditView = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.edit
  templateHelpers: ->
    board  : this.options.board
    columns: this.options.columns
    isNew  : this.options.isNew
  initialize: ->
    yap this.model
    Tyto.RootView.$el.addClass 'bg--yellow'
  ui:
    cancel: '.tyto-edit__cancel'
  events:
    'click @ui.cancel': 'destroyAndReturn'
  onBeforeDestroy: ->
    Tyto.RootView.$el.removeClass 'bg--yellow'
  destroyAndReturn: ->
    view = this
    yap 'going back'
    view.model.destroy()
    Tyto.navigate '#board/' + view.options.board.id, true

module.exports = EditView
