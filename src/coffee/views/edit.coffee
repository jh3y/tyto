EditView = Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.edit

  className: ->
    this.domAttributes.VIEW_CLASS

  templateHelpers: ->
    view = this
    selectedColumn: _.findWhere view.options.columns,
      id: view.model.get 'columnId'
    board         : this.options.board
    columns       : _.sortBy this.options.columns, 'attributes.title'
    isNew         : this.options.isNew
    colors        : Tyto.TASK_COLORS

  initialize: ->
    view = this
    Tyto.RootView.el.classList.add 'bg--' + view.model.get('color')
    Tyto.RootView.el.classList.remove 'is--showing-boom'

  domAttributes:
    VIEW_CLASS: 'tyto-edit'

  ui:
    save           : '.tyto-edit__save'
    color          : '.tyto-edit__color-select-menu-option'
    taskDescription: '.tyto-edit__description'
    taskTitle      : '.tyto-edit__title'
    column         : '.tyto-edit__column-select-menu-option'
    colorMenu      : '.tyto-edit__color-select-menu'
    columnMenu     : '.tyto-edit__column-select-menu'
    columnLabel    : '.tyto-edit__task-column'

  events:
    'click @ui.save'          : 'saveTask'
    'click @ui.color'         : 'changeColor'
    'click @ui.column'        : 'changeColumn'
    'blur @ui.taskDescription': 'updateTask'
    'blur @ui.taskDescription': 'updateTask'


  getMDLMap: ->
    view = this
    [
      el       : view.ui.columnMenu[0]
      component: 'MaterialMenu'
    ,
      el       : view.ui.colorMenu[0]
      component: 'MaterialMenu'
    ]

  onShow: ->
    Tyto.Utils.upgradeMDL this.getMDLMap()

  ###
    This is a function for handling fresh tasks and saving them on 'DONE'
  ###
  saveTask: ->
    view = this
    save = ->
      delete view.model.attributes.id
      Tyto.Tasks.create view.model.attributes
      Tyto.navigate '/board/' + view.options.board.id, true

    # IN A COUPLE OF THESE SCENARIOS NEED TO WORK OUT THE ORDINAL.
    if view.options.columns.length isnt 0 and !view.selectedColumnId
      # A column must've been selected for our task.
      alert 'whoah, you need to select a column for that new task'
    else if view.options.columns.length isnt 0 and view.selectedColumnId
      save()
    else if view.options.columns.length is 0
      # Need to create a generic column on the board for the task to be added.
      newCol = Tyto.Columns.create
        boardId: view.options.board.id
        ordinal: 1
      view.model.set 'columnId', newCol.id
      view.model.set 'ordinal' , 1
      save()

  changeColumn: (e) ->
    view = this
    newColumnId = e.target.getAttribute 'data-column-id'
    if newColumnId isnt view.model.get('columnId')
      newOrdinal  = Tyto.Tasks.where({columnId: newColumnId}).length + 1
      view.ui.columnLabel.text e.target.textContent
      view.selectedColumnId = newColumnId
      view.model.set 'columnId', newColumnId
      view.model.set 'ordinal' , newOrdinal

  changeColor: (e) ->
    view = this
    newColor = e.target.getAttribute 'data-color'
    Tyto.RootView.el.classList.add 'is--showing-edit-view'
    if newColor isnt 'default'
      Tyto.RootView.el.classList.remove 'bg--' + view.model.get('color')
      Tyto.RootView.el.classList.add    'bg--' + newColor
      view.model.set 'color', newColor

  onBeforeDestroy: ->
    view = this
    Tyto.RootView.$el.removeClass 'bg--' + view.model.get('color')
    Tyto.RootView.$el.removeClass 'is--showing-edit-view'
    if !view.options.isNew
      view.model.save()

module.exports = EditView
