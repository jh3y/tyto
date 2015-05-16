module.exports = Backbone.Marionette.ItemView.extend
  tagName: 'div'
  className: 'task'
  attributes: ->
    id = this.model.get 'id'
    'data-task-id': id
  template: Tyto.templateStore.task
  templateHelpers: ->
    view = this
    boardId = view.getOption('board').get 'id'
    boardId: boardId
  ui:
    deleteTask: '#delete-task'
    description: '#task-description'
  events:
    'click @ui.deleteTask': 'deleteTask'
    'blur @ui.description': 'updateTask'

  deleteTask: ->
    this.trigger 'destroy:task', this.model.get('id')

  updateTask: ->
    this.model.set 'description', this.ui.description.text().trim()
