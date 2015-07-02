Task = require './task'

module.exports = Backbone.Marionette.CompositeView.extend
  tagName   : 'div'
  className : 'column'
  attributes: ->
    id = this.model.get 'id'
    'data-col-id': id
  template  : Tyto.templateStore.column
  childView : Task
  childViewContainer: '.tasks'
  events    :
    'click @ui.deleteColumn': 'deleteColumn'
    'click @ui.addTask'     : 'addTask'
    'blur @ui.columnName'   : 'updateName'
  ui        :
    deleteColumn: '#delete-column'
    addTask     : '.add-task'
    columnName  : '#column-name'

  childViewOptions: ->
    board    : this.getOption 'board'
    column   : this

  initialize: ->

  onBeforeRender: ->
    this.collection.models = this.collection.sortBy 'ordinal'
    newWidth = (100 / this.options.siblings.length) + '%'
    this.$el.css
      width: newWidth

  onRender: ->
    self        = this
    this.$el.find('.tasks').sortable
      connectWith: '.tasks',
      placeholder: 'item-placeholder'
      containment: '.columns'
      opacity    : 0.8
      stop       : (event, ui) ->
        model           = self.collection.get ui.item.attr('data-task-id')
        destinationView = self
        newColId        = $(ui.item).parents('[data-col-id]').attr('data-col-id')

        if newColId isnt model.get 'columnId'
          destination     = Tyto.columnList.get newColId
          destinationView = Tyto.boardView.children.findByModel destination
          list            = destinationView.$el.find '.tyto--task'
          model.save
            columnId: newColId
          self.collection.remove model
          destinationView.collection.add model
          Tyto.Utils.reorder destinationView, list, 'data-task-id'
          destinationView.render()

        list        = self.$el.find '.tyto--task'
        Tyto.Utils.reorder self, list, 'data-task-id'
        self.render()

    return

  updateName: ->
    this.model.save
      title: this.ui.columnName.text().trim()

  addTask: ->
    columnView = this

    this.collection.add Tyto.taskList.create
      columnId: columnView.model.id
      boardId : columnView.options.board.id
      ordinal : columnView.collection.length + 1

  deleteColumn: ->
    # Here need to iterate over the tasks and destroy them all.
    if confirm 'are you sure????'
      while this.collection.length isnt 0
        this.collection.first().destroy()
      # this.collection.forEach (taskModel) ->
      #   taskModel.destroy()
      this.model.destroy()
