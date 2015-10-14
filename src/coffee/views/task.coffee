module.exports = Backbone.Marionette.ItemView.extend
  tagName        : 'div'

  className      : ->
    this.domAttributes.VIEW_CLASS + this.model.attributes.color

  attributes     : ->
    attr = {}
    attr[this.domAttributes.VIEW_ATTR] = this.model.get 'id'
    attr

  template       : Tyto.TemplateStore.task

  ui:
    deleteTask      : '.tyto-task__delete-task'
    editTask        : '.tyto-task__edit-task'
    trackTask       : '.tyto-task__track-task'
    description     : '.tyto-task__description'
    title           : '.tyto-task__title'
    menu            : '.tyto-task__menu'
    hours           : '.tyto-task__time__hours'
    minutes         : '.tyto-task__time__minutes'
    time            : '.tyto-task__time'
    editDescription : '.tyto-task__description-edit'
    suggestions     : '.tyto-task__suggestions'

  events:
    'click @ui.deleteTask'        : 'deleteTask'
    'click @ui.editTask'          : 'editTask'
    'click @ui.trackTask'         : 'trackTask'
    'blur  @ui.title'             : 'saveTaskTitle'
    'blur  @ui.editDescription'   : 'saveTaskDescription'
    'click @ui.description'       : 'showEditMode'
    ###
      NOTE:: These are functions that are bootstrapped in from
              the 'Suggestions' module.
    ###
    'keypress @ui.editDescription': 'filterItems'
    'keydown @ui.editDescription' : 'filterItems'
    'click @ui.suggestions'       : 'selectSuggestion'

  domAttributes:
    VIEW_CLASS          : 'tyto-task mdl-card mdl-shadow--2dp bg--'
    VIEW_ATTR           : 'data-task-id'
    IS_BEING_ADDED_CLASS: 'is--adding-task'
    COLUMN_CLASS        : '.tyto-column'
    TASK_CONTAINER_CLASS: '.tyto-column__tasks'
    HIDDEN_UTIL_CLASS   : 'is--hidden'
    INDICATOR           : '.indicator'

  getMDLMap: ->
    view = this
    [
      el       : view.ui.menu[0]
      component: 'MaterialMenu'
    ]

  initialize: ->
    view = this
    attr = view.domAttributes
    # Bootstrap "Suggestions" module functions onto view.
    Tyto.Suggestions.bootstrapView view
    view.$el.on Tyto.ANIMATION_EVENT, ->
      $(this).parents(attr.COLUMN_CLASS).removeClass attr.IS_BEING_ADDED_CLASS

  deleteTask: ->
    if confirm Tyto.CONFIRM_MESSAGE
      this.model.destroy()

  onShow: ->
    view = this
    attr = view.domAttributes
    # Handles scrolling to the bottom of a column if necessary so user sees
    # rendering animation on creation.
    container = view.$el.parents(attr.TASK_CONTAINER_CLASS)[0]
    column    = view.$el.parents(attr.COLUMN_CLASS)
    if container.scrollHeight > container.offsetHeight and column.hasClass(attr.IS_BEING_ADDED_CLASS)
      container.scrollTop = container.scrollHeight
    # Upgrade MDL components.
    Tyto.Utils.upgradeMDL view.getMDLMap()

  onRender: ->
    view = this
    view.ui.description.html marked(view.model.get('description'))
    # Sets up auto resizing for text area up to a CSS defined max height.
    Tyto.Utils.autoSize view.ui.editDescription[0]
    Tyto.Utils.renderTime view

  trackTask: (e) ->
    Tyto.Utils.showTimeModal this.model, this

  editTask: (e) ->
    view    = this
    boardId = view.model.get 'boardId'
    taskId  = view.model.id
    editUrl = '#board/' + boardId + '/task/' + taskId
    Tyto.Utils.bloom view.ui.editTask[0], view.model.get('color'), editUrl

  showEditMode: () ->
    domAttributes = this.domAttributes
    model = this.model
    desc  = this.ui.description
    edit  = this.ui.editDescription
    desc.addClass domAttributes.HIDDEN_UTIL_CLASS
    edit.removeClass(domAttributes.HIDDEN_UTIL_CLASS)
      .val(model.get('description'))
      .focus()

  saveTaskDescription: (e) ->
    console.info 'SAVING'
    domAttributes = this.domAttributes
    edit = this.ui.editDescription
    desc = this.ui.description
    edit.addClass domAttributes.HIDDEN_UTIL_CLASS
    desc.removeClass domAttributes.HIDDEN_UTIL_CLASS
    content = edit.val()
    this.model.save
      description: content
    desc.html marked(content)

  saveTaskTitle: ->
    this.model.save
      title: this.ui.title.text().trim()
