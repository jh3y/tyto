module.exports = Backbone.Marionette.ItemView.extend
  tagName: 'div'
  className: 'tyto--task'
  attributes: ->
    id = this.model.get 'id'
    'data-task-id': id
  template: Tyto.templateStore.task
  templateHelpers: ->
    view = this
    boardId = view.getOption('board').get 'id'
    boardId: boardId
  ui:
    deleteTask : '.delete'
    editTask   : '.edit'
    description: '.tyto--task-description'
  events:
    'click @ui.deleteTask'     : 'deleteTask'
    'click @ui.editTask'       : 'save'
    'dblclick @ui.description' : 'enableEditTask'
    'blur @ui.description'     : 'updateTask'

  initialize: ->
    this.board  = this.getOption 'board'
    this.column = this.getOption 'column'
    this.$el.on 'click', ->
      console.log 'unblur the description please'

  deleteTask: ->
    this.trigger 'destroy:task', this.model.get('id')

  save: ->
    that  = this
    tasks = that.column.model.get 'tasks'
    cols  = new Tyto.Columns.ColumnList that.board.get('columns')
    col   = cols.get that.column.model.id
    col.set 'tasks', tasks
    that.board.set 'columns', cols
    that.board.save()

    Tyto.navigate '#board/' + this.board.get('id') + '/task/' + this.model.get('id'), true

  updateTask: ->
    this.ui.description.removeAttr 'contenteditable'
    this.model.set 'description', this.ui.description.text().trim()

  enableEditTask: ->
    this.ui.description.attr('contenteditable', true)
      .focus()
    yap 'enable editin'
