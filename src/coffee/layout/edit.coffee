module.exports = Backbone.Marionette.ItemView.extend
  template: Tyto.templateStore.edit
  templateHelpers: ->
    boardId: this.options.boardId
    isNew  : this.options.isNew
  initialize: ->
    yap this.model
