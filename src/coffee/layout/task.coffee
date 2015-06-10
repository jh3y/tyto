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
    deleteTask: '.delete'
    description: '.tyto--task-description'
  events:
    'click @ui.deleteTask'     : 'deleteTask'
    'dblclick @ui.description' : 'enableEditTask'
    'blur @ui.description'     : 'updateTask'

  initialize: ->
    this.$el.on 'click', ->
      console.log 'unblur the description please'

  deleteTask: ->
    this.trigger 'destroy:task', this.model.get('id')

  updateTask: ->
    this.ui.description.removeAttr 'contenteditable'
    this.model.set 'description', this.ui.description.text().trim()

  enableEditTask: ->
    this.ui.description.attr('contenteditable', true)
      .focus()
    yap 'enable editin'
