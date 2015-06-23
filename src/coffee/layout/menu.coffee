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
    'click @ui.exportBtn'     : 'exportData'
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
        menuView.loadData data
      else
        menuView.importData data

  handleFile: (e) ->
    menu = this
    f    = e.target.files[0]
    if (f.type.match 'application/json') or (f.name.indexOf '.json' isnt -1)
      menu.reader.readAsText f
    else
      alert '[tyto] only valid json files allowed'
    return

  importData: (d) ->
    ###
      When we do an "import", we want to retain the current boards.

      We essentially do the same as load but check IDs so that if there
      are going to be duplicate, we make sure there aren't.

      We also don't have to clear out localStorage.
    ###
    delete d.tyto
    delete d['tyto--board']

    boardIds = window.localStorage['tyto--board'].split ','
    _.forOwn d, (val, key) ->
      console.info key, boardIds
      importBoard = JSON.parse val
      if boardIds.indexOf(importBoard.id) isnt -1
        # If board ID already exists, need to set up new ID for board.
        newId = _.uniqueId()
        importBoard.id = newId
        boardIds.push newId
      window.localStorage['tyto--board-' + importBoard.id] = JSON.stringify importBoard
      Tyto.boardList.add importBoard

    window.localStorage['tyto--board'] = boardIds.toString()

  loadData: (d) ->
    ###
      When we do a "load", we want to wipe the current set up and load in new.
    ###
    Tyto.boardList.reset()
    # wipe the localStorage
    _.forOwn window.localStorage, (val, key) ->
      if key.indexOf('tyto') isnt -1
        window.localStorage.removeItem key
    # repopulate localStorage
    _.forOwn d, (val, key) ->
      window.localStorage.setItem key, val
      # If we have a board we need to populate it into the boardList
      if key.indexOf('tyto--board-') isnt -1
        loadBoard = JSON.parse val
        Tyto.boardList.add loadBoard

    # Need to empty out the current boardView to make way for whatever is chose.
    Tyto.root.getRegion('content').empty()
    Tyto.navigate '/', true




  initLoad: (e) ->
    this.activeImporter = e.target
    anchor              = this.ui.importer[0]
    if window.File and window.FileReader and window.FileList and window.Blob
      anchor.click()
    else
      alert '[tyto] Unfortunately the file APIs are not fully supported in your browser'

  exportData: ->
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
    Tyto.boardList.add newBoard
    this.showBoard newBoard.get('id')
    return

  showBoard: (id) ->
    if typeof id isnt 'string'
      id = this.ui.boardSelector.val()
    Tyto.navigate 'board/' + id,
      trigger: true
    return
