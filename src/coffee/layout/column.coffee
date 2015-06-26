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

    this.model.set 'tasks', this.collection
    this.on 'childview:destroy:task', (mod, id) ->
      this.collection.remove id

  onBeforeRender: ->
    newWidth = (100 / this.options.siblings.length) + '%'
    this.$el.css
      width: newWidth

  onRender: ->
    self = this
    this.$el.find('.tasks').sortable
      connectWith: '.tasks'
      placeholder: "item-placeholder"
      containment: '.columns'
      opacity    : 0.8
      revert     : true
      stop       : (event, ui) ->
        mover     = ui.item[0]
        taskModel = self.collection.get ui.item.attr('data-task-id')
        taskList  = Array.prototype.slice.call self.$el.find '.task'
        Tyto.reorder self, mover, taskModel, taskList

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
