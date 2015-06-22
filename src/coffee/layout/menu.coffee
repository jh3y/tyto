module.exports =  Backbone.Marionette.ItemView.extend
  template: Tyto.templateStore.menu
  ui:
    add          : '#add-board'
    export       : '#export-data'
    exportAnchor : '#exporter'
    loader       : '#load-data'
    loadAnchor   : '#loader'
    boardSelector: '#board-selector'
  events:
    'click @ui.add'           : 'addBoard',
    'change @ui.boardSelector': 'showBoard',
    'click @ui.export'        : 'exportData'
    'change @ui.loadAnchor'   : 'grab'
    'click @ui.loader'        : 'importData'
  collectionEvents:
    'all': 'render'

  initialize: ->
    menuView        = this
    menuView.reader = reader = new FileReader()
    reader.onload   = (e) ->
      data = e.target.result
      menuView.importIt data

  grab: (e) ->
    menu = this
    f = e.target.files[0]
    if (f.type.match 'application/json') or (f.name.indexOf '.json' isnt -1)
      menu.reader.readAsText f
    else
      alert '[tyto] only valid json files allowed'
    return

  importIt: (d) ->
    # debugger
    # result = JSON.parse this.result
    console.info d
    # if result.columns isnt `undefined` and
    # (result.DOMId isnt `undefined` or
    # result.DOMElementSelector isnt `undefined`)
    #   tyto._loadBarnJSON result
    # else
    #   alert '[tyto] incorrect json'

  addBoard: ->
    console.log 'egreg'
    newBoard = new Tyto.Boards.Board
      id: _.uniqueId()
    Tyto.boardList.add newBoard
    this.showBoard newBoard.get('id')
    return


  exportData: ->
    # Iterate over localStorage and write file with all keys containing "tyto"
    anchor     = this.ui.exportAnchor[0]
    exportable = {}
    _.forOwn window.localStorage, (val, key) ->
      if key.indexOf('tyto') isnt -1
        exportable[key] = val
    filename   = 'barn.json'
    content    = 'data:text/plain,' + JSON.stringify(exportable)

    anchor.setAttribute 'download', filename
    anchor.setAttribute 'href'    , content
    anchor.click()
    return

  importData: ->
    # Here need to wipe current localStorage object and import JSON.
    anchor = this.ui.loadAnchor[0]
    if window.File and window.FileReader and window.FileList and window.Blob
      anchor.click()
    else
      alert '[tyto] Unfortunately the file APIs are not fully supported in your browser'

  showBoard: (id) ->
    if typeof id isnt 'string'
      id = this.ui.boardSelector.val()
    Tyto.navigate 'board/' + id,
      trigger: true
    return
