Tyto.module 'BoardList', (BoardList, App, Backbone, Marionette) ->
  BoardList.Router = Marionette.AppRouter.extend
    appRoutes:
      'boards/:board': 'showBoard',
      '*path': 'someFunc'
  BoardList.Controller = Marionette.Controller.extend
    initialize: ->
      this.boardList = new App.Boards.BoardList()
    someFunc: ->
      console.info 'awesome'
    start: ->
      that = this
      this.showMenu this.boardList
      this.boardList.fetch
        success: (collection, response, options) ->
          if collection.length > 0
            that.router.navigate '#/boards/' + collection.first().get 'id'

    showMenu: (boards) ->
      menu = new App.Layout.Menu
        collection: boards
      App.root.showChildView 'menu', menu

    showBoard: (board) ->
      ###
        get a board and display it using the board view.
      ###
      console.info 'time to display', board

  App.on 'start', ->
    controller = new BoardList.Controller()
    controller.router = new BoardList.Router
      controller: controller
    controller.start()
