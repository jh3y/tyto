Tyto.module 'Todos', (Todos, App, Backbone) ->
  Todos.Todo = Backbone.Model.extend
    initialize: ->
      yap 'creating a todo for some reason...'
    defaults:
      title: 'New Todo'
      description: 'Make this work!'

  Todos.TodoList = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto--todo'
    model: Todos.Todo

Tyto.module 'Columns', (Columns, App, Backbone) ->
  Columns.Column = Backbone.Model.extend
    defaults:
      title: 'New Column'
      todos: []

  Columns.ColumnList = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto--col'
    model: Columns.Column


Tyto.module 'Boards', (Boards, App, Backbone) ->
  Boards.Board = Backbone.Model.extend
    defaults:
      title: 'New Board'
      columns: []

  Boards.BoardList = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto--board'
    model: Boards.Board
