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
    deleteTodo: ->
      this.trigger 'destroy:todo', this.model
    updateTodo: ->
      this.model.set 'description', this.ui.description.text().trim()


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
    onRender: ->
      this.$el.find('.tasks').sortable
        connectWith: '.tasks'
        handle: ".todo--mover"
        placeholder: "item-placeholder"
        containment: '.columns'
        opacity: 0.8
        revert: true
        start: (event, ui) ->
          yap 'moving item'
          # tyto._movedItem = $ ui.item
          # tyto._movedItemOrigin = $ event.currentTarget
          # itemList = Array.prototype.slice.call(
          #   $column.find('.items')
          #     .children '.tyto-item'
          # )
          # tyto._movedItemIndex = itemList.indexOf $(ui.item)[0]
        stop: (event, ui) ->
          yap 'item moved'
          # tyto.element.trigger
          #   type: 'tyto:action',
          #   name: 'move-item',
          #   DOMcolumn: tyto._movedItemOrigin,
          #   DOMitem: tyto._movedItem,
          #   itemIndex: tyto._movedItemIndex
          # tyto.notify 'item moved', 2000
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
      cols = this.model.get 'columns'
      this.collection = new Tyto.Columns.ColumnList cols
      this.on 'childview:destroy:column', (d) ->
        this.collection.remove d.model
      # this.setUpColumnInteraction()
    onRender: ->
      yap 'rendering'
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
