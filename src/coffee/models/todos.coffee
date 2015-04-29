Tyto.module 'Todos', (Todos, App, Backbone) ->
  Todos.Todo = Backbone.Model.extend
    defaults:
      title: 'New Todo'
      description: 'Make this work!'
    initialize: ->
      console.info 'created a new todo'

  Todos.TodoList = Backbone.Collection.extend
    model: Todos.Todo
    localStorage: new Backbone.LocalStorage 'tyto--task'
    initialize: ->
      console.info 'new todos collection created.'

  return
