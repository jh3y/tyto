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
  Layout.Board = Backbone.Marionette.CompositeView.extend
    template: tytoTmpl.board
    childView: Layout.Column
    childViewContainer: '.columns'
    ui:
      addColumn: '#add-column'
      saveBoard: '#save-board'
    events:
      'click @ui.addColumn': 'addColumn'
      'click @ui.saveBoard': 'saveBoard'
    initialize: ->
      console.info 'created board viw'
    onBeforeRenderCollection: ->
      # this.collection = this.model.get 'columns'
      console.info this.collection.length
    onRender: ->
      console.info 'renderrring', this.collection.length
    addColumn: ->
      this.model.get('columns').create new Tyto.Columns.Column()
      this.collection = this.model.get 'columns'
      this.render()
      return
    saveBoard: ->
      this.model.save()
      this.collection = this.model.get 'columns'
      this.render()
