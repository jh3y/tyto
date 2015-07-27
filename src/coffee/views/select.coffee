module.exports =  Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.select

  tagName : 'div'

  className: ->
    this.domAttributes.VIEW_CLASS

  ui:
    add          : '.tyto-select__add-board'
    load         : '.tyto-select__load-intro-board'
    boardSelector: '.tyto-select__board-selector'

  events:
    'click @ui.add'           : 'addBoard',
    'change @ui.boardSelector': 'showBoard'
    'click @ui.load'          : 'loadIntro'

  domAttributes:
    VIEW_CLASS: 'tyto-select'

  collectionEvents:
    'all': 'render'

  initialize: ->
    sV = this

  addBoard: ->
    this.showBoard Tyto.Boards.create().id

  loadIntro: ->
    view = this
    id   = `undefined`
    Tyto.RootView.$el.addClass Tyto.LOADING_CLASS
    $.getJSON Tyto.INTRO_JSON_SRC, (d) ->
      Tyto.RootView.$el.removeClass Tyto.LOADING_CLASS
      Tyto.Utils.load d, true, false
      _.forOwn d, (val, key) ->
        if key.indexOf('tyto--board-') isnt -1
          id = JSON.parse(val).id
      view.showBoard id

  showBoard: (id) ->
    if typeof id isnt 'string'
      id = this.ui.boardSelector.val()
    Tyto.navigate 'board/' + id,
      trigger: true
    return
