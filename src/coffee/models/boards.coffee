Tyto.module 'Boards', (Boards, App, Backbone) ->
  Boards.Board = Backbone.Model.extend
    defaults:
      title: 'New Board'
      columns: []
    initialize: ->
      console.info 'new board created'
  Boards.BoardList = Backbone.Collection.extend
    model: Boards.Board
    localStorage: new Backbone.LocalStorage 'tyto'
    initialize: ->
      console.info 'new boards collection created'
