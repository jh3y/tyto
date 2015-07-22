EditView = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.edit
  templateHelpers: ->
    board  : this.options.board
    columns: this.options.columns
    isNew  : this.options.isNew
  initialize: ->
    yap this.model
  ui:
    cancel: '.tyto-edit__cancel'
  events:
    'click @ui.cancel': 'destroyAndReturn'
  destroyAndReturn: ->
    view = this
    yap 'going back'
    view.model.destroy()
    Tyto.navigate '#board/' + view.options.board.id, true

module.exports = EditView
