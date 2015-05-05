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
