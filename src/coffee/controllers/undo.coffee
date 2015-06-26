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
    Tyto.reorder action.view, action.mover, action.model, action.list, action.startPos
    # Here need to reorder the items by their ID attribute.
    # Reordering DOM elements... yay....

    # NOTE this is by no means ideal but gets the job done and steers clear
    # of hellish child view demons that arise when we call view.render()

    action.view.reorder()

    # colHolder = Tyto.boardView.$el.find '.columns'
    # colHolder.empty()
    # theOrder = action.view.collection.sortBy 'ordinal'
    # _.forEach theOrder, (entity, order) ->
    #   window.cV = cV = Tyto.boardView.children.findByModel(entity)
    #   debugger
      # colHolder.append cV.el
      # cV.bindUIElements()

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
    'EDIT-TASK'     : resetProperty

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
