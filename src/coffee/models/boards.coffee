Tyto.module 'Todos', (Todos, App, Backbone) ->
  Todos.Todo = Backbone.Model.extend
    defaults:
      title: 'New Todo'
      description: 'Make this work!'
    initialize: ->
      console.info 'created a new todo'

  Todos.TodoList = Backbone.Collection.extend
    model: Todos.Todo
    localStorage: new Backbone.LocalStorage 'tytoTodos'
    initialize: ->
      console.info 'new todos collection created.'

  return


Tyto.module 'Columns', (Columns, App, Backbone) ->
  Columns.Column = Backbone.Model.extend
    localStorage: new Backbone.LocalStorage 'tyto--col'
    defaults:
      title: 'New Column'
    initialize: ->
      console.info 'created a new column'

  Columns.ColumnList = Backbone.Collection.extend
    model: Columns.Column
    initialize: ->
      console.info 'new columns collection created.'

  return


Tyto.module 'Boards', (Boards, App, Backbone) ->
  Boards.Board = Backbone.Model.extend
    defaults:
      title: 'New Board'
    initialize: ->
      console.info 'new board created'
    parse: (response) ->
      _.extend {}, response,
        columns: new Tyto.Columns.ColumnList response.columns

  Boards.BoardList = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto'
    model: Boards.Board
    initialize: ->
      console.info 'new boards collection created'

  return
