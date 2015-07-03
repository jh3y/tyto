module.exports =  Backbone.Marionette.ItemView.extend
  template: Tyto.templateStore.menu
  ui:
    add          : '#add-board'
    show         : '#show'
    exportBtn    : '#export-data'
    loadBtn      : '#load-data'
    importBtn    : '#import-data'
    menu         : '.tyto--menu-panel'
    exporter     : '#exporter'
    importer     : '#importer'
    boardSelector: '#board-selector'
  events:
    'click @ui.add'           : 'addBoard',
    'click @ui.show'          : 'toggleMenu',
    'change @ui.boardSelector': 'showBoard',
    'click @ui.exportBtn'     : 'export'
    'click @ui.loadBtn'       : 'initLoad'
    'click @ui.importBtn'     : 'initLoad'
    'change @ui.importer'     : 'handleFile'

  collectionEvents:
    'all': 'render'

  toggleMenu: ->
    this.ui.menu.toggleClass 'is__visible'

  initialize: ->
    menuView        = this
    menuView.reader = reader = new FileReader()
    reader.onloadend   = (e) ->
      data = JSON.parse e.target.result
      if menuView.activeImporter.id is 'load-data'
        Tyto.Utils.loadData data
      else
        Tyto.Utils.importData data

    $('body').on 'click', (e) ->
      if $(e.target).parents('#tyto--menu').length is 0 and menuView.ui.menu.hasClass 'is__visible'
        menuView.toggleMenu()

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

  ###
    Create a new board and show it.
  ###
  addBoard: ->
    this.showBoard Tyto.boardList.create().id

  showBoard: (id) ->
    if typeof id isnt 'string'
      id = this.ui.boardSelector.val()
    Tyto.navigate 'board/' + id,
      trigger: true
    return
