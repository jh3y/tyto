module.exports =  Backbone.Marionette.ItemView.extend
  template: Tyto.templateStore.menu
  ui:
    add          : '#add-board'
    exportBtn    : '#export-data'
    loadBtn      : '#load-data'
    importBtn    : '#import-data'
    exporter     : '#exporter'
    importer     : '#importer'
    boardSelector: '#board-selector'
  events:
    'click @ui.add'           : 'addBoard',
    'change @ui.boardSelector': 'showBoard',
    'click @ui.exportBtn'     : 'export'
    'click @ui.loadBtn'       : 'initLoad'
    'click @ui.importBtn'     : 'initLoad'
    'change @ui.importer'     : 'handleFile'
  collectionEvents:
    'all': 'render'

  initialize: ->
    menuView        = this
    menuView.reader = reader = new FileReader()
    reader.onloadend   = (e) ->
      data = JSON.parse e.target.result
      if menuView.activeImporter.id is 'load-data'
        Tyto.loadData data
      else
        Tyto.importData data

  handleFile: (e) ->
    menu = this
    f    = e.target.files[0]
    if (f.type.match 'application/json') or (f.name.indexOf '.json' isnt -1)
      menu.reader.readAsText f
    else
      alert '[tyto] only valid json files allowed'
    return

  initLoad: (e) ->
    this.activeImporter = e.target
    anchor              = this.ui.importer[0]
    if window.File and window.FileReader and window.FileList and window.Blob
      anchor.click()
    else
      alert '[tyto] Unfortunately the file APIs are not fully supported in your browser'

  export: ->
    # Iterate over localStorage and write file with all keys containing "tyto"
    anchor     = this.ui.exporter[0]
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

  addBoard: ->
    newBoard = new Tyto.Boards.Board
      id: _.uniqueId()

    # Save the board instantly
    newBoard.save()

    Tyto.boardList.add newBoard
    this.showBoard newBoard.get('id')
    return

  showBoard: (id) ->
    if typeof id isnt 'string'
      id = this.ui.boardSelector.val()
    Tyto.navigate 'board/' + id,
      trigger: true
    return
