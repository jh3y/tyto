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


# Instantiate and cache collections.
Tyto.boardList    = new Tyto.Boards.BoardList()
Tyto.columnList   = new Tyto.Columns.ColumnList()
Tyto.taskList     = new Tyto.Tasks.TaskList()

# Used for cacheing current view entities
Tyto.currentBoard = new Tyto.Boards.Board()
Tyto.currentCols  = new Tyto.Columns.ColumnList()
Tyto.currentTasks = new Tyto.Tasks.TaskList()

Tyto.on 'before:start', ->
  Tyto.setRootLayout()

Tyto.on 'start', ->
  Backbone.history.start()
  Tyto.vent.trigger 'history:started'
  return

###
  In a scenario where we are interacting with a live backend, expect to use
  something similar to;

    Tyto.boardList.fetch().done (data) ->
      Tyto.start()

  However, as we are only loading from localStorage, we can reset collections
  based on what is stored in localStorage.
###

Tyto.Utils.load window.localStorage
Tyto.start()
