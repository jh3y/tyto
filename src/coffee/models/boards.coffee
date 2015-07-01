module.exports = (Boards, App, Backbone) ->
  Boards.Board = Backbone.Model.extend
    defaults:
      title: 'New Board'
    localStorage: new Backbone.LocalStorage 'tyto--board'

  Boards.BoardList = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto--board'
    model: Boards.Board
