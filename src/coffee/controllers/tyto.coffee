###
  This needs a new name for sure.
###
AppCtrl = (AppCtrl, App, Backbone, Marionette) ->
  AppCtrl.Router = Marionette.AppRouter.extend
    appRoutes:
      'board/:board'                        : 'showBoardView'
      'board/:board/task/:task'             : 'showEditView'
      'board/:board/task/:task?:params'     : 'showEditView'
      '*path'                               : 'showSelectView'

  AppCtrl.Controller = Marionette.Controller.extend

    start: ->
      this.showMenu()
      if window.localStorage and !window.localStorage.tyto
        this.showCookieBanner()

    showSelectView: ->
      Tyto.SelectView = new App.Views.Select
        collection: Tyto.Boards
      Tyto.RootView.showChildView 'Content', Tyto.SelectView

    showMenu: ->
      Tyto.MenuView = new App.Views.Menu()
      Tyto.RootView.showChildView 'Menu', Tyto.MenuView

    showCookieBanner: ->
      ###
        Show cookie banner by creating a temporary region and showing
        the view.
      ###
      Tyto.RootView
        .$el
        .prepend $('<div id="cookie-banner"></div>')
      Tyto.RootView.addRegion 'cookie', '#cookie-banner'
      Tyto.CookieBannerView = new App.Views.CookieBanner()
      Tyto.RootView.showChildView 'cookie', Tyto.CookieBannerView


    showBoardView: (id) ->
      # On a show board. Need to pull in all the columns and tasks for a board
      # And send them through to the view...
      Tyto.ActiveBoard = model = Tyto.Boards.get id
      if model isnt `undefined`
        cols = Tyto.Columns.where
          boardId: model.id
        tasks = Tyto.Tasks.where
          boardId: model.id

        Tyto.ActiveTasks.reset tasks
        Tyto.ActiveCols.reset cols

        Tyto.BoardView = new App.Views.Board
          model     : model
          collection: Tyto.ActiveCols
          options   :
            tasks: Tyto.ActiveTasks

        App.RootView.showChildView 'Content', Tyto.BoardView
      else
        App.navigate '/', true

    showEditView: (bId, tId, params) ->
      board      = Tyto.Boards.get bId
      columns    = Tyto.Columns.where
        boardId: bId
      parentColumn = `undefined`
      isNew      = false
      if params
        qS = Tyto.Utils.processQueryString params
        if qS.isFresh is 'true'
          isNew      = true
          taskToEdit = Tyto.TempTask
      else
        taskToEdit = Tyto.Tasks.get tId
      if taskToEdit and board
        Tyto.EditView  = new App.Views.Edit
          model  : taskToEdit
          board  : board
          columns: columns
          isNew  : isNew
        App.RootView.showChildView 'Content', Tyto.EditView
      else if board
        Tyto.navigate '/board/' + board.id, true
      else
        Tyto.navigate '/', true

module.exports = AppCtrl
