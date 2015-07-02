module.exports = Backbone.Marionette.ItemView.extend
  tagName        : 'div'
  className      : 'tyto--task bg--yellow'
  attributes     : ->
    id = this.model.get 'id'
    'data-task-id': id
  template       : Tyto.templateStore.task
  ui:
    deleteTask   : '.delete'
    editTask     : '.edit'
    description  : '.tyto--task-description'
    title        : '.tyto--task-title'
  events:
    'click @ui.deleteTask'     : 'deleteTask'
    'click @ui.editTask'       : 'editTask'
    'dblclick @ui.title'       : 'enableEditTaskTitle'
    'blur @ui.title'           : 'updateTaskTitle'
    'dblclick @ui.description' : 'enableEditTask'
    'blur @ui.description'     : 'updateTask'

  deleteTask: ->
    this.model.destroy()

  editTask: ->
    boardId = this.options.board.id
    taskId  = this.model.id
    Tyto.navigate '#board/' + boardId + '/task/' + taskId, true

  updateTask: ->
    this.ui.description.removeAttr 'contenteditable'
    this.model.save
      description: this.ui.description.text().trim()

  enableEditTask: ->
    this.ui.description.attr('contenteditable', true)
      .focus()

  updateTaskTitle: ->
    this.ui.title.removeAttr 'contenteditable'
    this.model.save
      title: this.ui.title.text().trim()

  enableEditTaskTitle: ->
    this.ui.title.attr('contenteditable', true)
      .focus()
