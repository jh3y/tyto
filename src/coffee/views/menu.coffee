module.exports =  Backbone.Marionette.ItemView.extend
  template: Tyto.TemplateStore.menu
  tagName : 'div'
  className: ->
    this.domAttributes.VIEW_CLASS

  ui:
    addBoardBtn  : '.tyto-menu__add-board'
    exportBtn    : '.tyto-menu__export'
    loadBtn      : '.tyto-menu__load'
    importBtn    : '.tyto-menu__import'
    exporter     : '.tyto-menu__exporter'
    importer     : '.tyto-menu__importer'

  events:
    'click  @ui.addBoardBtn'  : 'addBoard',
    'click  @ui.exportBtn'    : 'exportData'
    'click  @ui.loadBtn'      : 'initLoad'
    'click  @ui.importBtn'    : 'initLoad'
    'change @ui.importer'     : 'handleFile'

  props:
    DOWNLOAD_FILE_NAME: 'barn.json'

  domAttributes:
    VIEW_CLASS: 'tyto-menu'

  onShow: ->
    view        = this
    ###
      The MenuView of Tyto handles the JSON import and export for the
      application making use of the 'Utils' modules' 'load' function.
    ###
    view.reader           = new FileReader()
    view.reader.onloadend = (e) ->
      data = JSON.parse e.target.result
      # Check to see whether 'import' or 'load' has been selected.
      if view.activeImporter.id is view.ui.loadBtn.attr('id')
        Tyto.Utils.load data, false, true
      else
        Tyto.Utils.load data, true, false
      Tyto.navigate '/', true

  handleFile: (e) ->
    view = this
    file = e.target.files[0]
    if (file.type.match 'application/json') or (file.name.indexOf '.json' isnt -1)
      view.reader.readAsText file
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
    view       = this
    anchor     = view.ui.exporter[0]
    exportable = {}
    _.forOwn window.localStorage, (val, key) ->
      if key.indexOf('tyto') isnt -1
        exportable[key] = val
    filename   = view.props.DOWNLOAD_FILE_NAME
    content    = 'data:text/plain,' + JSON.stringify(exportable)

    anchor.setAttribute 'download', filename
    anchor.setAttribute 'href'    , content
    anchor.click()
    return

  addBoard: ->
    Tyto.navigate 'board/' + Tyto.Boards.create().id, true
