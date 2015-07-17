# Create app instance
TytoApp     = require './appConfig'
window.Tyto = Tyto = new TytoApp()


# Define template store for views
Tyto.templateStore = require './templates/templates'

# Pull in required modules
TytoCtrl           = require './controllers/tyto'
TytoViews          = require './views/tyto'
TytoModels         = require './models/tyto'
Utils              = require './appUtils'


# Create Modules
Tyto.module 'Models'      , TytoModels
Tyto.module 'Ctrl'        , TytoCtrl
Tyto.module 'Views'       , TytoViews
Tyto.module 'Utils'       , Utils


# Instantiate and cache collections.
Tyto.Boards       = new Tyto.Models.BoardCollection()
Tyto.Columns      = new Tyto.Models.ColumnCollection()
Tyto.Tasks        = new Tyto.Models.TaskCollection()
Tyto.ActiveBoard  = new Tyto.Models.Board()
Tyto.ActiveCols   = new Tyto.Models.ColumnCollection()
Tyto.ActiveTasks  = new Tyto.Models.TaskCollection()


Tyto.on 'before:start', ->
  Tyto.setRootLayout()

Tyto.on 'start', ->
  # Instantiate the app controller and router on start.
  Tyto.Controller        = new Tyto.Ctrl.Controller()
  Tyto.Controller.Router = new Tyto.Ctrl.Router
    controller: Tyto.Controller
  Tyto.Controller.start()
  # Upon controller/router start, start history.
  Backbone.history.start()

###
  In a scenario where we are interacting with a live backend, expect to use
  something similar to;

    Tyto.boardList.fetch().done (data) ->
      Tyto.start()

  However, as we are only loading from localStorage, we can reset collections
  based on what is stored in localStorage.

  For this we use a utility function implementing in the Utils module.
###
Tyto.Utils.load window.localStorage
Tyto.start()
