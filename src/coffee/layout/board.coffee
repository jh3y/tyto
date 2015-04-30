Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Todo = Backbone.Marionette.ItemView.extend
    template: tytoTmpl.todo


Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Column = Backbone.Marionette.CompositeView.extend
    template: tytoTmpl.column
    ui:
      deleteColumn: '#delete-column'
      addTask: '#add-todo'
    childView: Layout.Todo
    childViewContainer: '.tasks'
    events:
      'click @ui.deleteColumn': 'deleteColumn'
      'click @ui.addTask': 'addTask'
    initialize: ->
      todos = this.model.get 'todos'
      this.collection = new Tyto.Todos.TodoList todos
    addTask: ->
      console.log 'creating a task'
      newTask = new Tyto.Todos.Todo()
      this.collection.add newTask
    deleteColumn: ->
      this.trigger 'destroy:column', this.model

Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Board = Backbone.Marionette.CompositeView.extend
    template: tytoTmpl.board
    childView: Layout.Column
    childViewContainer: '.columns'
    ui:
      addColumn: '#add-column'
      saveBoard: '#save-board'
      deleteBoard: '#delete-board'
    events:
      'click @ui.addColumn': 'addColumn'
      'click @ui.saveBoard': 'saveBoard'
      'click @ui.deleteBoard': 'deleteBoard'
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
    deleteBoard: ->
      this.model.destroy()
      this.destroy()
      Tyto.navigate '/',
        trigger: true
