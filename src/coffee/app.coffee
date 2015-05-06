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


Tyto.on 'before:start', ->
  Tyto.setRootLayout()
