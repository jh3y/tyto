Column = require './column'

module.exports = Backbone.Marionette.CompositeView.extend
  tagName           : 'div'
  className         : 'tyto-board'
  template          : Tyto.TemplateStore.board

  templateHelpers   : ->
    # Required in order to supply drop down select next to board name.
    boards : Tyto.Boards

  childView         : Column
  childViewContainer: ->
    this.domAttributes.CHILD_VIEW_CONTAINER_CLASS
  childViewOptions: (c) ->
    view = this
    colTasks  = Tyto.ActiveTasks.where
      columnId: c.id

    collection : new Tyto.Models.TaskCollection colTasks
    board      : view.model

  ui:
    addEntity      : '.tyto-board__add-entity'
    primaryActions : '.tyto-board__actions'
    boardMenu      : '.tyto-board__menu'
    boardSelect    : '.tyto-board__selector'
    addColumn      : '.tyto-board__add-column'
    addTask        : '.tyto-board__super-add'
    deleteBoard    : '.tyto-board__delete-board'
    wipeBoard      : '.tyto-board__wipe-board'
    boardName      : '.tyto-board__name'
    columnContainer: '.tyto-board__columns'

  collectionEvents:
    'destroy'   : 'handleColumnRemoval'

  domAttributes:
    CHILD_VIEW_CONTAINER_CLASS: '.tyto-board__columns'
    COLUMN_CLASS              : '.tyto-column'
    COLUMN_ATTR               : 'data-col-id'
    COLUMN_MOVER_CLASS        : '.tyto-column__mover'
    COLUMN_PLACEHOLDER_CLASS  : 'tyto-column__placeholder'
    FAB_MENU_VISIBLE_CLASS    : 'is-showing-options'
    ADDING_COLUMN_CLASS       : 'is--adding-column'

  getMDLMap: ->
    view = this
    [
      el       : view.ui.boardMenu[0]
      component: 'MaterialMenu'
    ,
      el       : view.ui.boardSelect[0]
      component: 'MaterialMenu'
    ]

  handleColumnRemoval: ->
    view = this
    list = view.$el.find view.domAttributes.COLUMN_CLASS
    Tyto.Utils.reorder view, list, view.domAttributes.COLUMN_ATTR

  events:
    'click @ui.addEntity'  : 'showPrimaryActions'
    'click @ui.addColumn'  : 'addNewColumn'
    'click @ui.addTask'    : 'addNewTask'
    'click @ui.deleteBoard': 'deleteBoard'
    'click @ui.wipeBoard'  : 'wipeBoard'
    'blur @ui.boardName'   : 'saveBoardName'


  showPrimaryActions: (e) ->
    view  = this
    ctn   = view.ui.primaryActions[0]
    btn   = view.ui.addEntity[0]
    fabVisibleClass = view.domAttributes.FAB_MENU_VISIBLE_CLASS
    processClick = (evt) ->
      # Have to check on timeStamp because one event is a jQuery event.
      if e.timeStamp isnt evt.timeStamp
        ctn.classList.remove fabVisibleClass
        ctn.IS_SHOWING_MENU = false
        document.removeEventListener 'click', processClick
    if !ctn.IS_SHOWING_MENU
      ctn.IS_SHOWING_MENU = true
      ctn.classList.add fabVisibleClass
      document.addEventListener 'click', processClick

  onBeforeRender: ->
    # This ensures that even after moving a column that when we add
    # something new that the ordinal property of each column is respected.
    this.collection.models = this.collection.sortBy 'ordinal'

  onShow: ->
    ###
      Have to upgrade MDL components onShow.
    ###
    view   = this
    Tyto.Utils.upgradeMDL view.getMDLMap()

  onRender: ->
    ###
      As with manually upgrading MDL, need to invoke jQuery UI sortable
      function on render.
    ###
    this.bindColumns()

  bindColumns: ->
    view = this
    attr = view.domAttributes
    view.ui.columnContainer.sortable
      connectWith: attr.COLUMN_CLASS
      handle     : attr.COLUMN_MOVER_CLASS
      placeholder: attr.COLUMN_PLACEHOLDER_CLASS
      axis       : "x"
      containment: view.$childViewContainer
      stop       : (event, ui) ->
        list        = Array.prototype.slice.call view.$el.find attr.COLUMN_CLASS
        Tyto.Utils.reorder view, list, attr.COLUMN_ATTR

  addNewColumn: ->
    view    = this
    board   = view.model
    columns = view.collection
    view.$el.addClass view.domAttributes.ADDING_COLUMN_CLASS

    columns.add Tyto.Columns.create
      boardId: board.id
      ordinal: columns.length + 1

  saveBoardName: ->
    this.model.save
      title: this.ui.boardName.text().trim()

  addNewTask: ->
    board   = this.model
    newTask = Tyto.Tasks.create
      boardId: board.id
    Tyto.navigate '#board/' + board.id + '/task/' + newTask.id + '?isFresh=true', true

  deleteBoard: ->
    view = this
    if confirm 'are you sure???'
      view.wipeBoard()
      view.model.destroy()
      view.destroy()
      Tyto.navigate '/',
        trigger: true

  wipeBoard: (dontConfirm) ->
    view = this
    wipe = ->
      view.children.forEach (colView) ->
        while colView.collection.length isnt 0
          colView.collection.first().destroy()
        colView.model.destroy()
    if dontConfirm
      if confirm 'are you sure???'
        wipe()
    else
        wipe()
