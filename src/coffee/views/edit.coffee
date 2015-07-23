EditView = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.edit
  templateHelpers: ->
    board  : this.options.board
    columns: this.options.columns
    isNew  : this.options.isNew
    colors : Tyto.TASK_COLORS
  initialize: ->
    view = this
    Tyto.RootView.el.classList.add 'bg--' + view.model.get('color')
    Tyto.RootView.el.classList.remove 'is--showing-boom'
  ui:
    cancel: '.tyto-edit__cancel'
    save  : '.tyto-edit__save'
    color : '.tyto-edit__color'
  events:
    'click @ui.cancel': 'destroyAndReturn'
    'click @ui.save'  : 'saveTask'
    'change @ui.color': 'changeColor'
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
  changeColor: ->
    view = this
    newColor = view.ui.color.val()
    if newColor isnt 'default'
      Tyto.RootView.el.classList.remove 'bg--' + view.model.get('color')
      Tyto.RootView.el.classList.add    'bg--' + newColor
      view.model.set 'color', newColor
  onBeforeDestroy: ->
    view = this
    Tyto.RootView.$el.removeClass 'bg--' + view.model.get('color')
    view.model.save()
  destroyAndReturn: ->
    view = this
    view.model.destroy()
    Tyto.navigate '#board/' + view.options.board.id, true

module.exports = EditView
