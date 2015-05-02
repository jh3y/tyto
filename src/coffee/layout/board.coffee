Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Todo = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.todo
    templateHelpers: ->
      view = this
      boardId = view.getOption('board').get 'id'
      boardId: boardId
    ui:
      deleteTodo: '#delete-todo'
    events:
      'click @ui.deleteTodo': 'deleteTodo'
    deleteTodo: ->
      this.trigger 'destroy:todo', this.model


Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Column = Backbone.Marionette.CompositeView.extend
    tagName: 'div'
    className: 'column'
    template: tytoTmpl.column
    ui:
      deleteColumn: '#delete-column'
      addTask: '#add-todo'
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
        this.collection.remove d.model
    onBeforeRender: ->
      newWidth = (100 / this.options.siblings.length) + '%'
      $('.column').css
        width: newWidth
      this.$el.css
        width: newWidth
    updateName: ->
      this.model.set 'title', @ui.columnName.text().trim()
    addTask: ->
      newTask = new Tyto.Todos.Todo
        id: _.uniqueId()
      this.collection.add newTask
    deleteColumn: ->
      this.trigger 'destroy:column', this.model

Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Edit = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.edit
    templateHelpers: ->
      boardId: this.options.boardId
      isNew: this.options.isNew

Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Board = Backbone.Marionette.CompositeView.extend
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
      cols = this.model.get 'columns'
      this.collection = new Tyto.Columns.ColumnList cols
      this.on 'childview:destroy:column', (d) ->
        this.collection.remove d.model
    addColumn: ->
      newCol = new Tyto.Columns.Column()
      this.collection.add newCol
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
