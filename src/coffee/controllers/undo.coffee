UndoHandler = (UndoHandler, App, Backbone, Marionette) ->
  ###

    ??? Should all undone actions trigger an auto save??

  ###
  addEntity = (a) ->
    if a.children
      # Safety catch for child views that need to be casted back to plain
      # data objects before they can be rendered.
      a.model.set a.children, a.model.get(a.children).models
    idx = a.model.get('ordinal') - 1
    col = a.model.clone()
    a.collection.add col,
      at    : idx
      ignore: true

  putBack = (action) ->
    if action.destination and action.start and action.start.id isnt action.destination.id
      # Need to send it home first before anything happens.
      debugger


    Tyto.reorder action.view, action.mover, action.model, action.list, action.startPos

    action.view.reorder()

  resetProperty = (e) ->
    # Here we simply need to grab the correct model and reset the name
    # The view should hopefully update for us.
    e.model.set e.property, e.val,
      ignore: true

  removeEntity = (e) ->
    e.collection.remove e.id,
      ignore: true
  # END UNDO OPS


  actionsMap =
    'ADD-COLUMN'    : removeEntity
    'REMOVE-COLUMN' : addEntity
    'MOVE-COLUMN'   : putBack
    'RENAME-COLUMN' : resetProperty
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
