import Task from './task';

const ColumnView = Backbone.Marionette.CompositeView.extend({
  tagName: 'div',
  className: function() {
    return this.domAttributes.VIEW_CLASS;
  },
  attributes: function() {
    const attr = {};
    attr[this.domAttributes.VIEW_ATTR] = this.model.get('id');
    return attr;
  },
  template: function(args) {
    return Tyto.TemplateStore.column(args);
  },
  childView: Task,
  childViewContainer: function() {
    return this.domAttributes.CHILD_VIEW_CONTAINER_CLASS;
  },
  events: {
    'click @ui.deleteColumn': 'deleteColumn',
    'click @ui.addTask'     : 'addTask',
    'blur @ui.columnTitle'  : 'updateTitle'
  },
  ui: {
    deleteColumn : '.tyto-column__delete-column',
    addTask      : '.tyto-column__add-task',
    columnTitle  : '.tyto-column__title',
    taskContainer: '.tyto-column__tasks',
    columnMenu   : '.tyto-column__menu'
  },
  collectionEvents: {
    'destroy': 'handleTaskRemoval'
  },
  domAttributes: {
    VIEW_CLASS                : 'tyto-column',
    VIEW_ATTR                 : 'data-col-id',
    PARENT_CONTAINER_CLASS    : '.tyto-board__columns',
    CHILD_VIEW_CONTAINER_CLASS: '.tyto-column__tasks',
    BOARD_CLASS               : '.tyto-board',
    COLUMN_ADD_CLASS          : 'is--adding-column',
    TASK_ADD_CLASS            : 'is--adding-task',
    TASK_ATTR                 : 'data-task-id',
    TASK_CLASS                : '.tyto-task',
    TASK_MOVER_CLASS          : '.tyto-task__mover',
    TASK_PLACEHOLDER_CLASS    : 'tyto-task__placeholder'
  },
  getMDLMap: function() {
    const view = this;
    return [
      {
        el: view.ui.columnMenu[0],
        component: 'MaterialMenu'
      }
    ];
  },
  handleTaskRemoval: function(e) {
    const view = this;
    const attr = view.domAttributes;
    const list = Array.prototype.slice.call(view.$el.find(attr.TASK_CLASS));
    Tyto.Utils.reorder(view, list, attr.TASK_ATTR);
  },
  initialize: function() {
    const view = this;
    const attr = view.domAttributes;
    view.$el.on(Tyto.ANIMATION_EVENT, function() {
      view.$el.parents(attr.BOARD_CLASS).removeClass(attr.COLUMN_ADD_CLASS);
    });
  },
  onBeforeRender: function() {
    this.collection.models = this.collection.sortBy('ordinal');
  },
  bindTasks: function() {
    const view = this;
    const attr = view.domAttributes;
    view.ui.taskContainer.sortable({
      connectWith: attr.CHILD_VIEW_CONTAINER_CLASS,
      handle     : attr.TASK_MOVER_CLASS,
      placeholder: attr.TASK_PLACEHOLDER_CLASS,
      containment: view.domAttributes.PARENT_CONTAINER_CLASS,
      stop: function(event, ui) {
        /**
          * This is most likely the most complicated piece of code in `tyto`.
          *
          * It handles what happens when you move tasks from one column to
          * another.
          *
          * There may be a better way of doing this in a future release, but,
          * essentially we work out if the task is going to move column and if
          * it is we grab an instance of the view associated to the column.
          *
          * We then have to update the tasks' columnID, remove it from it's
          * current collection and add it to the new column collection.
          *
          * Lastly, we need to run our reordering logic to maintain ordinality
          * on page load.
          *
          * NOTE:: Also required to manually upgrade our MDL components here
          * after view/s have rendered.
         */
        let list, destination;
        let model = view.collection.get(ui.item.attr(attr.TASK_ATTR));
        let destinationView = view;
        let newColId = $(ui.item).parents(`[${attr.VIEW_ATTR}]`).attr(attr.VIEW_ATTR);
        if (newColId !== model.get('columnId')) {
          destination = Tyto.Columns.get(newColId);
          destinationView = Tyto.BoardView.children.findByModel(destination);
          list = destinationView.$el.find(attr.TASK_CLASS);
          model.save({
            columnId: newColId
          });
          view.collection.remove(model);
          destinationView.collection.add(model);
          Tyto.Utils.reorder(destinationView, list, attr.TASK_ATTR);
          destinationView.render();
          destinationView.upgradeComponents();
        }
        list = view.$el.find(attr.TASK_CLASS);
        Tyto.Utils.reorder(view, list, attr.TASK_ATTR);
        view.render();
        view.upgradeComponents();
      }
    });
  },
  onShow: function() {
    /**
      * If we are displaying a new column that will be rendered off the page
      * then we need to scroll over in order to see it when it is added.
    */
    const view = this;
    const attr = view.domAttributes;
    const columns = $(attr.PARENT_CONTAINER_CLASS)[0];
    const board = view.$el.parents(attr.BOARD_CLASS);
    if (columns.scrollWidth > window.outerWidth && board.hasClass(attr.COLUMN_ADD_CLASS)) {
      columns.scrollLeft = columns.scrollWidth;
    }
    view.upgradeComponents();
  },
  onRender: function() {
    this.bindTasks();
  },
  upgradeComponents: function() {
    const view = this;
    Tyto.Utils.upgradeMDL(view.getMDLMap());
  },
  updateTitle: function() {
    this.model.save({
      title: this.ui.columnTitle.text()
    });
  },
  addTask: function() {
    const view = this;
    const attr = view.domAttributes;
    this.collection.add(Tyto.Tasks.create({
      columnId: view.model.id,
      boardId : view.options.board.id,
      ordinal : view.collection.length + 1
    }));
    view.$el.addClass(attr.TASK_ADD_CLASS);
  },
  deleteColumn: function() {
    if (this.collection.length === 0 || confirm(Tyto.CONFIRM_MESSAGE)) {
      while (this.collection.length !== 0) {
        this.collection.first().destroy();
      }
      this.model.destroy();
    }
  }
});

export default ColumnView;
