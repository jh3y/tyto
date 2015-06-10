module.exports = (BoardList, App, Backbone, Marionette) ->
  BoardList.Router = Marionette.AppRouter.extend
    appRoutes:
      'board/:board'                        : 'showBoard'
      'board/:board/task/:task'             : 'editTask'
      'board/:board/task/:task?fresh=:isNew': 'editTask'

  BoardList.Controller = Marionette.Controller.extend
    initialize: ->
      this.boardList = App.boardList
      return
    start: ->
      that = this
      this.showMenu this.boardList
      this.showCookieBanner()

      this.listenTo Tyto.vent, 'setup:localStorage', ->
        window.localStorage.setItem 'tyto', true
        Tyto.CookieBannerView.destroy()
        Tyto.root.removeRegion 'cookie'
        $('#cookie-banner').remove()
        this.setUpAutoSave()

      this.listenTo Tyto.vent, 'hard-task:add', (newMod) ->
        console.info 'create a new task and direct me to it', newMod

      if this.boardList.length > 0 and window.location.hash is ''
        Tyto.vent.on 'history:started', ->
          id = that.boardList.first().get 'id'
          App.navigate 'board/' + id,
            trigger: true

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
      model = this.boardList.get id
      if model isnt `undefined`
        Tyto.boardView = new App.Layout.Board
          model: model
        App.root.showChildView 'content', Tyto.boardView
        return
      else
        App.navigate '/'

    editTask: (bId, tId, isNew) ->
      board = this.boardList.get bId
      newEdit = `undefined`
      this.editModel = `undefined`
      _.forEach board.get('columns'), (col) ->
        result = _.findWhere col.tasks,
          id: tId
        if result isnt `undefined`
          newEdit = result
      this.editModel = new Tyto.Tasks.Task newEdit
      isNew          = if (isNew is null) then false else true
      yap newEdit, this.editModel
      Tyto.editView  = new App.Layout.Edit
        model  : this.editModel
        boardId: bId
        isNew  : isNew
      App.root.showChildView 'content', Tyto.editView
      return

  App.on 'start', ->
    Tyto.controller        = new BoardList.Controller()
    Tyto.controller.router = new BoardList.Router
      controller: Tyto.controller
    Tyto.controller.start()
    return

  return
