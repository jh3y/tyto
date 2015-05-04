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
      newBoard = new Tyto.Boards.Board
        id: _.uniqueId()
      Tyto.boardList.add newBoard
        # wait: true
        # success: (response) ->
        # # id = response.get 'id'
      this.showBoard newBoard.get('id')
      return
    showBoard: (id) ->
      if typeof id isnt 'string'
        id = this.ui.boardSelector.val()
      App.navigate 'boards/' + id,
        trigger: true
      return
