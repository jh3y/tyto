Tyto.module 'Todos', (Todos, App, Backbone) ->
  Todos.Todo = Backbone.Model.extend
    defaults:
      title: 'New Todo'
      description: 'Making this work!'

  Todos.TodoList = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto--todo'
    model: Todos.Todo
