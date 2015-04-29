Tyto.module 'Layout', (Layout, App, Backbone) ->
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
