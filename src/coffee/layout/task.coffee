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
    'click @ui.editTask'       : 'saveAndEdit'
    'dblclick @ui.title'       : 'enableEditTaskTitle'
    'blur @ui.title'           : 'updateTaskTitle'
    'dblclick @ui.description' : 'enableEditTask'
    'blur @ui.description'     : 'updateTask'

  initialize: ->
    that        = this
    that.board  = that.getOption 'board'
    that.column = that.getOption 'column'

  deleteTask: ->
    this.model.destroy()

  saveAndEdit: ->
    Tyto.navigate '#board/' + this.board.id + '/task/' + this.model.id, true

  updateTask: ->
    this.ui.description.removeAttr 'contenteditable'
    this.model.set 'description', this.ui.description.text().trim()
    this.model.save()

  enableEditTask: ->
    this.oldDescription = this.model.get 'description'
    this.ui.description.attr('contenteditable', true)
      .focus()

  updateTaskTitle: ->
    this.ui.title.removeAttr 'contenteditable'
    this.model.set 'title', this.ui.title.text().trim()
    this.model.save()

  enableEditTaskTitle: ->
    this.oldTitle = this.model.get 'title'
    this.ui.title.attr('contenteditable', true)
      .focus()
