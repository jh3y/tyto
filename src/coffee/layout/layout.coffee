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
    # Spec out UI elements to interact with.
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
    showBoard: ->
      App.navigate 'boards/' + this.ui.boardSelector.val(),
        trigger: true


  Layout.Board = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.board
    # Spec out UI elements to interact with.
    ui:
      delete: '#delete-board'
    events:
      'click @ui.delete': 'deleteBoard'
    deleteBoard: ->
      this.collection.create
        title: 'MY NEW BOARD'
