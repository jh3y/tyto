import Column from './column';

const BoardView = Backbone.Marionette.CompositeView.extend({
  tagName: 'div',
  className: function() {
    return this.domAttributes.VIEW_CLASS;
  },
  template: function(args) {
    return Tyto.TemplateStore.board(args);
  },
  templateHelpers: function() {
    return {
      boards: Tyto.Boards
    };
  },
  childView: Column,
  childViewContainer: function() {
    return this.domAttributes.CHILD_VIEW_CONTAINER_CLASS;
  },
  childViewOptions: function(c) {
    const view = this;
    const colTasks = Tyto.ActiveTasks.where({
      columnId: c.id
    });
    return {
      collection: new Tyto.Models.TaskCollection(colTasks),
      board: view.model
    };
  },
  ui: {
    addEntity      : '.tyto-board__add-entity',
    primaryActions : '.tyto-board__actions',
    boardMenu      : '.tyto-board__menu',
    boardSelect    : '.tyto-board__selector__menu',
    addColumn      : '.tyto-board__add-column',
    addTask        : '.tyto-board__super-add',
    deleteBoard    : '.tyto-board__delete-board',
    wipeBoard      : '.tyto-board__wipe-board',
    emailBoard     : '.tyto-board__email-board',
    emailer        : '.tyto-board__emailer',
    boardName      : '.tyto-board__title',
    columnContainer: '.tyto-board__columns',
    bloomer        : '.tyto-board__bloomer'
  },
  collectionEvents: {
    'destroy': 'handleColumnRemoval'
  },
  domAttributes: {
    VIEW_CLASS                : 'tyto-board',
    CHILD_VIEW_CONTAINER_CLASS: '.tyto-board__columns',
    COLUMN_CLASS              : '.tyto-column',
    COLUMN_ATTR               : 'data-col-id',
    COLUMN_MOVER_CLASS        : '.tyto-column__mover',
    COLUMN_PLACEHOLDER_CLASS  : 'tyto-column__placeholder',
    FAB_MENU_VISIBLE_CLASS    : 'is-showing-options',
    ADDING_COLUMN_CLASS       : 'is--adding-column'
  },
  getMDLMap: function() {
    const view = this;
    return [
      {
        el: view.ui.boardMenu[0],
        component: 'MaterialMenu'
      }, {
        el: view.ui.boardSelect[0],
        component: 'MaterialMenu'
      }
    ];
  },
  handleColumnRemoval: function() {
    const view = this;
    const list = view.$el.find(view.domAttributes.COLUMN_CLASS);
    Tyto.Utils.reorder(view, list, view.domAttributes.COLUMN_ATTR);
  },
  events: {
    'click @ui.addEntity'  : 'showPrimaryActions',
    'click @ui.addColumn'  : 'addNewColumn',
    'click @ui.addTask'    : 'addNewTask',
    'click @ui.deleteBoard': 'deleteBoard',
    'click @ui.wipeBoard'  : 'wipeBoard',
    'click @ui.emailBoard' : 'emailBoard',
    'blur @ui.boardName'   : 'saveBoardName'
  },
  showPrimaryActions: function(e) {
    const view = this;
    const ctn = view.ui.primaryActions[0];
    const btn = view.ui.addEntity[0];
    const fabVisibleClass = view.domAttributes.FAB_MENU_VISIBLE_CLASS;
    const processClick = function(evt) {
      if (e.timeStamp !== evt.timeStamp) {
        ctn.classList.remove(fabVisibleClass);
        ctn.IS_SHOWING_MENU = false;
        document.removeEventListener('click', processClick);
      }
    };
    if (!ctn.IS_SHOWING_MENU) {
      ctn.IS_SHOWING_MENU = true;
      ctn.classList.add(fabVisibleClass);
      document.addEventListener('click', processClick);
    }
  },
  onBeforeRender: function() {
    this.collection.models = this.collection.sortBy('ordinal');
  },
  onShow: function() {
    /**
      * Have to upgrade MDL components onShow.
    */
    const view = this;
    Tyto.Utils.upgradeMDL(view.getMDLMap());
  },
  onRender: function() {
    /**
      * As with manually upgrading MDL, need to invoke jQuery UI sortable
      * function on render.
    */
    this.bindColumns();
  },
  bindColumns: function() {
    const view = this;
    const attr = view.domAttributes;
    view.ui.columnContainer.sortable({
      connectWith: attr.COLUMN_CLASS,
      handle     : attr.COLUMN_MOVER_CLASS,
      placeholder: attr.COLUMN_PLACEHOLDER_CLASS,
      axis       : "x",
      containment: view.$childViewContainer,
      stop       : function(event, ui) {
        const list = Array.prototype.slice.call(view.$el.find(attr.COLUMN_CLASS));
        Tyto.Utils.reorder(view, list, attr.COLUMN_ATTR);
      }
    });
  },
  addNewColumn: function() {
    const view = this;
    const board = view.model;
    view.$el.addClass(view.domAttributes.ADDING_COLUMN_CLASS);
    const columns = view.collection;
    columns.add(Tyto.Columns.create({
      boardId: board.id,
      ordinal: columns.length + 1
    }));
  },
  saveBoardName: function() {
    this.model.save({
      title: this.ui.boardName.text().trim()
    });
  },
  addNewTask: function() {
    const view = this;
    const board = view.model;
    const id = _.uniqueId();
    const addUrl = `#board/${board.id}/task/${id}?isFresh=true`;
    Tyto.Utils.bloom(view.ui.addTask[0], Tyto.DEFAULT_TASK_COLOR, addUrl);
  },
  deleteBoard: function() {
    const view = this;
    if (view.collection.length === 0 || confirm(Tyto.CONFIRM_MESSAGE)) {
      view.wipeBoard();
      view.model.destroy();
      view.destroy();
      Tyto.navigate('/', {
        trigger: true
      });
    }
  },
  wipeBoard: function(dontConfirm) {
    const view = this;
    const wipe = function() {
      view.children.forEach(function(colView) {
        while (colView.collection.length !== 0) {
          colView.collection.first().destroy();
        }
        colView.model.destroy();
      });
    };
    if (dontConfirm) {
      if (confirm('[tyto] are you sure you wish to wipe the board?')) {
        wipe();
      }
    } else {
      wipe();
    }
  },
  emailBoard: function() {
    const view = this;
    const emailContent = Tyto.Utils.getEmailContent(view.model);
    this.ui.emailer.attr('href', emailContent);
    this.ui.emailer[0].click();
  }
});

export default BoardView;
