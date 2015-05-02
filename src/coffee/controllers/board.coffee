Tyto.module 'BoardList', (BoardList, App, Backbone, Marionette) ->
  BoardList.Router = Marionette.AppRouter.extend
    appRoutes:
      'boards/:board'           : 'showBoard'
      'boards/:board/todo/:todo': 'editTodo'
      'boards/:board/todo/:todo?fresh=:isNew': 'editTodo'
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
      Tyto.menuView = new App.Layout.Menu
        collection: boards
      Tyto.root.showChildView 'menu', Tyto.menuView
      return

    showBoard: (id) ->
      model = this.boardList.get id
      Tyto.boardView = new App.Layout.Board
        model: model
      App.root.showChildView 'content', Tyto.boardView
      return
    editTodo: (bId, tId, isNew) ->
      result = `undefined`
      board = this.boardList.get bId
      _.forEach board.get('columns'), (col) ->
        result = _.findWhere col.todos,
          id: '25'
        result isnt `undefined`
      this.editModel = new Tyto.Todos.Todo result
      isNew = if (isNew is null) then false else true
      Tyto.editView = new App.Layout.Edit
        model: this.editModel
        boardId: bId
        isNew: isNew
      App.root.showChildView 'content', Tyto.editView
      return

  App.on 'start', ->
    Tyto.controller = new BoardList.Controller()
    Tyto.controller.router = new BoardList.Router
      controller: Tyto.controller
    Tyto.controller.start()
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
