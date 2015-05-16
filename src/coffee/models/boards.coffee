module.exports = (Boards, App, Backbone) ->
  Boards.Board = Backbone.Model.extend
    defaults:
      title: 'New Board'
      columns: []

  Boards.BoardList = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto--board'
    model: Boards.Board
