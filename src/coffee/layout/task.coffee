module.exports = Backbone.Marionette.ItemView.extend
  tagName        : 'div'
  className      : 'tyto--task bg--yellow'
  attributes     : ->
    id = this.model.get 'id'
    'data-task-id': id
  template       : Tyto.templateStore.task
  templateHelpers: ->
    view    = this
    boardId = view.getOption('board').get 'id'
    boardId: boardId
  ui:
    deleteTask   : '.delete'
    editTask     : '.edit'
    description  : '.tyto--task-description'
  events:
    'click @ui.deleteTask'     : 'deleteTask'
    'click @ui.editTask'       : 'saveAndEdit'
    'dblclick @ui.description' : 'enableEditTask'
    'blur @ui.description'     : 'updateTask'

  initialize: ->
    that        = this
    that.board  = that.getOption 'board'
    that.column = that.getOption 'column'

    this.model.on 'change:description', (mod, newVal, opts) ->
      if !opts.ignore
        Tyto.UndoHandler.register
          action  : 'EDIT-TASK'
          model   : mod
          property: 'description'
          val     : that.oldDescription
      that.render()

  deleteTask: ->
    this.trigger 'destroy:task', this.model.get('id')

  saveAndEdit: ->
    ###
      Seems a little long winded but is necessary to ensure board is
      saved before doing a full edit on a newly created task.
    ###
    that      = this
    taskId    = that.model.get 'id'
    boardId   = that.board.get 'id'
    cols      = that.board.get('columns')
    col       = _.findWhere cols,
      id: that.column.model.id
    # What if the column isn't saved yet....
    if col is `undefined`
      yap 'gotta save the columns first...'
      trueCols  = that.getOption('boardView').collection
      that.board.set 'columns', trueCols
      col = _.findWhere that.board.get('columns').models,
        id: that.column.model.id

    # Only need to save it if it's not already in the model
    if !_.findWhere(col.tasks, { id: taskId })
      tasks     = that.column.model.get 'tasks'
      col.tasks = tasks
      that.board.set 'columns', that.board.get('columns')
      that.board.save()
    # Navigate to the edit view
    Tyto.navigate '#board/' + boardId + '/task/' + taskId, true

  updateTask: ->
    this.ui.description.removeAttr 'contenteditable'
    this.model.set 'description', this.ui.description.text().trim()

  enableEditTask: ->
    this.oldDescription = this.model.get 'description'
    this.ui.description.attr('contenteditable', true)
      .focus()
