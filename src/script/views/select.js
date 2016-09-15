const SelectView = Backbone.Marionette.ItemView.extend({
  template: function(args) {
    return Tyto.TemplateStore.select(args);
  },
  tagName: 'div',
  className: function() {
    return this.domAttributes.VIEW_CLASS;
  },
  ui: {
    add          : '.tyto-select__add-board',
    load         : '.tyto-select__load-intro-board',
    boardSelector: '.tyto-select__board-selector'
  },
  events: {
    'click @ui.add'           : 'addBoard',
    'change @ui.boardSelector': 'showBoard',
    'click @ui.load'          : 'loadIntro'
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-select'
  },
  collectionEvents: {
    'all': 'render'
  },
  addBoard: function() {
    this.showBoard(Tyto.Boards.create().id);
  },
  loadIntro: function() {
    const view = this;
    let id;
    Tyto.RootView.$el.addClass(Tyto.LOADING_CLASS);
    $.getJSON(Tyto.INTRO_JSON_SRC, function(d) {
      Tyto.RootView.$el.removeClass(Tyto.LOADING_CLASS);
      Tyto.Utils.load(d, true, false);
      _.forOwn(d, function(val, key) {
        if (key.indexOf('tyto--board-') !== -1) {
          id = JSON.parse(val).id;
        }
      });
      view.showBoard(id);
    });
  },
  showBoard: function(id) {
    if (typeof id !== 'string') {
      id = this.ui.boardSelector.val();
    }
    Tyto.navigate('board/' + id, {
      trigger: true
    });
  }
});

export default SelectView;
