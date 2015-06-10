Column = require './column'

module.exports = Backbone.Marionette.CompositeView.extend
  tagName           : 'div'
  className         : 'board'
  template          : Tyto.templateStore.board
  childView         : Column
  childViewContainer: '.columns'
  childViewOptions: ->
    board      : this.model
    siblings   : this.collection
  ui:
    addColumn  : '#add-column'
    saveBoard  : '#save-board'
    deleteBoard: '#delete-board'
    wipeBoard  : '#wipe-board'
    boardName  : '#board-name'
    superAdd   : '#super-add'
  events:
    'click @ui.addColumn'  : 'addColumn'
    'click @ui.saveBoard'  : 'saveBoard'
    'click @ui.deleteBoard': 'deleteBoard'
    'click @ui.wipeBoard'  : 'wipeBoard'
    'blur @ui.boardName'   : 'updateName'
    'click @ui.superAdd'   : 'superAddTask'

  initialize: ->
    board     = this
    cols      = _.sortBy board.model.get('columns'), 'ordinal'
    Tyto.cols = board.collection = new Tyto.Columns.ColumnList cols

    this.listenTo Tyto.vent, 'setup:localStorage', ->
      this.ui.saveBoard.removeAttr 'disabled'

    board.on 'childview:destroy:column', (mod, id) ->
      board.collection.remove id
      newWidth = (100 / board.collection.length) + '%'
      $('.column').css
        width: newWidth
      return

  onRender: ->
    if window.localStorage and !window.localStorage.tyto
      this.ui.saveBoard.attr 'disabled', true
    this.bindColumns()

  bindColumns: ->
    self = this
    this.$el.find('.columns').sortable
      connectWith: '.column',
      handle     : '.column--mover'
      placeholder: 'column-placeholder'
      axis       : "x"
      containment: this.$el.find('.columns')
      opacity    : 0.8
      stop       : (event, ui) ->
        mover       = ui.item[0]
        columnModel = self.collection.get ui.item.attr('data-col-id')
        columnList  = Array.prototype.slice.call self.$el.find '.column'
        Tyto.reorder self, mover, columnModel, columnList

  addColumn: ->
    newCol = new Tyto.Columns.Column
      id     : _.uniqueId()
      ordinal: this.collection.length + 1
    this.collection.add newCol
    newWidth = (100 / this.collection.length) + '%'
    $('.column').css
      width: newWidth

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
