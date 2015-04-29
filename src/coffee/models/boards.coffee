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
