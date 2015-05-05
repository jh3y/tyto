Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Todo = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.todo
    templateHelpers: ->
      view = this
      boardId = view.getOption('board').get 'id'
      boardId: boardId
    ui:
      deleteTodo: '#delete-todo'
      description: '#todo-description'
    events:
      'click @ui.deleteTodo': 'deleteTodo'
      'blur @ui.description': 'updateTodo'
    onRender: ->
      yap 'rendering task'
    deleteTodo: ->
      yap 'removing todo'
      this.trigger 'destroy:todo', this.model
    updateTodo: ->
      this.model.set 'description', this.ui.description.text().trim()


Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Column = Backbone.Marionette.CompositeView.extend
    tagName: 'div'
    className: 'column'
    attributes: ->
      id = this.model.get 'id'
      'data-col-id': id
    template: tytoTmpl.column
    ui:
      deleteColumn: '#delete-column'
      addTask: '.add-todo'
      columnName: '#column-name'
    childView: Layout.Todo
    childViewContainer: '.tasks'
    childViewOptions: ->
      board: this.getOption 'board'

    events:
      'click @ui.deleteColumn': 'deleteColumn'
      'click @ui.addTask': 'addTask'
      'blur @ui.columnName': 'updateName'

    initialize: ->
      todos = this.model.get 'todos'
      this.collection = new Tyto.Todos.TodoList todos
      this.model.set 'todos', this.collection
      this.on 'childview:destroy:todo', (d) ->
        yap 'removing todo'
        this.collection.remove d.model

    onBeforeRender: ->
      newWidth = (100 / this.options.siblings.length) + '%'
      this.$el.css
        width: newWidth

    onRender: ->
      yap 'rendering column'
      this.$el.find('.tasks').sortable
        connectWith: '.tasks'
        handle: ".todo--mover"
        placeholder: "item-placeholder"
        containment: '.columns'
        opacity: 0.8
        revert: true
        start: (event, ui) ->
          yap 'moving item'
        stop: (event, ui) ->
          yap 'item moved'
      return

    updateName: ->
      this.model.set 'title', @ui.columnName.text().trim()

    addTask: ->
      yap 'adding a task?'
      newTask = new Tyto.Todos.Todo
        id: _.uniqueId()
      this.collection.add newTask

    deleteColumn: ->
      id = parseInt this.model.get('id'), 10
      this.trigger 'destroy:column', id
      return

Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Edit = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.edit
    templateHelpers: ->
      boardId: this.options.boardId
      isNew: this.options.isNew

Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Board = Backbone.Marionette.CompositeView.extend
    tagName: 'div'
    className: 'board'
    template: tytoTmpl.board
    childView: Layout.Column
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
      yap 'running this again???'
      board = this
      cols = board.model.get 'columns'
      board.collection = new Tyto.Columns.ColumnList cols

      this.listenTo Tyto.vent, 'setup:localStorage', ->
        this.ui.saveBoard.removeAttr 'disabled'

      board.on 'childview:destroy:column', (id, y) ->
        board.collection.remove y
        newWidth = (100 / board.collection.length) + '%'
        $('.column').css
          width: newWidth
        yap board.collection
        return

    onRender: ->
      yap 'rendering board'
      if window.localStorage and !window.localStorage.tyto
        this.ui.saveBoard.attr 'disabled', true
      this.bindColumns()
    bindColumns: ->
      this.$el.find('.columns').sortable
        connectWith: '.column',
        handle: '.column--mover'
        placeholder: 'column-placeholder'
        axis: "x"
        containment: this.$el.find('.columns')
        opacity: 0.8
        start: (event, ui) ->
          yap 'starting'
        stop: (event, ui) ->
          yap 'stopping'

    addColumn: ->
      newCol = new Tyto.Columns.Column
        id: _.uniqueId()
      this.collection.add newCol
      newWidth = (100 / this.collection.length) + '%'
      yap newWidth
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
