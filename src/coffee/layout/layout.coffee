TaskView         = require './task'
BoardView        = require './board'
ColumnView       = require './column'
EditView         = require './edit'
RootView         = require './root'
MenuView         = require './menu'
SelectView       = require './select'
CookieBannerView = require './cookie'

module.exports = (Layout, App, Backbone) ->
  Layout.Root         = RootView
  Layout.Task         = TaskView
  Layout.Column       = ColumnView
  Layout.Board        = BoardView
  Layout.Edit         = EditView
  Layout.Menu         = MenuView
  Layout.Select       = SelectView
  Layout.CookieBanner = CookieBannerView
