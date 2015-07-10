module.exports = Backbone.Marionette.ItemView.extend
  tagName        : 'div'
  className      : 'tyto--task bg--yellow mdl-card mdl-shadow--2dp'
  attributes     : ->
    id = this.model.get 'id'
    'data-task-id': id
  template       : Tyto.templateStore.task
  ui:
    deleteTask   : '.delete'
    editTask     : '.edit'
    description  : '.tyto--task-description'
    title        : '.tyto--task-title'
  events:
    'click @ui.deleteTask'     : 'deleteTask'
    'click @ui.editTask'       : 'editTask'
    'dblclick @ui.title'       : 'enableEditTaskTitle'
    'blur @ui.title'           : 'updateTaskTitle'
    'dblclick @ui.description' : 'enableEditTask'
    'blur @ui.description'     : 'updateTask'


  initialize: ->
    this.$el.on 'animationend webkitAnimationEnd oAnimationEnd', ->
      $(this).parents('.column').removeClass 'is--adding'

  deleteTask: ->
    this.model.destroy()

  onShow: ->
    yap 'I am actually running?'
    # componentHandler.upgradeDom('MaterialMenu', 'mdl-menu')
    tV = this
    menu = tV.$el.find '.mdl-menu'
    componentHandler.upgradeElement menu[0], 'MaterialMenu'

  editTask: ->
    boardId = this.options.board.id
    taskId  = this.model.id
    yap 'Add a nice transition out from the event target.'
    setTimeout(->
      Tyto.navigate '#board/' + boardId + '/task/' + taskId, true
    , 1000)

  updateTask: ->
    this.ui.description.removeAttr 'contenteditable'
    this.model.save
      description: this.ui.description.text().trim()

  enableEditTask: ->
    this.ui.description.attr('contenteditable', true)
      .focus()

  updateTaskTitle: ->
    this.ui.title.removeAttr 'contenteditable'
    this.model.save
      title: this.ui.title.text().trim()

  enableEditTaskTitle: ->
    this.ui.title.attr('contenteditable', true)
      .focus()
