Column = require './column'

module.exports = Backbone.Marionette.CompositeView.extend
  tagName           : 'div'
  className         : 'board'
  template          : Tyto.templateStore.board
  templateHelpers   : ->
    columns: this.collection
    boards : Tyto.boardList.length
  childView         : Column
  childViewContainer: '.columns'
  childViewOptions: (c) ->
    colTasks = Tyto.taskList.where
      columnId: c.id
    boardView = this
    collection : new Tyto.Tasks.TaskList colTasks
    board      : boardView.model
  ui:
    addColumn  : '#add-column'
    deleteBoard: '#delete-board'
    wipeBoard  : '#wipe-board'
    boardName  : '#board-name'
    superAdd   : '#super-add'

  collectionEvents:
    'all': 'handleEvent'

  handleEvent: (e) ->
    view = this
    if e is 'add' or e is 'destroy'
      if e is 'destroy'
        list = Array.prototype.slice.call view.$el.find '.column'
        Tyto.Utils.reorder view, list, 'data-col-id'
      view.render()

  events:
    'click @ui.addColumn'  : 'addColumn'
    'click @ui.deleteBoard': 'deleteBoard'
    'click @ui.wipeBoard'  : 'wipeBoard'
    'blur @ui.boardName'   : 'updateName'
    'click @ui.superAdd'   : 'superAddTask'

  initialize: ->
    board = this

  onBeforeRender: ->
    # This ensures that even after moving a column that when we add
    # something new that the ordinal property of each column is respected.
    this.collection.models = this.collection.sortBy 'ordinal'

  onRender: ->
    newWidth = (100 / this.collection.length) + '%'

    this.$el.find('.column').css
      width: newWidth

    this.bindColumns()


  bindColumns: ->
    self        = this
    this.$el.find('.columns').sortable
      connectWith: '.column',
      handle     : '.column--mover'
      placeholder: 'column-placeholder'
      axis       : "x"
      containment: this.$el.find('.columns')
      opacity    : 0.8
      stop       : (event, ui) ->
        list        = Array.prototype.slice.call self.$el.find '.column'
        Tyto.Utils.reorder self, list, 'data-col-id'



  addColumn: ->
    board   = this.model
    columns = this.collection

    columns.add Tyto.columnList.create
      boardId: board.id
      ordinal: columns.length + 1

  updateName: ->
    this.model.save
      title: this.ui.boardName.text().trim()

  superAddTask: ->
    ###
      Need to intercept on the edit page if we use history back.
    ###

    board   = this.model

    newTask = Tyto.taskList.create
      boardId: board.id

    Tyto.navigate '#board/' + board.id + '/task/' + newTask.id, true

  deleteBoard: ->
    view = this
    view.wipeBoard()
    view.model.destroy()
    view.destroy()
    Tyto.navigate '/',
      trigger: true

  wipeBoard: ->
    view = this
    if confirm 'are you sure???'
      view.children.forEach (colView) ->
        while colView.collection.length isnt 0
          colView.collection.first().destroy()
        colView.model.destroy()
    return
