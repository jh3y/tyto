# Tyto.module 'Todos', (Todos, App, Backbone) ->
#   Todos.Todo = Backbone.Model.extend
#     defaults:
#       title: 'New Todo'
#       description: 'Make this work!'
#     initialize: ->
#       console.info 'created a new todo'
#
#   Todos.TodoList = Backbone.Collection.extend
#     model: Todos.Todo
#     localStorage: new Backbone.LocalStorage 'tytoTodos'
#     initialize: ->
#       console.info 'new todos collection created.'
#
#   return


Tyto.module 'Columns', (Columns, App, Backbone) ->
  Columns.Column = Backbone.Model.extend
    defaults:
      title: 'New Column'
    initialize: ->
      console.info 'created a new column'

  Columns.ColumnList = Backbone.Collection.extend
    model: Columns.Column
    localStorage: new Backbone.LocalStorage 'tytoCol'
    initialize: ->
      console.info 'new columns collection created.'

  return


Tyto.module 'Boards', (Boards, App, Backbone) ->
  Boards.Board = Backbone.Model.extend
    defaults:
      title: 'New Board'
    initialize: ->
      if this.get('columns') isnt `undefined`
        this.set 'columns', new Tyto.Columns.ColumnList this.get('columns')

  Boards.BoardList = Backbone.Collection.extend
    model: Boards.Board
    localStorage: new Backbone.LocalStorage 'tyto'
    initialize: ->
      console.info 'new boards collection created'

  return
