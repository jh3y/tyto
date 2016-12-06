// Create app instance
import TytoApp from './config/tyto';
const Tyto = new TytoApp();

window.Tyto = Tyto;

// Hydrate template store for views
import Templates from './templates/templates';
Tyto.TemplateStore = Templates;

// Import requirements
import TytoCtrl from './controllers/tyto';
import TytoViews from './views/tyto';
import TytoModels from './models/tyto';
import TytoUtils from './utils/utils';
import TytoSuggestions from './utils/suggestions';

Tyto.module('Models', TytoModels);
Tyto.module('Ctrl', TytoCtrl);
Tyto.module('Views', TytoViews);
Tyto.module('Utils', TytoUtils);
Tyto.module('Suggestions', TytoSuggestions);

Tyto.Boards = new Tyto.Models.BoardCollection();
Tyto.Columns = new Tyto.Models.ColumnCollection();
Tyto.Tasks = new Tyto.Models.TaskCollection();
Tyto.ActiveBoard = new Tyto.Models.Board();
Tyto.ActiveCols = new Tyto.Models.ColumnCollection();
Tyto.ActiveTasks = new Tyto.Models.TaskCollection();

Tyto.on('before:start', function() {
  return Tyto.setRootLayout();
});

Tyto.on('start', function() {
  Tyto.__renderer = new marked.Renderer();
  Tyto.__renderer.link = function(href, title, text) {
    var e, out, prot;
    if (this.options.sanitize) {
      try {
        prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g, '').toLowerCase();
      } catch (_error) {
        e = _error;
        return '';
      }
      if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
        return '';
      }
    }
    out = '<a target="_blank" href="' + href + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
  };
  marked.setOptions({
    renderer: Tyto.__renderer
  });
  Tyto.Controller = new Tyto.Ctrl.Controller();
  Tyto.Controller.Router = new Tyto.Ctrl.Router({
    controller: Tyto.Controller
  });
  Tyto.Controller.start();
  return Backbone.history.start();
});


/*
  In a scenario where we are interacting with a live backend, expect to use
  something similar to;

    Tyto.boardList.fetch().done (data) ->
      Tyto.start()

  However, as we are only loading from localStorage, we can reset collections
  based on what is stored in localStorage.

  For this we use a utility function implementing in the Utils module.
 */

Tyto.Utils.load(window.localStorage);
Tyto.start();
