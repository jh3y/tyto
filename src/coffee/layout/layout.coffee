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
    events:
      'click @ui.add': 'addBoard'
    collectionEvents:
      'all': 'render'
    addBoard: ->
      this.collection.create
        title: 'MY NEW BOARD'


  Layout.Board = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.board
    # Spec out UI elements to interact with.
    ui:
      delete: '#delete-board'
    events:
      'click @ui.delete': 'deleteBoard'
    collectionEvents:
      'all': 'render'
    render: ->
      console.log 'rendering this view now because I want a board.'
      console.log this.collection
    deleteBoard: ->
      this.collection.create
        title: 'MY NEW BOARD'
