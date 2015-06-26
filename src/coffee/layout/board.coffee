Column = require './column'

module.exports = Backbone.Marionette.CompositeView.extend
  tagName           : 'div'
  className         : 'board'
  template          : Tyto.templateStore.board
  templateHelpers   : ->
    undoables: Tyto.undoables
  childView         : Column
  childViewContainer: '.columns'
  childViewOptions: ->
    boardView  : this
    board      : this.model
    siblings   : this.collection
  ui:
    addColumn  : '#add-column'
    saveBoard  : '#save-board'
    deleteBoard: '#delete-board'
    wipeBoard  : '#wipe-board'
    boardName  : '#board-name'
    superAdd   : '#super-add'
    undoBtn    : '#undo'

  events:
    'click @ui.addColumn'  : 'addColumn'
    'click @ui.saveBoard'  : 'saveBoard'
    'click @ui.deleteBoard': 'deleteBoard'
    'click @ui.wipeBoard'  : 'wipeBoard'
    'blur @ui.boardName'   : 'updateName'
    'click @ui.superAdd'   : 'superAddTask'
    'click @ui.undoBtn'    : 'undoLastAction'

  undoLastAction: ->
    Tyto.undo()

  initialize: ->
    board            = this
    cols             = _.sortBy board.model.get('columns'), 'ordinal'
    board.collection = new Tyto.Columns.ColumnList cols

    this.listenTo Tyto.vent, 'setup:localStorage', ->
      this.ui.saveBoard.removeAttr 'disabled'

    board.collection.on 'remove', (mod, col) ->
      newWidth = (100 / board.collection.length) + '%'
      $('.column').css
        width: newWidth
      Tyto.registerAction
        action    : 'REMOVE-COLUMN'
        model     : mod
        collection: col

    board.collection.on 'add', (mod, col) ->
      newWidth = (100 / board.collection.length) + '%'
      $('.column').css
        width: newWidth
      Tyto.registerAction
        action    : 'ADD-COLUMN'
        id        : mod.id
        collection: col

    board.on 'childview:destroy:column', (mod, id) ->
      board.collection.remove id
      return

    # This is needed to ensure that our undo button displays correctly
    # Tyto.undoables.on 'all', this.render

  onBeforeRender: ->
    # This ensures that even after moving a column that when we add
    # something new that the ordinal property of each column is respected.
    this.collection.models = this.collection.sortBy 'ordinal'

  onRender: ->
    if window.localStorage and !window.localStorage.tyto
      this.ui.saveBoard.attr 'disabled', true
    this.bindColumns()


  bindColumns: ->
    self        = this
    mover       = `undefined`
    columnModel = `undefined`
    columnList  = `undefined`
    startPos    = `undefined`
    this.$el.find('.columns').sortable
      connectWith: '.column',
      handle     : '.column--mover'
      placeholder: 'column-placeholder'
      axis       : "x"
      containment: this.$el.find('.columns')
      opacity    : 0.8
      start      : (event, ui) ->
        mover       = ui.item[0]
        columnModel = self.collection.get ui.item.attr('data-col-id')
        startPos    = columnModel.get 'ordinal'
      stop       : (event, ui) ->
        # Grab the columm list inside the stop event so that the correct order
        # is picked up.
        columnList  = Array.prototype.slice.call self.$el.find '.column'
        Tyto.reorder self, mover, columnModel, columnList
        # On a column move we want to put back in the right place and render.
        # Either reset all ordinals by looping through the collection with columnList or some other way.
        Tyto.registerAction
          action  : 'MOVE-COLUMN'
          startPos: startPos
          model   : columnModel

  addColumn: ->
    newCol = new Tyto.Columns.Column
      id     : _.uniqueId()
      ordinal: this.collection.length + 1
    this.collection.add newCol

  saveBoard: ->
    this.model.set 'columns', this.collection
    this.model.save()

  updateName: ->
    this.model.set 'title', @ui.boardName.text().trim()

  superAddTask: ->
    yap 'lets create'
    newTask = new Tyto.Tasks.Task
      id     : _.uniqueId()
      ordinal: this.collection.length + 1
    Tyto.vent.trigger 'hard-task:add', newTask

  deleteBoard: ->
    this.model.destroy()
    this.destroy()
    Tyto.navigate '/',
      trigger: true

  wipeBoard: ->
    this.collection.reset()
    return
