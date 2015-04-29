Tyto.module 'BoardList', (BoardList, App, Backbone, Marionette) ->
  BoardList.Router = Marionette.AppRouter.extend
    appRoutes:
      'boards/:board': 'showBoard'
  BoardList.Controller = Marionette.Controller.extend
    initialize: ->
      this.boardList = App.boardList
      return
    start: ->
      that = this
      this.showMenu this.boardList
      if this.boardList.length > 0 and window.location.hash is ''
        Tyto.vent.on 'history:started', ->
          id = that.boardList.first().get 'id'
          App.navigate 'boards/' + id,
            trigger: true
      return

    showMenu: (boards) ->
      menu = new App.Layout.Menu
        collection: boards
      Tyto.root.showChildView 'menu', menu
      return

    showBoard: (id) ->
      model = this.boardList.get id
      board = new App.Layout.Board
        model: model
        collection: model.get('columns')
      App.root.showChildView 'content', board
      return

  App.on 'start', ->
    this.controller = new BoardList.Controller()
    this.controller.router = new BoardList.Router
      controller: this.controller
    this.controller.start()
    return

  return


Tyto.on 'start', ->
  Backbone.history.start()
  Tyto.vent.trigger 'history:started'
  return

Tyto.boardList = new Tyto.Boards.BoardList()
Tyto.boardList.fetch().done (data) ->
  Tyto.start()
  return
