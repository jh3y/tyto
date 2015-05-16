module.exports = (Layout, App, Backbone) ->
  Board = require './board'
  Column = require './column'
  CookieBanner = require './cookie'
  Edit = require './edit'
  Menu = require './menu'
  Task = require './task'

  Layout.Root = Backbone.Marionette.LayoutView.extend
    el: '#tyto-app',
    regions:
      header: '#header'
      menu:   '#tyto-menu'
      content: '#tyto-content'
  Layout.Task = Task
  Layout.Column = Column
  Layout.Board = Board
  Layout.Edit = Edit
  Layout.Menu = Menu
  Layout.CookieBanner = CookieBanner
