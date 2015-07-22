EditView = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.edit
  templateHelpers: ->
    board  : this.options.board
    columns: this.options.columns
    isNew  : this.options.isNew
  initialize: ->
    Tyto.RootView.el.classList.add 'bg--yellow'
    Tyto.RootView.el.classList.remove 'is--showing-boom'
  ui:
    cancel: '.tyto-edit__cancel'
    save  : '.tyto-edit__save'
  events:
    'click @ui.cancel': 'destroyAndReturn'
    'click @ui.save'  : 'saveTask'
  saveTask: ->
    view = this
    # TODO:: Needs to add column selection UI
    if view.options.isNew
      if view.options.columns.length is 0
        # Need to create a generic column on the board for the task to be added.
        newCol = Tyto.Columns.create
          boardId: view.options.board.id
          ordinal: 1
      delete view.model.attributes.id
      view.model.set 'ordinal' , 1
      view.model.set 'columnId', newCol.id
      Tyto.Tasks.create view.model.attributes
    Tyto.navigate '/board/' + view.options.board.id, true
  onBeforeDestroy: ->
    Tyto.RootView.$el.removeClass 'bg--yellow'
  destroyAndReturn: ->
    view = this
    yap 'going back'
    view.model.destroy()
    Tyto.navigate '#board/' + view.options.board.id, true

module.exports = EditView
