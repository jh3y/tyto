module.exports =  Backbone.Marionette.ItemView.extend
  template: Tyto.templateStore.select
  tagName : 'div'
  className: ''
  ui:
    # add          : '#add-board',
    boardSelector: '#board-selector'
  events:
    # 'click @ui.add'           : 'addBoard',
    'change @ui.boardSelector': 'showBoard'

  collectionEvents:
    'all': 'render'

  initialize: ->
    sV = this

  addBoard: ->
    this.showBoard Tyto.boardList.create().id

  showBoard: (id) ->
    if typeof id isnt 'string'
      id = this.ui.boardSelector.val()
    Tyto.navigate 'board/' + id,
      trigger: true
    return
