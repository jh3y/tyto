TaskView         = require './task'
BoardView        = require './board'
ColumnView       = require './column'
EditView         = require './edit'
RootView         = require './root'
MenuView         = require './menu'
SelectView       = require './select'
CookieBannerView = require './cookie'

Views = (Views, App, Backbone) ->
  Views.Root         = RootView
  Views.Task         = TaskView
  Views.Column       = ColumnView
  Views.Board        = BoardView
  Views.Edit         = EditView
  Views.Menu         = MenuView
  Views.Select       = SelectView
  Views.CookieBanner = CookieBannerView

module.exports = Views
