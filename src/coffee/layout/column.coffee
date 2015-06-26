Task = require './task'

module.exports = Backbone.Marionette.CompositeView.extend
  tagName   : 'div'
  className : 'column'
  attributes: ->
    id = this.model.get 'id'
    'data-col-id': id
  template  : Tyto.templateStore.column
  childView : Task
  childViewContainer: '.tasks'
  events    :
    'click @ui.deleteColumn': 'deleteColumn'
    'click @ui.addTask'     : 'addTask'
    'blur @ui.columnName'   : 'updateName'
  ui        :
    deleteColumn: '#delete-column'
    addTask     : '.add-task'
    columnName  : '#column-name'

  childViewOptions: ->
    boardView: this.getOption 'boardView'
    board : this.getOption 'board'
    column: this

  initialize: ->
    columnView = this
    tasks           = _.sortBy this.model.get('tasks'), 'ordinal'
    this.collection = new Tyto.Tasks.TaskList tasks
    this.model.set 'tasks', this.collection

    this.model.on 'change:ordinal', (mod, newVal, opts) ->
      columnView.render()


    this.model.on 'change:title', (model, newVal, opts) ->
      yap opts
      if !opts.ignore
        Tyto.UndoHandler.register
          action  : 'RENAME-COLUMN'
          model   : model
          property: 'title'
          val     : columnView.oldTitle
      columnView.render()

    this.collection.on 'add', (mod, col, opts) ->
      if !opts.ignore
        Tyto.UndoHandler.register
          action    : 'ADD-TASK'
          id        : mod.id
          collection: col

    this.collection.on 'remove', (mod, col, opts) ->
      if !opts.ignore
        Tyto.UndoHandler.register
          action    : 'REMOVE-TASK'
          model     : mod
          collection: col


    this.on 'childview:destroy:task', (mod, id) ->
      this.collection.remove id

  onBeforeRender: ->
    this.collection.models = this.collection.sortBy 'ordinal'
    newWidth = (100 / this.options.siblings.length) + '%'
    this.$el.css
      width: newWidth

  onRender: ->
    self      = this
    mover     = `undefined`
    taskModel = `undefined`
    taskList  = `undefined`
    startPos  = `undefined`

    this.$el.find('.tasks').sortable
      connectWith: '.tasks'
      placeholder: "item-placeholder"
      containment: '.columns'
      opacity    : 0.8
      revert     : true
      start      : (event, ui) ->
        mover     = ui.item[0]
        taskModel = self.collection.get ui.item.attr('data-task-id')
        startPos  = taskModel.get 'ordinal'
      stop       : (event, ui) ->
        destinationView = self
        # This is long as there are different scenarios. If the destination is a different column then need to do some different stuff else just do as normal...
        newColId = $(mover).parents('[data-col-id]').attr 'data-col-id'
        Task = taskModel.clone()
        destination = self.getOption('siblings').get newColId
        destinationView = Tyto.boardView.children.findByModel destination
        taskList  = Array.prototype.slice.call destinationView.$el.find '.tyto--task'
        newPos    = taskList.indexOf(mover) + 1




        isNewHome = ->
          newColId isnt self.model.id
        # 1st. Let's find out if we have a new home.
        startCol = self.model
        if isNewHome()
          self.collection.remove taskModel
          destination.get('tasks').add Task,
            at: newPos
          console.log 'got a new homeeee'
        else
          console.log 'staying put thanks...'


        debugger
        Tyto.reorder destinationView, mover, taskModel, taskList, newPos

        Tyto.UndoHandler.register
          action  : 'MOVE-TASK'
          startPos: startPos
          start: self.model
          destination : destination
          mover   : mover
          model   : taskModel
          list    : taskList
          view    : self

    return

  updateName: ->
    col           = this.model
    this.oldTitle = col.get 'title'
    col.set 'title', @ui.columnName.text().trim()
    return

  addTask: ->
    newId   = _.uniqueId()
    newTask = new Tyto.Tasks.Task
      id     : newId
      ordinal: this.collection.length + 1

    this.collection.add newTask

  deleteColumn: ->
    col = this.model
    id  = parseInt col.get('id'), 10
    this.trigger 'destroy:column', id
    return
