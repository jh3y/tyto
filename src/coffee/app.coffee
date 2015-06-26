TytoApp     = require './appConfig'
window.Tyto = Tyto = new TytoApp()

Tyto.templateStore = require './templates/templates'

BoardCtrl          = require './controllers/board'
BoardModel         = require './models/boards'
TaskModel          = require './models/tasks'
ColumnModel        = require './models/columns'
TytoLayout         = require './layout/layout'


Tyto.module 'Boards'   , BoardModel
Tyto.module 'Columns'  , ColumnModel
Tyto.module 'Tasks'    , TaskModel
Tyto.module 'BoardList', BoardCtrl
Tyto.module 'Layout'   , TytoLayout

Tyto.on 'before:start', ->
  Tyto.setRootLayout()

Tyto.on 'start', ->
  Backbone.history.start()
  Tyto.vent.trigger 'history:started'
  return

Tyto.boardList = new Tyto.Boards.BoardList()

Tyto.boardList.fetch().done (data) ->
  document.querySelector('.loading').className = ''
  Tyto.start()
  return
