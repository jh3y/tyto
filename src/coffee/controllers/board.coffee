Tyto.module 'BoardList', (BoardList, App, Backbone, Marionette) ->
  BoardList.Router = Marionette.AppRouter.extend
    appRoutes:
      '*path': 'displayBoard'
  BoardList.Controller = Marionette.Controller.extend
    initialize: ->
      this.boardList = new App.Boards.BoardList()
    start: ->
      this.showMenu this.boardList
      this.boardList.fetch
        success: this.displayBoard
    showMenu: (boards) ->
      menu = new App.Layout.Menu
        collection: boards
      App.root.showChildView 'menu', menu
    displayBoard: (collection,response,options) ->
      debugger
      console.log this.boardList
      console.info 'should be displaying a board now', collection.first()
      # board = new App.Layout.Board
      #   board: board
      # App.root.showChildView 'content', board
  App.on 'start', ->
    controller = new BoardList.Controller()
    controller.router = new BoardList.Router
      controller: controller
    controller.start()
