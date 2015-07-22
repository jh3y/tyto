EditView = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.edit
  templateHelpers: ->
    board  : this.options.board
    columns: this.options.columns
    isNew  : this.options.isNew
  initialize: ->
    yap this.model
    Tyto.RootView.el.classList.add 'bg--red'
    Tyto.RootView.el.classList.remove 'is--showing-boom'
  onBeforeDestroy: ->
    Tyto.RootView.el.classList.remove 'bg--red'
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
