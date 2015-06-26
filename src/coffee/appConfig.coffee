appConfig = Marionette.Application.extend
  navigate: (route, opts) ->
    Backbone.history.navigate route, opts
  setRootLayout: ->
    this.root = new Tyto.Layout.Root()

  ###

    @params
    entity == view
    item   == DOM element that has been moved
    model  == the model that has been moved
    list   == the full DOM list for sortable DOM element
    newPos == useful for overriding the default behaviour(UNDOING MOVES)


    For example; we may have the boardView where a column has been moved.
    The model will be that associated with the moved column and the list
    will be the sortable DOM elements, in this case "columns".

  ###
  reorder: (entity, item, model, list, newPos) ->
    oldPos = model.get 'ordinal'
    newPos = if (newPos) then newPos else list.indexOf(item) + 1

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


  registerAction: (d) ->
    Tyto.vent.trigger 'tyto:action', d
    return

  undoables: new Backbone.Collection(),

  undone: (action) ->
    ###

      ??? Should all undone actions trigger an auto save??

    ###

    removeCol = (action) ->
      Tyto.boardView.collection.remove action.model.id

    addCol    = (action) ->
      idx = action.model.get('ordinal') - 1
      Tyto.boardView.collection.add action.model,
        at: idx

    putBackCol = (action) ->
      # The approach here is to make the view collection do the heavy lifting
      # Therefore, we pass in an override to the reordering functionality that
      # resets the ordinality of the model to the old starting position.
      view = Tyto.boardView
      cols = view.$el.find '.column'
      Tyto.reorder view, action.el, action.model, cols, action.startPos

    renameCol = (action) ->
      # Here we simply need to grab the correct model and reset the name
      # The view should hopefully update for us.
      action.model.set 'title', action.title


    actionsMap =
      'ADD-COLUMN'    : removeCol
      'REMOVE-COLUMN' : addCol
      'MOVE-COLUMN'   : putBackCol
      'RENAME-COLUMN' : renameCol

    if actionsMap[action.action]
      actionsMap[action.action](action)
      true
    else
      false


  undo: ->
    if Tyto.undoables.length > 0
      # Get the last collection item.
      actionToUndo = Tyto.undoables.last()
      # Undo it
      if Tyto.undone actionToUndo.attributes
        # Remove it from the collection
        Tyto.undoables.pop()

  setUndoListener: ->
    Tyto.vent.on 'tyto:action', (e) ->
      console.log Tyto.undoables.add e
    console.info '[tyto] listening for actions...'
    return

  importData: (d) ->
    ###
      When we do an "import", we want to retain the current boards.

      We essentially do the same as load but check IDs so that if there
      are going to be duplicate, we make sure there aren't.

      We also don't have to clear out localStorage.
    ###
    delete d.tyto
    delete d['tyto--board']

    boardIds = window.localStorage['tyto--board'].split ','
    _.forOwn d, (val, key) ->
      console.info key, boardIds
      importBoard = JSON.parse val
      if boardIds.indexOf(importBoard.id) isnt -1
        # If board ID already exists, need to set up new ID for board.
        newId = _.uniqueId()
        importBoard.id = newId
        boardIds.push newId
      window.localStorage['tyto--board-' + importBoard.id] = JSON.stringify importBoard
      Tyto.boardList.add importBoard

    window.localStorage['tyto--board'] = boardIds.toString()

  loadData: (d) ->
    ###
      When we do a "load", we want to wipe the current set up and load in new.
    ###
    Tyto.boardList.reset()
    # wipe the localStorage
    _.forOwn window.localStorage, (val, key) ->
      if key.indexOf('tyto') isnt -1
        window.localStorage.removeItem key
    # repopulate localStorage
    _.forOwn d, (val, key) ->
      window.localStorage.setItem key, val
      # If we have a board we need to populate it into the boardList
      if key.indexOf('tyto--board-') isnt -1
        loadBoard = JSON.parse val
        Tyto.boardList.add loadBoard

    # Need to empty out the current boardView to make way for whatever is chose.
    Tyto.root.getRegion('content').empty()
    Tyto.navigate '/', true

module.exports = appConfig
