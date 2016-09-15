const MenuView = Backbone.Marionette.ItemView.extend({
  template: function(args) {
    return Tyto.TemplateStore.menu(args);
  },
  tagName: 'div',
  className: function() {
    return this.domAttributes.VIEW_CLASS;
  },
  ui: {
    addBoardBtn: '.tyto-menu__add-board',
    exportBtn  : '.tyto-menu__export',
    loadBtn    : '.tyto-menu__load',
    importBtn  : '.tyto-menu__import',
    deleteBtn  : '.tyto-menu__delete-save',
    exporter   : '.tyto-menu__exporter',
    importer   : '.tyto-menu__importer',
    action     : 'button'
  },
  events: {
    'click  @ui.addBoardBtn': 'addBoard',
    'click  @ui.exportBtn'  : 'exportData',
    'click  @ui.deleteBtn'  : 'deleteAppData',
    'click  @ui.loadBtn'    : 'initLoad',
    'click  @ui.importBtn'  : 'initLoad',
    'click  @ui.action'     : 'restoreContent',
    'change @ui.importer'   : 'handleFile'
  },
  props: {
    DOWNLOAD_FILE_NAME: 'barn.json'
  },
  domAttributes: {
    VIEW_CLASS        : 'tyto-menu',
    MENU_VISIBLE_CLASS: 'is-visible'
  },
  onShow: function() {
    const view = this;
    /**
      * The MenuView of Tyto handles the JSON import and export for the
      * application making use of the 'Utils' modules' 'load' function.
    */
    view.reader = new FileReader();
    view.reader.onloadend = function(e) {
      const data = JSON.parse(e.target.result);
      if (view.activeImporter.id === view.ui.loadBtn.attr('id')) {
        Tyto.Utils.load(data, false, true);
      } else {
        Tyto.Utils.load(data, true, false);
      }
      Tyto.navigate('/', true);
    };
  },
  restoreContent: function() {
    const props = this.domAttributes;
    const $visibles = Tyto.RootView.getRegion('Menu').$el.parent().find(`.${props.MENU_VISIBLE_CLASS}`);
    $visibles.removeClass(props.MENU_VISIBLE_CLASS);
  },
  handleFile: function(e) {
    const view = this;
    const file = e.target.files[0];
    if ((file.type.match('application/json')) || (file.name.indexOf('.json' !== -1))) {
      view.reader.readAsText(file);
      this.ui.importer[0].value = null;
    } else {
      alert('[tyto] only valid json files allowed');
    }
  },
  initLoad: function(e) {
    this.activeImporter = e.currentTarget;
    const anchor = this.ui.importer[0];
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      anchor.click();
    } else {
      alert('[tyto] Unfortunately the file APIs are not fully supported in your browser');
    }
  },
  exportData: function() {
    const view = this;
    const anchor = view.ui.exporter[0];
    const exportable = {};
    _.forOwn(window.localStorage, function(val, key) {
      if (key.indexOf('tyto') !== -1) {
        return exportable[key] = val;
      }
    });
    const filename = view.props.DOWNLOAD_FILE_NAME;
    const content = `data:text/plain,${JSON.stringify(exportable)}`;
    anchor.setAttribute('download', filename);
    anchor.setAttribute('href', content);
    anchor.click();
  },
  deleteAppData: function() {
    _.forOwn(window.localStorage, function(val, key) {
      if (key.indexOf('tyto') !== -1 && key !== 'tyto') {
        return window.localStorage.removeItem(key);
      }
    });
    Tyto.Boards.reset();
    Tyto.Columns.reset();
    Tyto.Tasks.reset();
    Tyto.navigate('/', true);
  },
  addBoard: function() {
    Tyto.navigate('board/' + Tyto.Boards.create().id, true);
  }
});

export default MenuView;
