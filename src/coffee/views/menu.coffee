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
    deleteBtn    : '.tyto-menu__delete-save'
    exporter     : '.tyto-menu__exporter'
    importer     : '.tyto-menu__importer'
    action       : 'button'

  events:
    'click  @ui.addBoardBtn'  : 'addBoard'
    'click  @ui.exportBtn'    : 'exportData'
    'click  @ui.deleteBtn'    : 'deleteAppData'
    'click  @ui.loadBtn'      : 'initLoad'
    'click  @ui.importBtn'    : 'initLoad'
    'click  @ui.action'       : 'restoreContent'
    'change @ui.importer'     : 'handleFile'

  props:
    DOWNLOAD_FILE_NAME: 'barn.json'

  domAttributes:
    VIEW_CLASS        : 'tyto-menu'
    MENU_VISIBLE_CLASS: 'is-visible'

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

  restoreContent: ->
    props = this.domAttributes
    Tyto.RootView.getRegion('Menu').$el.removeClass props.MENU_VISIBLE_CLASS
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

  deleteAppData: ->
    # Need to wipe data app wide and proceed to route.
    # Wipe localStorage records
    _.forOwn window.localStorage, (val, key) ->
      if key.indexOf('tyto') isnt -1 and key isnt 'tyto'
        window.localStorage.removeItem key
    # Wipe app-wide collections.
    Tyto.Boards.reset()
    Tyto.Columns.reset()
    Tyto.Tasks.reset()
    # Redirect to root.
    Tyto.navigate '/', true

  addBoard: ->
    Tyto.navigate 'board/' + Tyto.Boards.create().id, true
