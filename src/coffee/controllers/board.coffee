Tyto.module 'BoardList', (BoardList, App, Backbone, Marionette) ->
  BoardList.Router = Marionette.AppRouter.extend
    appRoutes:
      'boards/:board': 'showBoard'
  BoardList.Controller = Marionette.Controller.extend
    initialize: ->
      this.boardList = App.boardList
    someFunc: ->
      console.info 'awesome'
    start: ->
      that = this
      this.showMenu this.boardList
      if this.boardList.length > 0 and window.location.hash is ''
        Tyto.vent.on 'history:started', ->
          console.info 'I want to do something please!!'
          id = that.boardList.first().get 'id'
          App.navigate 'boards/' + id,
            trigger: true

    showMenu: (boards) ->
      menu = new App.Layout.Menu
        collection: boards
      Tyto.root.showChildView 'menu', menu
      return

    showBoard: (id) ->
      console.log 'display', id
      model = this.boardList.get id
      board = new App.Layout.Board
        model: model
      App.root.showChildView 'content', board

  App.on 'start', ->
    console.log 'ctrl'
    this.controller = new BoardList.Controller()
    this.controller.router = new BoardList.Router
      controller: this.controller
    this.controller.start()
    return

  return


Tyto.on 'start', ->
  Backbone.history.start()
  Tyto.vent.trigger 'history:started'

Tyto.boardList = new Tyto.Boards.BoardList()
Tyto.boardList.fetch().done (data) ->
  Tyto.start()
