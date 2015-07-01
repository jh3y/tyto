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
  collection: ->
    debugger
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

    this.model.on 'change', (mod, opts) ->
      if !opts.ignore
        Tyto.UndoHandler.register
          action  : 'EDIT-COLUMN'
          model   : mod
          change  : mod.previousAttributes()
      columnView.render()

    this.collection.on 'add', (mod, col, opts) ->
      if !opts.ignore
        Tyto.UndoHandler.register
          action    : 'ADD-TASK'
          model     : mod
          collection: col

    this.collection.on 'remove', (mod, col, opts) ->
      if !opts.ignore
        Tyto.UndoHandler.register
          action    : 'REMOVE-TASK'
          model     : mod
          collection: col


  onBeforeRender: ->
    this.collection.models = this.collection.sortBy 'ordinal'

    newWidth = (100 / this.options.siblings.length) + '%'
    this.$el.css
      width: newWidth

  onRender: ->
    self        = this
    model       = `undefined`
    list        = `undefined`
    oldPos      = `undefined`
    this.$el.find('.tasks').sortable
      connectWith: '.tasks',
      placeholder: 'item-placeholder'
      containment: '.columns'
      opacity    : 0.8
      start      : (event, ui) ->
        model       = self.collection.get ui.item.attr('data-task-id')
        oldPos      = model.get 'ordinal'
      stop       : (event, ui) ->
        list        = Array.prototype.slice.call self.$el.find '.tyto--task'

        Tyto.reorder self, list, 'data-task-id'

        Tyto.UndoHandler.register
          action  : 'MOVE-TASK'
          oldPos  : oldPos
          model   : model
          list    : list
          view    : self
          attr    : 'data-task-id'

    # self      = this
    # mover     = `undefined`
    # taskModel = `undefined`
    # taskList  = `undefined`
    # startPos  = `undefined`
    #
    # this.$el.find('.tasks').sortable
    #   connectWith: '.tasks'
    #   placeholder: "item-placeholder"
    #   containment: '.columns'
    #   opacity    : 0.8
    #   revert     : true
    #   start      : (event, ui) ->
    #     mover     = ui.item[0]
    #     taskModel = self.collection.get ui.item.attr('data-task-id')
    #     startPos  = taskModel.get 'ordinal'
    #   stop       : (event, ui) ->
    #     destinationView = self
    #     # This is long as there are different scenarios. If the destination is a different column then need to do some different stuff else just do as normal...
    #     newColId = $(mover).parents('[data-col-id]').attr 'data-col-id'
    #     destination = self.getOption('siblings').get newColId
    #     destinationView = Tyto.boardView.children.findByModel destination
    #     taskList  = Array.prototype.slice.call destinationView.$el.find '.tyto--task'
    #     newPos    = taskList.indexOf(mover) + 1
    #
    #     Task = taskModel.clone()
    #     Task.set 'ordinal', newPos
    #
    #
    #     isNewHome = ->
    #       newColId isnt self.model.id
    #     # 1st. Let's find out if we have a new home.
    #     startCol = self.model
    #     if isNewHome()
    #       self.collection.remove taskModel
    #       destination.get('tasks').add Task,
    #         at: newPos
    #       console.log 'got a new homeeee'
    #     else
    #       console.log 'staying put thanks...'
    #
    #
    #     Tyto.reorder destinationView, taskList, 'data-task-id'
    #
    #     # Tyto.UndoHandler.register
    #     #   action  : 'MOVE-TASK'
    #     #   startPos: startPos
    #     #   start: self.model
    #     #   destination : destination
    #     #   mover   : mover
    #     #   model   : Task
    #     #   list    : taskList
    #     #   view    : self

    return

  updateName: ->
    col      = this.model
    oldTitle = col.get 'title'
    col.set 'title', @ui.columnName.text().trim()
    Tyto.UndoHandler.register
      action   : 'EDIT-COLUMN'
      model    : col
      property : 'title'
      val      : oldTitle
    return

  addTask: ->
    col = this
    newId   = _.uniqueId()
    newTask = new Tyto.Tasks.Task
      id     : newId
      columnId: col.model.id
      boardId: col.options.board.id
      ordinal: this.collection.length + 1

    # NOTE shouldn't be possible unless user accepts localStorage use.
    newTask.save()

    this.collection.add newTask

  deleteColumn: ->
    # Here need to iterate over the tasks and destroy them all.
    if confirm 'are you sure????'
      this.collection.forEach (task) ->
        task.destroy()
      this.model.destroy()
