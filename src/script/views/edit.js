const EditView = Backbone.Marionette.ItemView.extend({
  template: function(args) {
    return Tyto.TemplateStore.edit(args);
  },
  className: function() {
    return this.domAttributes.VIEW_CLASS;
  },
  templateHelpers: function() {
    const view = this;
    return {
      selectedColumn: _.findWhere(view.options.columns, {
        id: view.model.get('columnId')
      }),
      board  : this.options.board,
      columns: _.sortBy(this.options.columns, 'attributes.title'),
      isNew  : this.options.isNew,
      colors : Tyto.TASK_COLORS
    };
  },
  domAttributes: {
    VIEW_CLASS       : 'tyto-edit',
    BLOOM_SHOW_CLASS : 'is--showing-bloom',
    EDIT_SHOW_CLASS  : 'is--showing-edit-view',
    MODEL_PROP_ATTR  : 'data-model-prop',
    HIDDEN_UTIL_CLASS: 'is--hidden'
  },
  props: {
    DEFAULT_COLOR_VALUE: 'default'
  },
  ui: {
    save           : '.tyto-edit__save',
    color          : '.tyto-edit__color-select__menu-option',
    taskDescription: '.tyto-edit__task-description',
    editDescription: '.tyto-edit__edit-description',
    suggestions    : '.tyto-task__suggestions',
    taskTitle      : '.tyto-edit__task-title',
    column         : '.tyto-edit__column-select__menu-option',
    colorMenu      : '.tyto-edit__color-select__menu',
    columnMenu     : '.tyto-edit__column-select__menu',
    columnLabel    : '.tyto-edit__task-column',
    track          : '.tyto-edit__track',
    time           : '.tyto-edit__task-time',
    hours          : '.tyto-edit__task-time__hours',
    minutes        : '.tyto-edit__task-time__minutes'
  },
  events: {
    'click @ui.save'           : 'saveTask',
    'click @ui.color'          : 'changeColor',
    'click @ui.column'         : 'changeColumn',
    'click @ui.track'          : 'trackTime',
    'click @ui.taskDescription': 'showEditMode',
    'blur @ui.editDescription' : 'updateTask',
    'blur @ui.taskTitle'       : 'updateTask',
    'keydown @ui.taskTitle'    : 'updateTask',

    /**
      * NOTE:: These are functions that are bootstrapped in from
      * the 'Suggestions' module.
    */
    'keypress @ui.editDescription': 'handleKeyInteraction',
    'keydown @ui.editDescription' : 'handleKeyInteraction',
    'keyup @ui.editDescription'   : 'handleKeyInteraction',
    'click @ui.suggestions'       : 'selectSuggestion'
  },
  initialize: function() {
    const view = this;
    Tyto.Suggestions.bootstrapView(view);
    Tyto.RootView.el.classList.add('bg--' + view.model.get('color'));
    Tyto.RootView.el.classList.remove(view.domAttributes.BLOOM_SHOW_CLASS);
  },
  getMDLMap: function() {
    const view = this;
    return [
      {
        el: view.ui.columnMenu[0],
        component: 'MaterialMenu'
      }, {
        el: view.ui.colorMenu[0],
        component: 'MaterialMenu'
      }
    ];
  },
  handleKeyInteraction: function(e) {
    if (e.which === 27) this.updateTask(e);
    this.filterItems(e);
  },
  updateTask: function(e) {
    const view = this;
    const attr = view.domAttributes;
    const el = e.target;
    const val = (el.nodeName === 'TEXTAREA') ? el.value : el.innerHTML;
    view.model.set(el.getAttribute(attr.MODEL_PROP_ATTR), val);
    if (el.nodeName === 'TEXTAREA') {
      const desc = view.ui.taskDescription;
      const edit = view.ui.editDescription;
      desc.html(marked(edit.val()));
      edit.addClass(attr.HIDDEN_UTIL_CLASS);
      desc.removeClass(attr.HIDDEN_UTIL_CLASS);
    }
    if (e.type === 'keydown' && e.which === 27)
      this.ui.taskTitle.blur();
  },
  onShow: function() {
    Tyto.Utils.upgradeMDL(this.getMDLMap());
  },
  onRender: function() {
    const view = this;
    view.ui.taskDescription.html(marked(view.model.get('description')));
    Tyto.Utils.autoSize(view.ui.editDescription[0]);
    Tyto.Utils.renderTime(view);
  },
  trackTime: function() {
    Tyto.Utils.showTimeModal(this.model, this);
  },
  showEditMode: function() {
    const domAttributes = this.domAttributes;
    const model = this.model;
    const desc = this.ui.taskDescription;
    const edit = this.ui.editDescription;
    desc.addClass(domAttributes.HIDDEN_UTIL_CLASS); edit.removeClass(domAttributes.HIDDEN_UTIL_CLASS)
      .val(model.get('description'))
      .focus();
  },

  /**
    * This is a function for handling fresh tasks and saving them on 'DONE'
  */
  saveTask: function() {
    const view = this;
    const save = function() {
      delete view.model.attributes.id;
      Tyto.Tasks.create(view.model.attributes);
      Tyto.navigate('/board/' + view.options.board.id, true);
    };
    if (view.options.columns.length !== 0 && !view.selectedColumnId) {
      alert('whoah, you need to select a column for that new task');
    } else if (view.options.columns.length !== 0 && view.selectedColumnId) {
      save();
    } else if (view.options.columns.length === 0) {
      const newCol = Tyto.Columns.create({
        boardId: view.options.board.id,
        ordinal: 1
      });
      view.model.set('columnId', newCol.id);
      view.model.set('ordinal', 1);
      save();
    }
  },
  changeColumn: function(e) {
    const view = this;
    const newColumnId = e.target.getAttribute('data-column-id');
    if (newColumnId !== view.model.get('columnId')) {
      view.ui.column.removeClass(Tyto.SELECTED_CLASS);
      e.target.classList.add(Tyto.SELECTED_CLASS);
      const newOrdinal = Tyto.Tasks.where({
        columnId: newColumnId
      }).length + 1;
      view.ui.columnLabel.text(e.target.textContent);
      view.selectedColumnId = newColumnId;
      view.model.set('columnId', newColumnId);
      view.model.set('ordinal', newOrdinal);
    }
  },
  changeColor: function(e) {
    const view = this;
    const newColor = e.target.getAttribute('data-color');
    Tyto.RootView.el.classList.add(view.domAttributes.EDIT_SHOW_CLASS);
    if (newColor !== view.props.DEFAULT_COLOR_VALUE) {
      view.ui.color.removeClass(Tyto.SELECTED_CLASS);
      e.target.classList.add(Tyto.SELECTED_CLASS);
      Tyto.RootView.el.classList.remove('bg--' + view.model.get('color'));
      Tyto.RootView.el.classList.add('bg--' + newColor);
      view.model.set('color', newColor);
    }
  },
  onBeforeDestroy: function() {
    const view = this;
    Tyto.RootView.$el.removeClass('bg--' + view.model.get('color'));
    Tyto.RootView.$el.removeClass(view.domAttributes.EDIT_SHOW_CLASS);
    if (!view.options.isNew) {
      view.model.save();
    }
  }
});

export default EditView;
