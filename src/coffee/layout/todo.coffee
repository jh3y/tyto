Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Todo = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.todo
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
