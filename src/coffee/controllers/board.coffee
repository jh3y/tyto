###
  This needs a new name for sure.
###
BoardList = (BoardList, App, Backbone, Marionette) ->
  BoardList.Router = Marionette.AppRouter.extend
    appRoutes:
      'board/:board'                        : 'showBoard'
      'board/:board/task/:task'             : 'editTask'
      'board/:board/task/:task?fresh=:isNew': 'editTask'
      '*path'                               : 'selectBoard'

  BoardList.Controller = Marionette.Controller.extend
    initialize: ->
      this.boardList = App.boardList
      return

    selectBoard: ->
      Tyto.selectView = new App.Layout.Select
        collection: Tyto.boardList
      Tyto.root.showChildView 'content', Tyto.selectView
      return

    start: ->
      that = this
      this.showMenu()
      # Cookie banner must be accepted before any functionality is possible.
      # this.showCookieBanner()
      return

    showCookieBanner: ->
      if window.localStorage and !window.localStorage.tyto
        ###
          Show cookie banner by creating a temporary region and showing
          the view.
        ###
        Tyto.root.getRegion('header')
          .$el
          .prepend $('<div id="cookie-banner"></div>')
        Tyto.root.addRegion 'cookie', '#cookie-banner'
        Tyto.CookieBannerView = new App.Layout.CookieBanner()
        Tyto.root.showChildView 'cookie', Tyto.CookieBannerView


    showMenu: ->
      Tyto.menuView = new App.Layout.Menu()
      Tyto.root.showChildView 'menu', Tyto.menuView

    showBoard: (id) ->
      # On a show board. Need to pull in all the columns and tasks for a board
      # And send them through to the view...
      Tyto.currentBoard = model = Tyto.boardList.get id
      if model isnt `undefined`
        cols = Tyto.columnList.where
          boardId: model.id
        tasks = Tyto.taskList.where
          boardId: model.id

        Tyto.currentTasks.reset tasks
        Tyto.currentCols.reset cols

        Tyto.boardView = new App.Layout.Board
          model     : model
          collection: Tyto.currentCols
          options   :
            tasks: Tyto.currentTasks

        App.root.showChildView 'content', Tyto.boardView
      else
        App.navigate '/'

    editTask: (bId, tId, isNew) ->
      board      = Tyto.boardList.get bId
      taskToEdit = Tyto.taskList.get tId
      Tyto.editView  = new App.Layout.Edit
        model  : taskToEdit
        boardId: bId
        isNew  : isNew
      App.root.showChildView 'content', Tyto.editView

module.exports = BoardList
