UndoHandler = (UndoHandler, App, Backbone, Marionette) ->
  UndoHandler.undoables = []

  UndoHandler.register = (d) ->
    this.undoables.push d

  UndoHandler.undone = (action) ->
    ###

      ??? Should all undone actions trigger an auto save??

    ###

    addEntity    = (e) ->
      idx = e.model.get('ordinal') - 1
      e.collection.add e.model,
        at: idx

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
      e.model.set e.property, e.val


    removeEntity = (e) ->
      e.collection.remove e.id

    actionsMap =
      'ADD-COLUMN'    : removeEntity
      'REMOVE-COLUMN' : addEntity
      'MOVE-COLUMN'   : putBackCol
      'RENAME-COLUMN' : resetProperty
      'ADD-TASK'      : removeEntity
      'REMOVE-TASK'   : addEntity

    if actionsMap[action.action]
      actionsMap[action.action](action)
      true
    else
      false


  UndoHandler.undo = ->
    if this.undoables.length > 0
      # Get the last collection item.
      actionToUndo = this.undoables[this.undoables.length - 1]
      # Undo it
      if this.undone actionToUndo
        # Remove it from the collection
        this.undoables.pop()

module.exports = UndoHandler
