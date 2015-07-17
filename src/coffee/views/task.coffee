module.exports = Backbone.Marionette.ItemView.extend
  tagName        : 'div'

  className      : ->
    this.domAttributes.TASK_CLASS

  attributes     : ->
    attr = {}
    attr[this.domAttributes.TASK_ATTR] = this.model.get 'id'
    attr

  template       : Tyto.TemplateStore.task

  ui:
    deleteTask   : '.tyto-task__delete-task'
    editTask     : '.tyto-task__edit-task'
    description  : '.tyto-task__description'
    title        : '.tyto-task__title'
  events:
    'click @ui.deleteTask'     : 'deleteTask'
    'click @ui.editTask'       : 'editTask'
    'blur @ui.title'           : 'updateTaskTitle'
    'blur @ui.description'     : 'updateTask'

  domAttributes:
    TASK_CLASS: 'tyto-task bg--yellow mdl-card mdl-shadow--2dp'
    TASK_ATTR : 'data-task-id'

  initialize: ->
    this.$el.on 'animationend webkitAnimationEnd oAnimationEnd', ->
      $(this).parents('.tyto-column').removeClass 'is--adding'

  deleteTask: ->
    this.model.destroy()

  onShow: ->
    tV   = this
    menu = tV.$el.find '.mdl-menu'
    componentHandler.upgradeElement menu[0], 'MaterialMenu'
    container = tV.$el.parents('.tyto-column__tasks')[0]
    column    = tV.$el.parents('.tyto-column')
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
