Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Todo = Backbone.Marionette.ItemView.extend
    tagName: 'div'
    className: 'task'
    attributes: ->
      id = this.model.get 'id'
      'data-task-id': id
    template: tytoTmpl.task
    templateHelpers: ->
      view = this
      boardId = view.getOption('board').get 'id'
      boardId: boardId
    ui:
      deleteTodo: '#delete-todo'
      description: '#todo-description'
    events:
      'click @ui.deleteTodo': 'deleteTodo'
      'blur @ui.description': 'updateTodo'
    onRender: ->
      yap 'rendering task'
    deleteTodo: ->
      yap 'removing todo'
      this.trigger 'destroy:todo', this.model
    updateTodo: ->
      this.model.set 'description', this.ui.description.text().trim()
