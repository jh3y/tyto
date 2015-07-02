Utils = (Utils, App, Backbone, Marionette) ->
  ###
    Syncs model 'ordinal' property to that of the DOM representation.

    NOTE :: This shouldn't be doing a loop through the collection using
    model.save. With a proper backend this could be avoided but on
    localStorage it will work with no real performance hit.
  ###
  Utils.reorder = (entity, list, attr) ->
    collection = entity.collection
    _.forEach list, (item, idx) ->
      id    = item.getAttribute attr
      model = collection.get id
      if model
        model.save
          ordinal: idx + 1



  Utils.importData = (d) ->
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

  Utils.loadData = (d) ->
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



module.exports = Utils
