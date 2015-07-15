# Create app instance
TytoApp     = require './appConfig'
window.Tyto = Tyto = new TytoApp()


# Define template store for views
Tyto.templateStore = require './templates/templates'

# Pull in required modules
BoardCtrl          = require './controllers/board'
BoardModel         = require './models/boards'
TaskModel          = require './models/tasks'
ColumnModel        = require './models/columns'
TytoLayout         = require './layout/layout'
Utils              = require './appUtils'


# Create entities
Tyto.module 'Boards'      , BoardModel
Tyto.module 'Columns'     , ColumnModel
Tyto.module 'Tasks'       , TaskModel


Tyto.module 'BoardList'   , BoardCtrl
Tyto.module 'Layout'      , TytoLayout
Tyto.module 'Utils'       , Utils

Tyto.on 'before:start', ->
  Tyto.setRootLayout()

Tyto.on 'start', ->
  Backbone.history.start()

  # TODO: This needs to be moved into the event handling code for clicking the
  # button. Add a document event listener on click that removes it if the el isn't clicked but is open
  $('body').on 'click', (e) ->
    if $(e.target).parents('.actions--primary').length is 0 and $('.actions--primary').hasClass 'is__showing_options'
      $('.actions--primary').toggleClass 'is__showing_options'

  Tyto.vent.trigger 'history:started'
  return


# Instantiate new controller instance, fetching data for it before starting
# application.

# Instantiate and cache collections.
Tyto.boardList    = new Tyto.Boards.BoardList()
Tyto.columnList   = new Tyto.Columns.ColumnList()
Tyto.taskList     = new Tyto.Tasks.TaskList()

# Used for cacheing current view entities
Tyto.currentCols  = new Tyto.Columns.ColumnList()
Tyto.currentTasks = new Tyto.Columns.ColumnList()


# fetch shouldn't really be used to bootstrap the collection but as
# Backbone.localStorage is being used, it's viable.
# We only need the boards as we will grab the boards and tasks when needed.
Tyto.boardList.fetch().done (data) ->
  Tyto.columnList.fetch().done (data) ->
    Tyto.taskList.fetch().done (data) ->
      Tyto.start()
      return
