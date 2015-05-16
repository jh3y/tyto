module.exports = (Layout, App, Backbone) ->

  Layout.Root = Backbone.Marionette.LayoutView.extend
    el: '#tyto-app',
    regions:
      header: '#header'
      menu:   '#tyto-menu'
      content: '#tyto-content'

  # TASK
  Layout.Task = Backbone.Marionette.ItemView.extend
    tagName: 'div'
    className: 'task'
    attributes: ->
      id = this.model.get 'id'
      'data-task-id': id
    template: Tyto.templateStore.task
    templateHelpers: ->
      view = this
      boardId = view.getOption('board').get 'id'
      boardId: boardId
    ui:
      deleteTask: '#delete-task'
      description: '#task-description'
    events:
      'click @ui.deleteTask': 'deleteTask'
      'blur @ui.description': 'updateTask'

    deleteTask: ->
      this.trigger 'destroy:task', this.model.get('id')

    updateTask: ->
      this.model.set 'description', this.ui.description.text().trim()


  # COLUMN

  Layout.Column = Backbone.Marionette.CompositeView.extend
    tagName: 'div'
    className: 'column'
    attributes: ->
      id = this.model.get 'id'
      'data-col-id': id
    template: Tyto.templateStore.column
    ui:
      deleteColumn: '#delete-column'
      addTask: '.add-task'
      columnName: '#column-name'
    childView: Tyto.Layout.Task
    childViewContainer: '.tasks'
    childViewOptions: ->
      board: this.getOption 'board'

    events:
      'click @ui.deleteColumn': 'deleteColumn'
      'click @ui.addTask': 'addTask'
      'blur @ui.columnName': 'updateName'

    initialize: ->
      tasks = _.sortBy this.model.get('tasks'), 'ordinal'
      this.collection = new Tyto.Tasks.TaskList tasks
      this.model.set 'tasks', this.collection
      this.on 'childview:destroy:task', (mod, id) ->
        this.collection.remove id

    onBeforeRender: ->
      newWidth = (100 / this.options.siblings.length) + '%'
      this.$el.css
        width: newWidth

    onRender: ->
      yap 'rendering column'
      self = this
      this.$el.find('.tasks').sortable
        connectWith: '.tasks'
        handle: ".task--mover"
        placeholder: "item-placeholder"
        containment: '.columns'
        opacity: 0.8
        revert: true
        stop: (event, ui) ->
          mover = ui.item[0]
          taskModel = self.collection.get ui.item.attr('data-task-id')
          taskList = Array.prototype.slice.call self.$el.find '.task'
          Tyto.reorder self, mover, taskModel, taskList

      return

    updateName: ->
      this.model.set 'title', @ui.columnName.text().trim()

    addTask: ->
      newTask = new Tyto.Tasks.Task
        id: _.uniqueId()
        ordinal: this.collection.length + 1
      this.collection.add newTask

    deleteColumn: ->
      id = parseInt this.model.get('id'), 10
      this.trigger 'destroy:column', id
      return

  # BOARD

  Layout.Board =  Backbone.Marionette.CompositeView.extend
    tagName: 'div'
    className: 'board'
    template: Tyto.templateStore.board
    childView: Tyto.Layout.Column
    childViewContainer: '.columns'
    childViewOptions: ->
      board: this.model
      siblings: this.collection
    ui:
      addColumn: '#add-column'
      saveBoard: '#save-board'
      deleteBoard: '#delete-board'
      wipeBoard: '#wipe-board'
      boardName: '#board-name'
    events:
      'click @ui.addColumn': 'addColumn'
      'click @ui.saveBoard': 'saveBoard'
      'click @ui.deleteBoard': 'deleteBoard'
      'click @ui.wipeBoard': 'wipeBoard'
      'blur @ui.boardName': 'updateName'

    initialize: ->
      board = this
      cols = _.sortBy board.model.get('columns'), 'ordinal'
      board.collection = new Tyto.Columns.ColumnList cols

      this.listenTo Tyto.vent, 'setup:localStorage', ->
        this.ui.saveBoard.removeAttr 'disabled'

      board.on 'childview:destroy:column', (mod, id) ->
        board.collection.remove id
        newWidth = (100 / board.collection.length) + '%'
        $('.column').css
          width: newWidth
        return

    onRender: ->
      if window.localStorage and !window.localStorage.tyto
        this.ui.saveBoard.attr 'disabled', true
      this.bindColumns()

    bindColumns: ->
      self = this
      this.$el.find('.columns').sortable
        connectWith: '.column',
        handle: '.column--mover'
        placeholder: 'column-placeholder'
        axis: "x"
        containment: this.$el.find('.columns')
        opacity: 0.8
        stop: (event, ui) ->
          mover = ui.item[0]
          columnModel = self.collection.get ui.item.attr('data-col-id')
          columnList = Array.prototype.slice.call self.$el.find '.column'
          Tyto.reorder self, mover, columnModel, columnList

    addColumn: ->
      newCol = new Tyto.Columns.Column
        id: _.uniqueId()
        ordinal: this.collection.length + 1
      this.collection.add newCol
      newWidth = (100 / this.collection.length) + '%'
      $('.column').css
        width: newWidth

    saveBoard: ->
      this.model.set 'columns', this.collection
      this.model.save()

    updateName: ->
      this.model.set 'title', @ui.boardName.text().trim()

    deleteBoard: ->
      this.model.destroy()
      this.destroy()
      Tyto.navigate '/',
        trigger: true

    wipeBoard: ->
      this.collection.reset()
      return

  # EDIT

  Layout.Edit = Backbone.Marionette.ItemView.extend
    template: Tyto.templateStore.edit
    templateHelpers: ->
      boardId: this.options.boardId
      isNew: this.options.isNew
    initialize: ->
      yap this.model

  Layout.Menu = Backbone.Marionette.ItemView.extend
    template: Tyto.templateStore.menu
    ui:
      add: '#add-board'
      boardSelector: '#board-selector'
    events:
      'click @ui.add': 'addBoard',
      'change @ui.boardSelector': 'showBoard'
    collectionEvents:
      'all': 'render'
    addBoard: ->
      newBoard = new Tyto.Boards.Board
        id: _.uniqueId()
      Tyto.boardList.add newBoard
      this.showBoard newBoard.get('id')
      return
    showBoard: (id) ->
      if typeof id isnt 'string'
        id = this.ui.boardSelector.val()
      Tyto.navigate 'board/' + id,
        trigger: true
      return

  Layout.CookieBanner = Backbone.Marionette.ItemView.extend
    template: Tyto.templateStore.cookieBanner
    ui:
      accept: '#accept-cookies'
    events:
      'click @ui.accept': 'acceptCookies'
    acceptCookies: ->
      Tyto.vent.trigger 'setup:localStorage'
