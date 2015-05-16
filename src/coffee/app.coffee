TytoApp = Marionette.Application.extend
  navigate: (route, opts) ->
    Backbone.history.navigate route, opts
  setRootLayout: ->
    this.root = new Tyto.Layout.Root()
  reorder: (entity, item, model, list) ->
    oldPos = model.get 'ordinal'
    newPos = list.indexOf(item) + 1
    if newPos isnt oldPos
      model.set 'ordinal', newPos
      if newPos > oldPos
        _.forEach entity.collection.models, (m) ->
          if m.get('id') isnt model.get('id')
            curOrd = m.get 'ordinal'
            if (curOrd > oldPos and curOrd < newPos) or curOrd is oldPos or curOrd is newPos
              m.set 'ordinal', curOrd - 1
      else
        _.forEach entity.collection.models, (m) ->
          if m.get('id') isnt model.get('id')
            curOrd = m.get 'ordinal'
            if (curOrd > newPos and curOrd < oldPos) or curOrd is newPos or curOrd is oldPos
              m.set 'ordinal', curOrd + 1

window.Tyto = new TytoApp()

Tyto.templateStore = require './templates/templates'
BoardCtrl = require './controllers/board'
BoardModel = require './models/boards'
TaskModel = require './models/tasks'
ColumnModel = require './models/columns'
TytoLayout = require './layout/layout'

Tyto.module 'Boards', BoardModel
Tyto.module 'Columns', ColumnModel
Tyto.module 'Tasks', TaskModel
Tyto.module 'BoardList', BoardCtrl
Tyto.module 'Layout', TytoLayout

Tyto.on 'before:start', ->
  Tyto.setRootLayout()

Tyto.on 'start', ->
  Backbone.history.start()
  Tyto.vent.trigger 'history:started'
  return

Tyto.boardList = new Tyto.Boards.BoardList()
Tyto.boardList.fetch().done (data) ->
  document.body.className = ''
  Tyto.start()
  return
