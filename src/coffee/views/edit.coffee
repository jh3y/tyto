EditView = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.edit
  templateHelpers: ->
    board  : this.options.board
    columns: this.options.columns
    isNew  : this.options.isNew
  initialize: ->
    yap this.model

module.exports = EditView
