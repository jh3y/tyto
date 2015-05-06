Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Edit = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.edit
    templateHelpers: ->
      boardId: this.options.boardId
      isNew: this.options.isNew
    initialize: ->
      yap this.model
