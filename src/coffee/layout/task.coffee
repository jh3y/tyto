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
    'blur @ui.title'           : 'updateTaskTitle'
    'blur @ui.description'     : 'updateTask'


  initialize: ->
    this.$el.on 'animationend webkitAnimationEnd oAnimationEnd', ->
      $(this).parents('.column').removeClass 'is--adding'

  deleteTask: ->
    this.model.destroy()

  onShow: ->
    tV   = this
    menu = tV.$el.find '.mdl-menu'
    componentHandler.upgradeElement menu[0], 'MaterialMenu'
    container = tV.$el.parents('.tasks')[0]
    column    = tV.$el.parents('.column')
    if container.scrollHeight > container.offsetHeight and column.hasClass('is--adding')
      container.scrollTop = container.scrollHeight

  editTask: ->
    boardId = this.options.board.id
    taskId  = this.model.id
    yap 'Add a nice transition out from the event target.'
    setTimeout(->
      Tyto.navigate '#board/' + boardId + '/task/' + taskId, true
    , 1000)

  updateTask: ->
    this.model.save
      description: this.ui.description.text().trim()

  updateTaskTitle: ->
    this.model.save
      title: this.ui.title.text().trim()
