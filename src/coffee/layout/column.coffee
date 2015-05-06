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
      todos = _.sortBy this.model.get('todos'), 'ordinal'
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
      self = this
      this.$el.find('.tasks').sortable
        connectWith: '.tasks'
        handle: ".todo--mover"
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
      yap 'adding a task?'
      newTask = new Tyto.Todos.Todo
        id: _.uniqueId()
        ordinal: this.collection.length + 1
      this.collection.add newTask

    deleteColumn: ->
      id = parseInt this.model.get('id'), 10
      this.trigger 'destroy:column', id
      return
