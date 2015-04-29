Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Root = Backbone.Marionette.LayoutView.extend
    el: '#tyto-app',
    regions:
      menu:   '#tyto-menu'
      content: '#tyto-content'
  ###
    this.collection will be the board list.
  ###
  Layout.Menu = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.menu
    ui:
      add: '#add-board'
      boardSelector: '#board-selector'
    events:
      'click @ui.add': 'addBoard',
      'change @ui.boardSelector': 'showBoard'
    collectionEvents:
      'all': 'render'
    addBoard: ->
      this.collection.create
        title: 'MY NEW BOARD'
      return
    showBoard: ->
      App.navigate 'boards/' + this.ui.boardSelector.val(),
        trigger: true
      return


  Layout.Column = Backbone.Marionette.CompositeView.extend
    template: tytoTmpl.column
    ui:
      deleteColumn: '#delete-column'
    events:
      'click @ui.deleteColumn': 'deleteColumn'
    deleteColumn: ->
      this.trigger 'destroy:column', this.model
    initialize: ->
      this.listenTo Tyto.vent, 'flush', (d) ->
        console.log d, this
        this.model.destroy()
        this.destroy()


  Layout.Board = Backbone.Marionette.CompositeView.extend
    template: tytoTmpl.board
    childView: Layout.Column
    childViewContainer: '.columns'
    deletedCols: []
    newCols: []
    modelEvents:
      'destroy': 'render'
    ui:
      addColumn: '#add-column'
      saveBoard: '#save-board'
      deleteBoard: '#delete-board'
    events:
      'click @ui.addColumn': 'addColumn'
      'click @ui.saveBoard': 'saveBoard'
      'click @ui.deleteBoard': 'deleteBoard'
    initialize: ->
      console.info 'created board viw'
      this.on 'childview:destroy:column', (d) ->
        this.collection.remove d.model
        this.deletedCols.push d
        this.render()
    onRender: ->
      console.info 'renderrring', this.collection.length
    addColumn: ->
      newCol = new Tyto.Columns.Column()
      this.model.get('columns').add newCol
      this.newCols.push newCol
      this.collection = this.model.get 'columns'
      this.render()
      return
    saveBoard: ->
      if this.newCols.length > 0
        _.forEach this.newCols, (col) ->
          col.save()
      this.model.save()
      ## Need to clean up deleted columns on save from localStorage.
      if this.deletedCols.length > 0
        _.forEach this.deletedCols, (col) ->
          col.model.destroy()
      this.collection = this.model.get 'columns'
      this.render()
    deleteBoard: ->
      Tyto.vent.trigger 'flush', this.model.get 'id'
      # _.forEach this.model.get('columns').models, (col) ->
      #   console.log col.get 'id'
      #   col.destroy()
      this.model.destroy()
      this.destroy()
      Tyto.navigate '/',
        trigger: true
