const TaskView = Backbone.Marionette.ItemView.extend({
  tagName: 'div',
  className: function() {
    return this.domAttributes.VIEW_CLASS + this.model.attributes.color;
  },
  attributes: function() {
    const attr = {};
    attr[this.domAttributes.VIEW_ATTR] = this.model.get('id');
    return attr;
  },
  template: function(args) {
    return Tyto.TemplateStore.task(args);
  },
  ui: {
    deleteTask     : '.tyto-task__delete-task',
    editTask       : '.tyto-task__edit-task',
    trackTask      : '.tyto-task__track-task',
    description    : '.tyto-task__description',
    title          : '.tyto-task__title',
    menu           : '.tyto-task__menu',
    hours          : '.tyto-task__time__hours',
    minutes        : '.tyto-task__time__minutes',
    time           : '.tyto-task__time',
    editDescription: '.tyto-task__description-edit',
    suggestions    : '.tyto-task__suggestions'
  },
  events: {
    'click @ui.deleteTask'     : 'deleteTask',
    'click @ui.editTask'       : 'editTask',
    'click @ui.trackTask'      : 'trackTask',
    'blur  @ui.title'          : 'saveTaskTitle',
    'keydown @ui.title'        : 'saveTaskTitle',
    'blur  @ui.editDescription': 'saveTaskDescription',
    'click @ui.description'    : 'showEditMode',

    /**
      * NOTE:: These are functions that are bootstrapped in from
      * the 'Suggestions' module.
     */
    'keypress @ui.editDescription': 'handleKeyInteraction',
    'keydown @ui.editDescription' : 'handleKeyInteraction',
    'keyup @ui.editDescription'   : 'handleKeyInteraction',
    'click @ui.suggestions'       : 'selectSuggestion'
  },
  domAttributes: {
    VIEW_CLASS          : 'tyto-task mdl-card mdl-shadow--2dp bg--',
    VIEW_ATTR           : 'data-task-id',
    IS_BEING_ADDED_CLASS: 'is--adding-task',
    COLUMN_CLASS        : '.tyto-column',
    TASK_CONTAINER_CLASS: '.tyto-column__tasks',
    HIDDEN_UTIL_CLASS   : 'is--hidden',
    INDICATOR           : '.indicator'
  },
  getMDLMap: function() {
    const view = this;
    return [
      {
        el: view.ui.menu[0],
        component: 'MaterialMenu'
      }
    ];
  },
  handleKeyInteraction: function(e) {
    if (e.which === 27) this.saveTaskDescription();
    this.filterItems(e);
  },
  initialize: function() {
    const view = this;
    const attr = view.domAttributes;
    Tyto.Suggestions.bootstrapView(view);
    view.$el.on(Tyto.ANIMATION_EVENT, function() {
      $(this).parents(attr.COLUMN_CLASS).removeClass(attr.IS_BEING_ADDED_CLASS);
    });
  },
  deleteTask: function() {
    if (confirm(Tyto.CONFIRM_MESSAGE)) {
      this.model.destroy();
    }
  },
  onShow: function() {
    const view = this;
    const attr = view.domAttributes;
    const container = view.$el.parents(attr.TASK_CONTAINER_CLASS)[0];
    const column = view.$el.parents(attr.COLUMN_CLASS);
    if (container.scrollHeight > container.offsetHeight) {
      container.scrollTop = container.scrollHeight;
    }
    Tyto.Utils.upgradeMDL(view.getMDLMap());
  },
  onRender: function() {
    const view = this;
    view.ui.description.html(marked(view.model.get('description')));
    Tyto.Utils.autoSize(view.ui.editDescription[0]);
    Tyto.Utils.renderTime(view);
  },
  trackTask: function(e) {
    Tyto.Utils.showTimeModal(this.model, this);
  },
  editTask: function(e) {
    const view = this;
    const boardId = view.model.get('boardId');
    const taskId = view.model.id;
    const editUrl = `#board/${boardId}/task/${taskId}`;
    Tyto.Utils.bloom(view.ui.editTask[0], view.model.get('color'), editUrl);
  },
  showEditMode: function() {
    const domAttributes = this.domAttributes;
    const model = this.model;
    const desc = this.ui.description;
    const edit = this.ui.editDescription;
    desc.addClass(domAttributes.HIDDEN_UTIL_CLASS);
    edit.removeClass(domAttributes.HIDDEN_UTIL_CLASS)
      .val(model.get('description'))
      .focus();
  },
  saveTaskDescription: function(e) {
    const domAttributes = this.domAttributes;
    const edit = this.ui.editDescription;
    const desc = this.ui.description;
    edit.addClass(domAttributes.HIDDEN_UTIL_CLASS);
    desc.removeClass(domAttributes.HIDDEN_UTIL_CLASS);
    const content = edit.val();
    this.model.save({
      description: content
    });
    desc.html(marked(content));
    this.hideSuggestions();
  },
  saveTaskTitle: function(e) {
    this.model.save({
      title: this.ui.title.text().trim()
    });
    if (e.type === 'keydown' && e.which === 27)
      this.ui.title.blur();
  }
});

export default TaskView;
