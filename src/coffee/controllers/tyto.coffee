###
  This needs a new name for sure.
###
AppCtrl = (AppCtrl, App, Backbone, Marionette) ->
  AppCtrl.Router = Marionette.AppRouter.extend
    appRoutes:
      'board/:board'                        : 'showBoardView'
      'board/:board/task/:task'             : 'showEditView'
      'board/:board/task/:task?fresh=:isNew': 'showEditView'
      '*path'                               : 'showSelectView'

  AppCtrl.Controller = Marionette.Controller.extend

    start: ->
      this.showMenu()
      # Cookie banner must be accepted before any functionality is possible.
      # if window.localStorage and !window.localStorage.tyto
      #   this.showCookieBanner()

    showSelectView: ->
      Tyto.SelectView = new App.Views.Select
        collection: Tyto.boardList
      Tyto.RootView.showChildView 'Content', Tyto.SelectView

    showMenu: ->
      Tyto.MenuView = new App.Views.Menu()
      Tyto.RootView.showChildView 'Menu', Tyto.MenuView

    showCookieBanner: ->
      ###
        Show cookie banner by creating a temporary region and showing
        the view.
      ###
      yap 'show the cookie banner'
      # Tyto.root.getRegion('header')
      #   .$el
      #   .prepend $('<div id="cookie-banner"></div>')
      # Tyto.root.addRegion 'cookie', '#cookie-banner'
      # Tyto.CookieBannerView = new App.Layout.CookieBanner()
      # Tyto.root.showChildView 'cookie', Tyto.CookieBannerView


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
        App.navigate '/'

    showEditView: (bId, tId, isNew) ->
      board      = Tyto.Boards.get bId
      taskToEdit = Tyto.Tasks.get tId
      Tyto.EditView  = new App.Views.Edit
        model  : taskToEdit
        boardId: bId
        isNew  : isNew
      App.RootView.showChildView 'Content', Tyto.EditView

module.exports = AppCtrl
