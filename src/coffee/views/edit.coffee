module.exports = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.edit
  templateHelpers: ->
    boardId: this.options.boardId
    isNew  : this.options.isNew
  initialize: ->
    yap this.model
