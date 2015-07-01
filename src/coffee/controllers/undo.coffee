UndoHandler = (UndoHandler, App, Backbone, Marionette) ->
  ###

    ??? Should all undone actions trigger an auto save??

  ###

  putBack = (action) ->
    # if action.destination and action.start and action.start.id isnt action.destination.id
    #   # Need to send it home first before anything happens.
    #   debugger
    #
    #
    # Tyto.reorder action.view, action.mover, action.model, action.list, action.startPos
    #
    # action.view.reorder()

  resetProperty = (e) ->
    e.model.set e.change,
      ignore: true

  addEntity = (e) ->
    e.model.save()
    e.collection.add e.model,
      at    : e.model.get('ordinal') - 1
      ignore: true

  removeEntity = (e) ->
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


  UndoHandler.isUndone  = isUndone
  UndoHandler.register  = register
  UndoHandler.undo      = undo
  UndoHandler.undoables = undoables

module.exports = UndoHandler
