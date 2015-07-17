module.exports =  Backbone.Marionette.ItemView.extend
  template: Tyto.templateStore.menu
  tagName : 'div'
  className: 'tyto-menu'

  ui:
    addBoardBtn  : '#add-board'
    exportBtn    : '#export-data'
    loadBtn      : '#load-data'
    importBtn    : '#import-data'
    exporter     : '#exporter'
    importer     : '#importer'

  events:
    'click  @ui.addBoardBtn'  : 'addBoard',
    'click  @ui.exportBtn'    : 'exportData'
    'click  @ui.loadBtn'      : 'initLoad'
    'click  @ui.importBtn'    : 'initLoad'
    'change @ui.importer'     : 'handleFile'

  properties:
    DOWNLOAD_FILE_NAME: 'barn.json'

  initialize: ->
    menuView        = this
    ###
      The MenuView of Tyto handles the JSON import and export for the
      application making use of the 'Utils' modules' 'load' function.
    ###
    menuView.reader  = reader = new FileReader()
    reader.onloadend = (e) ->
      data = JSON.parse e.target.result
      # Check to see whether 'import' or 'load' has been selected.
      if menuView.activeImporter.id is menuView.ui.loadBtn.attr('id')
        Tyto.Utils.load data, false, true
      else
        Tyto.Utils.load data, true, false

  handleFile: (e) ->
    menuView = this
    file     = e.target.files[0]
    if (file.type.match 'application/json') or (file.name.indexOf '.json' isnt -1)
      menuView.reader.readAsText file
    else
      alert '[tyto] only valid json files allowed'
    return

  initLoad: (e) ->
    this.activeImporter = e.currentTarget
    anchor              = this.ui.importer[0]
    if window.File and window.FileReader and window.FileList and window.Blob
      anchor.click()
    else
      alert '[tyto] Unfortunately the file APIs are not fully supported in your browser'

  exportData: ->
    menuView   = this
    anchor     = menuView.ui.exporter[0]
    exportable = {}
    _.forOwn window.localStorage, (val, key) ->
      if key.indexOf('tyto') isnt -1
        exportable[key] = val
    filename   = menuView.properties.DOWNLOAD_FILE_NAME
    content    = 'data:text/plain,' + JSON.stringify(exportable)

    anchor.setAttribute 'download', filename
    anchor.setAttribute 'href'    , content
    anchor.click()
    return

  addBoard: ->
    Tyto.navigate 'board/' + Tyto.boardList.create().id, true
