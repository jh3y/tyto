UndoHandler = (UndoHandler, App, Backbone, Marionette) ->
  ###

    ??? Should all undone actions trigger an auto save??

  ###
  addEntity = (a) ->
    idx = a.model.get('ordinal') - 1
    a.collection.add a.model,
      at    : idx
      ignore: true

  putBackCol = (action) ->
    # The approach here is to make the view collection do the heavy lifting
    # Therefore, we pass in an override to the reordering functionality that
    # resets the ordinality of the model to the old starting position.
    view = Tyto.boardView
    cols = view.$el.find '.column'
    Tyto.reorder view, action.el, action.model, cols, action.startPos

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
    'MOVE-COLUMN'   : putBackCol
    'RENAME-COLUMN' : resetProperty
    'ADD-TASK'      : removeEntity
    'REMOVE-TASK'   : addEntity

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
