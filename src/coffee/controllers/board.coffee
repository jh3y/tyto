module.exports = (BoardList, App, Backbone, Marionette) ->
  BoardList.Router = Marionette.AppRouter.extend
    appRoutes:
      'board/:board'                        : 'showBoard'
      'board/:board/task/:task'             : 'editTask'
      'board/:board/task/:task?fresh=:isNew': 'editTask'
      '*path'                               : 'defaultDrop'

  BoardList.Controller = Marionette.Controller.extend
    initialize: ->
      this.boardList = App.boardList
      return

    defaultDrop: ->
      console.info 'fired me'

    start: ->
      that = this
      this.showMenu this.boardList

      # this.showCookieBanner()

      # this.listenTo Tyto.vent, 'setup:localStorage', ->
      #   window.localStorage.setItem 'tyto', true
      #   Tyto.CookieBannerView.destroy()
      #   Tyto.root.removeRegion 'cookie'
      #   $('#cookie-banner').remove()
      #   this.setUpAutoSave()
      #
      # this.listenTo Tyto.vent, 'hard-task:add', (newMod) ->
      #   console.info 'create a new task and direct me to it', newMod



      # NOTE THIS PIECE SHOULD BELONG IN THE DEFAULT ROUTE...
      # if this.boardList.length > 0 and window.location.hash is ''
      #   Tyto.vent.on 'history:started', ->
      #     id = that.boardList.first().get 'id'
      #     App.navigate 'board/' + id,
      #       trigger: true

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

        return
      else
        this.setUpAutoSave()

    setUpAutoSave: ->
      yap 'setting up the autosavzzzz'

    showMenu: (boards) ->
      Tyto.menuView = new App.Layout.Menu
        collection: boards
      Tyto.root.showChildView 'menu', Tyto.menuView
      return

    showBoard: (id) ->
      # On a show board. Need to pull in all the columns and tasks for a board
      # And send them through to the view...
      model = this.boardList.get id
      if model isnt `undefined`
        Tyto.columnList.fetch().done (d) ->
          Tyto.taskList.fetch().done (d) ->
            cols = Tyto.columnList.where
              boardId: model.id
            tasks = Tyto.taskList.where
              boardId: model.id
            Tyto.boardView = new App.Layout.Board
              model: model
              collection: new Tyto.Columns.ColumnList cols
              options:
                tasks: new Tyto.Tasks.TaskList tasks
            App.root.showChildView 'content', Tyto.boardView
      else
        App.navigate '/'

    editTask: (bId, tId, isNew) ->
      board = Tyto.boardList.get bId
      renderTask = ->
        task = Tyto.taskList.get tId
        Tyto.editView  = new App.Layout.Edit
          model  : task
          boardId: bId
          isNew  : isNew
        debugger
        App.root.showChildView 'content', Tyto.editView

      Tyto.columnList.fetch().done (d) ->
        if Tyto.taskList.get(tId) is `undefined`
          Tyto.taskList.fetch().done ->
            console.log 'has to fetch first'
            renderTask()
        else
          console.log 'alredy got it'
          renderTask()

  # Here just instantiate controller and start it up
  App.on 'start', ->
    Tyto.controller        = new BoardList.Controller()
    Tyto.controller.router = new BoardList.Router
      controller: Tyto.controller
    Tyto.controller.start()
    return

  return
