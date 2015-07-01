UndoHandler = (UndoHandler, App, Backbone, Marionette) ->
  ###

    ??? Should all undone actions trigger an auto save??

  ###

  putBack = (action) ->
    nP    = action.model.get 'ordinal' - 1
    oP    = action.oldPos - 1
    mover = action.list.splice nP, 1

    action.list.splice oP, 0, mover[0]
    Tyto.reorder action.view, action.list, action.attr
    action.view.render()


  resetProperty = (e) ->
    e.model.set e.change,
      ignore: true
    e.model.save()

  addEntity = (e) ->
    e.model.save()
    e.collection.add e.model,
      at    : e.model.get('ordinal') - 1
      ignore: true

  removeEntity = (e) ->
    e.collection.remove e.model,
      ignore: true
    e.model.destroy()
  # END UNDO OPS


  actionsMap =
    'ADD-COLUMN'    : removeEntity
    'REMOVE-COLUMN' : addEntity
    'MOVE-COLUMN'   : putBack
    'EDIT-COLUMN'   : resetProperty
    'ADD-TASK'      : removeEntity
    'REMOVE-TASK'   : addEntity
    'EDIT-TASK'     : resetProperty
    'MOVE-TASK'     : putBack

  undoables = []

  register = (a) ->
    if actionsMap[a.action]
      undoables.push a
    console.log undoables.length

  isUndone = (action) ->
    if actionsMap[action.action]
      actionsMap[action.action](action)
      true
    else
      false

  undo      = ->
    if undoables.length > 0
      # Get the last collection item.
      actionToUndo = undoables[undoables.length - 1]
      # Undo it
      if isUndone actionToUndo
        # Remove it from the collection
        undoables.pop()
    console.log undoables.length


  UndoHandler.isUndone  = isUndone
  UndoHandler.register  = register
  UndoHandler.undo      = undo
  UndoHandler.undoables = undoables

module.exports = UndoHandler
