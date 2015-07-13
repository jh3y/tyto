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
    delete d['tyto--column']
    delete d['tyto--task']

    altered = {}

    _.forOwn d, (val, key) ->

      if key.indexOf('tyto--board-') isnt -1
        entity = JSON.parse val
        if Tyto.boardList.get(entity.id) isnt `undefined`
          saveId = entity.id
          delete entity.id
        altered[saveId] = Tyto.boardList.create(entity).id

      if key.indexOf('tyto--column-') isnt -1
        entity = JSON.parse val
        if altered[entity.boardId]
          entity.boardId = altered[entity.boardId]
        if Tyto.columnList.get(entity.id) isnt `undefined`
          saveId = entity.id
          delete entity.id
        altered[saveId] = Tyto.columnList.create(entity).id

      if key.indexOf('tyto--task-') isnt -1
        entity = JSON.parse val
        if altered[entity.boardId]
          entity.boardId = altered[entity.boardId]
        if altered[entity.columnId]
          entity.columnId = altered[entity.columnId]
        if Tyto.taskList.get(entity.id) isnt `undefined`
          saveId = entity.id
          delete entity.id
        altered[saveId] = Tyto.taskList.create(entity).id

    Tyto.navigate '/', true


  Utils.loadData = (d) ->
    boards = []
    cols   = []
    tasks  = []

    # wipe the current localStorage
    _.forOwn window.localStorage, (val, key) ->
      if key.indexOf('tyto') isnt -1
        window.localStorage.removeItem key

    # repopulate localStorage
    _.forOwn d, (val, key) ->
      window.localStorage.setItem key, val
      # If we have a board we need to populate it into the boardList
      if key.indexOf('tyto--board-') isnt -1
        boards.push JSON.parse val
      if key.indexOf('tyto--column-') isnt -1
        cols.push JSON.parse val
      if key.indexOf('tyto--task-') isnt -1
        tasks.push JSON.parse val

    ###
      When we do a "load", we want to wipe the current set up and load in new.
    ###
    Tyto.boardList.reset boards
    Tyto.columnList.reset cols
    Tyto.taskList.reset tasks

    Tyto.navigate '/', true



module.exports = Utils
