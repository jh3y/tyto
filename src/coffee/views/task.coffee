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
    'keypress @ui.editDescription': 'filterItems'
    'keydown @ui.editDescription' : 'filterItems'
    'input @ui.editDescription'   : 'renderIndicator'

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

  # Initiate this when VIEW EDIT MODE is ON...
  renderIndicator: ->
    edit       = this.ui.editDescription
    $indicator = this.$el.find this.domAttributes.INDICATOR
    coords     = Tyto.Utils.getCaretPosition edit[0]
    $indicator.css
      left: coords.LEFT
      top : coords.TOP

  renderSuggestions: (filterString) ->
    view        = this
    edit        = view.ui.editDescription
    props       = view.domAttributes
    suggestions = view.ui.suggestions
    collection  = Tyto.Boards.models.concat Tyto.Tasks.models
    markup      = Tyto.TemplateStore.filterList
      models: collection
    coords = Tyto.Utils.getCaretPosition edit[0]
    view.__EDIT_MODE       = true
    view.__SUGGESTION_TEXT = ''
    view.__EDIT_START      = edit[0].selectionStart
    suggestions.html(markup)
      .css({
        left: coords.LEFT,
        top : coords.TOP
      })
      .removeClass props.HIDDEN_UTIL_CLASS

  hideSuggestions: ->
    view                   = this
    props                  = view.domAttributes
    view.__EDIT_MODE       = false
    view.__SUGGESTION_TEXT = ''
    suggestions            = view.ui.suggestions
    suggestions.addClass props.HIDDEN_UTIL_CLASS

  filterItems: (e) ->
    view        = this
    suggestions = view.ui.suggestions
    props       = view.domAttributes
    edit        = view.ui.editDescription
    # PROCESS PRESSED KEY
    key   = e.which
    switch key
      when 35
        if view.__EDIT_MODE
          view.hideSuggestions()
        else
          before = edit[0].value.charAt(edit[0].selectionStart - 1).trim()
          after  = edit[0].value.charAt(edit[0].selectionStart).trim()
          if before is '' and after is ''
            view.renderSuggestions()
      when 32
        if view.__EDIT_MODE
          view.hideSuggestions()
      when 38, 40
        console.info 'pressing up/down'
      else
        # Add key to string...
        if view.__EDIT_MODE
          # console.info e
        else
          # console.info 'PRESSED SOMETHING...'
          # Let's work out the coordinates.

  saveTaskDescription: ->
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
