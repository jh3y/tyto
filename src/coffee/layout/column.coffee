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
      addTask: '.add-task'
      columnName: '#column-name'
    childView: Layout.Task
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
