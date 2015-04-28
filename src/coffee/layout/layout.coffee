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
    tagName: 'column'
    template: tytoTmpl.column

  Layout.Board = Backbone.Marionette.CompositeView.extend
    template: tytoTmpl.board
    childView: Layout.Column
    ui:
      addColumn: '#add-column'
    events:
      'click @ui.addColumn': 'addColumn'
    initialize: ->
      this.model.on 'all', this.render
    onBeforeRenderCollection: ->
      this.collection = this.model.get 'columns'
      console.info this.collection.length
    onRender: ->
      console.info 'renderrring', this.collection.length
    addColumn: ->
      this.model.get('columns').create new Tyto.Columns.Column()
      this.model.save()
      return
