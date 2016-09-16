/*
tyto - http://jh3y.github.io/tyto
Licensed under the MIT license

jh3y (c) 2015

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function() { (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _tyto = require('./config/tyto');

var _tyto2 = _interopRequireDefault(_tyto);

var _templates = require('./templates/templates');

var _templates2 = _interopRequireDefault(_templates);

var _tyto3 = require('./controllers/tyto');

var _tyto4 = _interopRequireDefault(_tyto3);

var _tyto5 = require('./views/tyto');

var _tyto6 = _interopRequireDefault(_tyto5);

var _tyto7 = require('./models/tyto');

var _tyto8 = _interopRequireDefault(_tyto7);

var _utils = require('./utils/utils');

var _utils2 = _interopRequireDefault(_utils);

var _suggestions = require('./utils/suggestions');

var _suggestions2 = _interopRequireDefault(_suggestions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tyto = new _tyto2.default(); // Create app instance


window.Tyto = Tyto;

// Hydrate template store for views

Tyto.TemplateStore = _templates2.default;

// Import requirements

// const TytoViews = require('./views/tyto');


Tyto.module('Models', _tyto8.default);
Tyto.module('Ctrl', _tyto4.default);
Tyto.module('Views', _tyto6.default);
Tyto.module('Utils', _utils2.default);
Tyto.module('Suggestions', _suggestions2.default);

Tyto.Boards = new Tyto.Models.BoardCollection();
Tyto.Columns = new Tyto.Models.ColumnCollection();
Tyto.Tasks = new Tyto.Models.TaskCollection();
Tyto.ActiveBoard = new Tyto.Models.Board();
Tyto.ActiveCols = new Tyto.Models.ColumnCollection();
Tyto.ActiveTasks = new Tyto.Models.TaskCollection();

Tyto.on('before:start', function () {
  return Tyto.setRootLayout();
});

Tyto.on('start', function () {
  Tyto.__renderer = new marked.Renderer();
  Tyto.__renderer.link = function (href, title, text) {
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

},{"./config/tyto":2,"./controllers/tyto":3,"./models/tyto":4,"./templates/templates":5,"./utils/suggestions":6,"./utils/utils":7,"./views/tyto":17}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var App = Marionette.Application.extend({
  navigate: function navigate(route, opts) {
    Backbone.history.navigate(route, opts);
  },
  setRootLayout: function setRootLayout() {
    Tyto.RootView = new Tyto.Views.Root();
  },
  NAVIGATION_DURATION: 500,
  TASK_COLORS: ['yellow', 'red', 'blue', 'indigo', 'green', 'purple', 'orange', 'pink'],
  DEFAULT_TASK_COLOR: 'yellow',
  ANIMATION_EVENT: 'animationend webkitAnimationEnd oAnimationEnd',
  INTRO_JSON_SRC: 'js/intro.json',
  LOADING_CLASS: 'is--loading',
  SELECTED_CLASS: 'is--selected',
  CONFIRM_MESSAGE: '[tyto] are you sure you wish to delete this item?'
});

exports.default = App;

/*Some thing*/

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
  * Global App Controller
*/
var AppCtrl = function AppCtrl(_AppCtrl, App, Backbone, Marionette) {
  _AppCtrl.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'board/:board': 'showBoardView',
      'board/:board/task/:task': 'showEditView',
      'board/:board/task/:task?:params': 'showEditView',
      '*path': 'showSelectView'
    }
  });
  _AppCtrl.Controller = Marionette.Controller.extend({
    start: function start() {
      this.showMenu();
      if (window.localStorage && !window.localStorage.tyto) {
        this.showCookieBanner();
      }
    },
    showSelectView: function showSelectView() {
      Tyto.SelectView = new App.Views.Select({
        collection: Tyto.Boards
      });
      Tyto.RootView.showChildView('Content', Tyto.SelectView);
    },
    showMenu: function showMenu() {
      Tyto.MenuView = new App.Views.Menu();
      Tyto.RootView.showChildView('Menu', Tyto.MenuView);
    },
    showCookieBanner: function showCookieBanner() {
      /*
        Show cookie banner by creating a temporary region and showing
        the view.
       */
      Tyto.RootView.$el.prepend($('<div id="cookie-banner"></div>'));
      Tyto.RootView.addRegion('Cookie', '#cookie-banner');
      Tyto.CookieBannerView = new App.Views.CookieBanner();
      Tyto.RootView.showChildView('Cookie', Tyto.CookieBannerView);
    },
    showBoardView: function showBoardView(id) {
      var cols = void 0,
          model = void 0,
          tasks = void 0;
      Tyto.ActiveBoard = model = Tyto.Boards.get(id);
      if (model) {
        cols = Tyto.Columns.where({
          boardId: model.id
        });
        tasks = Tyto.Tasks.where({
          boardId: model.id
        });
        Tyto.ActiveTasks.reset(tasks);
        Tyto.ActiveCols.reset(cols);
        Tyto.BoardView = new App.Views.Board({
          model: model,
          collection: Tyto.ActiveCols,
          options: {
            tasks: Tyto.ActiveTasks
          }
        });
        App.RootView.showChildView('Content', Tyto.BoardView);
      } else {
        App.navigate('/', true);
      }
    },
    showEditView: function showEditView(bId, tId, params) {
      var taskToEdit = void 0;
      var board = Tyto.Boards.get(bId);
      var columns = Tyto.Columns.where({
        boardId: bId
      });
      var parentColumn = void 0;
      var isNew = false;
      if (params) {
        var qS = Tyto.Utils.processQueryString(params);
        if (qS.isFresh === 'true') {
          isNew = true;
          taskToEdit = Tyto.TempTask = new Tyto.Models.Task({
            boardId: bId,
            id: tId
          });
        }
      } else {
        taskToEdit = Tyto.Tasks.get(tId);
      }
      if (taskToEdit && board) {
        Tyto.EditView = new App.Views.Edit({
          model: taskToEdit,
          board: board,
          columns: columns,
          isNew: isNew
        });
        App.RootView.showChildView('Content', Tyto.EditView);
      } else if (board) {
        Tyto.navigate('/board/' + board.id, true);
      } else {
        Tyto.navigate('/', true);
      }
    }
  });
};

exports.default = AppCtrl;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Models = function Models(_Models, App, Backbone) {
  _Models.Board = Backbone.Model.extend({
    defaults: {
      title: 'New Board'
    }
  });
  _Models.BoardCollection = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('tyto--board'),
    model: _Models.Board
  });
  _Models.Column = Backbone.Model.extend({
    defaults: {
      title: 'New Column',
      ordinal: 1
    },
    localStorage: new Backbone.LocalStorage('tyto--column')
  });
  _Models.ColumnCollection = Backbone.Collection.extend({
    model: _Models.Column,
    localStorage: new Backbone.LocalStorage('tyto--column')
  });
  _Models.Task = Backbone.Model.extend({
    defaults: {
      title: 'New Todo',
      description: 'Making this work!',
      color: 'yellow',
      timeSpent: {
        hours: 0,
        minutes: 0,
        seconds: 0
      }
    },
    localStorage: new Backbone.LocalStorage('tyto--task')
  });
  _Models.TaskCollection = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('tyto--task'),
    model: _Models.Task
  });
};

exports.default = Models;

},{}],5:[function(require,module,exports){
'use strict';

module.exports = { "board": function board(tyto) {
    var __t,
        __p = '',
        __j = Array.prototype.join;
    function print() {
      __p += __j.call(arguments, '');
    }
    __p += '<div class="tyto-board__options"><button class="mdl-button mdl-js-button mdl-button--icon tyto-board__menu-btn " id="tyto-board__menu" title="Board options"><i class="material-icons">more_vert</i></button><ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-board__menu mdl-menu--bottom-right" for="tyto-board__menu"><li class="tyto-board__wipe-board mdl-menu__item">Wipe board</li><li class="tyto-board__delete-board mdl-menu__item">Delete board</li><li class="tyto-board__email-board mdl-menu__item">Email board</li><a class="tyto-board__emailer" style="display: none"></a></ul></div><div class="tyto-board__details"><h1 class="tyto-board__title bg--white" contenteditable="true">' + ((__t = tyto.title) == null ? '' : __t) + '</h1>';
    if (tyto.boards.length > 1) {
      ;
      __p += '<button class="mdl-button mdl-js-button mdl-button--icon tyto-board__selector__menu-btn " id="tyto-board__selector" title="Select a board"><i class="material-icons">expand_more</i></button><ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-board__selector__menu mdl-menu--bottom-right" for="tyto-board__selector">';
      _.each(tyto.boards.models, function (i) {
        ;
        __p += '\n';
        if (i.attributes.id != tyto.id) {
          ;
          __p += '<li class="mdl-menu__item tyto-board__selector-option" title="View board"><a href="#board/' + ((__t = i.attributes.id) == null ? '' : __t) + '">' + ((__t = i.attributes.title) == null ? '' : __t) + '</a></li>';
        };
        __p += '\n';
      });
      __p += '</ul>';
    };
    __p += '</div><div class="tyto-board__columns"></div><div class="tyto-board__actions mdl-button--fab_flinger-container"><button class="tyto-board__add-entity mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored"><i class="material-icons">add</i></button><div class="mdl-button--fab_flinger-options"><button class="tyto-board__super-add mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored" title="Add task"><i class="material-icons">description</i><i class="material-icons sub">add</i></button><button class="tyto-board__add-column mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored" title="Add column"><i class="material-icons">view_column</i><i class="material-icons sub">add</i></button></div></div><div class="tyto-board__bloomer"></div>';
    return __p;
  }, "column": function column(tyto) {
    var __t,
        __p = '';
    __p += '<div class="tyto-column__content"><div class="tyto-column__actions"><i class="tyto-column__mover material-icons does--fade" title="Move column">open_with</i><h6 class="tyto-column__title input--fade bg--white" contenteditable="true" title="Column title">' + ((__t = tyto.title) == null ? '' : __t) + '</h6><button class="mdl-button mdl-js-button mdl-button--icon tyto-column__menu-btn does--fade" id="' + ((__t = tyto.id) == null ? '' : __t) + '--menu" title="Column options"><i class="material-icons">more_vert</i></button><ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-column__menu mdl-menu--bottom-right" for="' + ((__t = tyto.id) == null ? '' : __t) + '--menu"><li class="tyto-column__delete-column mdl-menu__item" title="Delete column">Delete</li><li class="tyto-column__add-task mdl-menu__item" title="Add task">Add task</li></ul></div><div class="tyto-column__tasks"></div><div class="tyto-column__action"><i class="material-icons tyto-column__add-task does--fade" title="Add task">add</i></div></div>';
    return __p;
  }, "cookieBanner": function cookieBanner(tyto) {
    var __t,
        __p = '';
    __p += '<div class="tyto-cookies bg--blue"><img src="img/tyto.png"/><p>tyto uses cookies that enable it to provide functionality and a better user experience. By using tyto and closing this message you agree to the use of cookies. <a href="cookies.html" target="_blank">Read more...</a></p><button class="tyto-cookies__accept mdl-button mdl-js-button mdl-button--raised mdl-button--accent mdl-js-ripple-effect">Close</button></div>';
    return __p;
  }, "edit": function edit(tyto) {
    var __t,
        __p = '',
        __j = Array.prototype.join;
    function print() {
      __p += __j.call(arguments, '');
    }
    __p += '<div class="tyto-edit__nav">';
    if (tyto.isNew) {
      ;
      __p += '<button class="tyto-edit__save mdl-button mdl-js-button mdl-js-ripple-effect">Done</button><a class="tyto-edit__cancel mdl-button mdl-js-button mdl-js-ripple-effect" href="#board/' + ((__t = tyto.board.id) == null ? '' : __t) + '">Cancel</a>';
    } else {
      ;
      __p += '<a class="tyto-edit__back mdl-button mdl-js-button mdl-js-ripple-effect" href="#board/' + ((__t = tyto.board.id) == null ? '' : __t) + '">Return to board</a>';
    };
    __p += '</div><div class="tyto-edit__content"><div class="tyto-edit__details has--bottom-margin"><h1 class="tyto-edit__task-title" contenteditable="true" data-model-prop="title" title="Task title">' + ((__t = tyto.title) == null ? '' : __t) + '</h1><div class="tyto-edit__task-description" title="Task description">' + ((__t = tyto.description) == null ? '' : __t) + '</div><div class="tyto-task__edit-wrapper"><textarea class="tyto-edit__edit-description is--hidden" data-model-prop="description"></textarea><div class="tyto-task__suggestions tyto-suggestions__container mdl-shadow--2dp is--hidden"></div></div></div><div class="tyto-edit__details-footer tx--right has--bottom-margin"><div class="tyto-time tyto-edit__task-time" title="Time spent"><i class="tyto-time__icon material-icons">schedule</i><span class="tyto-edit__task-time__hours tyto-time__hours">' + ((__t = tyto.timeSpent.hours) == null ? '' : __t) + 'h</span><span class="tyto-edit__task-time__minutes tyto-time__minutes">' + ((__t = tyto.timeSpent.minutes) == null ? '' : __t) + 'm</span></div><div class="tyto-edit__task-column">';
    if (tyto.selectedColumn) {
      ;
      __p += '\n' + ((__t = tyto.selectedColumn.attributes.title) == null ? '' : __t) + '\n';
    };
    __p += '</div></div><div class="tyto-edit__actions">';
    if (tyto.columns.length > 0) {
      ;
      __p += '<button class="mdl-button mdl-js-button mdl-button--icon tyto-edit__column-select__menu-btn " id="column-select" title="Select column"><i class="material-icons">view_column</i></button><ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-edit__column-select__menu mdl-menu--bottom-right" for="column-select">';
      _.forEach(tyto.columns, function (column) {
        ;
        __p += '\n';
        if (!tyto.isNew) {
          var activeClass = column.attributes.id === tyto.columnId ? 'is--selected' : '';
        };
        __p += '<li class="mdl-menu__item tyto-edit__column-select__menu-option ' + ((__t = activeClass) == null ? '' : __t) + '" data-column-id="' + ((__t = column.id) == null ? '' : __t) + '">' + ((__t = column.attributes.title) == null ? '' : __t) + '</li>';
      });;
      __p += '</ul>';
    };
    __p += '<button class="mdl-button mdl-js-button mdl-button--icon tyto-edit__color-select__menu-btn " id="color-select" title="Change color"><i class="material-icons">color_lens</i></button><ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-edit__color-select__menu mdl-menu--bottom-right" for="color-select">';
    _.forEach(tyto.colors, function (col) {
      ;
      __p += '\n';
      var activeColor = col === tyto.color ? 'is--selected' : '';
      __p += '<li class="mdl-menu__item tyto-edit__color-select__menu-option bg--' + ((__t = col) == null ? '' : __t) + ' hv--' + ((__t = col) == null ? '' : __t) + ' ' + ((__t = tyto.activeColor) == null ? '' : __t) + '" data-color="' + ((__t = col) == null ? '' : __t) + '" title="' + ((__t = col) == null ? '' : __t) + '"></li>';
    });;
    __p += '</ul><button class="tyto-edit__track mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect" title="Start tracking"><i class="material-icons">schedule</i></button></div></div>';
    return __p;
  }, "filterList": function filterList(tyto) {
    var __t,
        __p = '',
        __j = Array.prototype.join;
    function print() {
      __p += __j.call(arguments, '');
    }
    __p += '<ul class="tyto-suggestions__list">';
    if (tyto.models.length > 0) {
      ;
      __p += '\n';
      _.each(tyto.models, function (model) {
        ;
        __p += '\n';
        if (model.attributes.boardId) {
          ;
          __p += '<li class="tyto-suggestions__item" data-type="Tasks" data-model-id="' + ((__t = model.attributes.id) == null ? '' : __t) + '">' + ((__t = model.attributes.title) == null ? '' : __t) + '</li>';
        } else {
          ;
          __p += '<li class="tyto-suggestions__item" data-type="Boards" data-model-id="' + ((__t = model.attributes.id) == null ? '' : __t) + '">' + ((__t = model.attributes.title) == null ? '' : __t) + '</li>';
        };
        __p += '\n';
      });
      __p += '\n';
    } else {
      ;
      __p += '<li class="tyto-suggestions__item">No suggestions available...</li>';
    };
    __p += '</ul>';
    return __p;
  }, "menu": function menu(tyto) {
    var __t,
        __p = '';
    __p += '<div class="mdl-layout-title"><div class="tyto-menu__title"><h1>tyto</h1></div></div><ul class="tyto-menu__actions"><li><button class="tyto-menu__add-board mdl-button mdl-js-button mdl-js-ripple-effect">Add new board</button></li><li><button class="tyto-menu__import mdl-button mdl-js-button mdl-js-ripple-effect" id="import-data">Import data</button></li><li><button class="tyto-menu__load mdl-button mdl-js-button mdl-js-ripple-effect" id="load-data">Load data</button></li><li><button class="tyto-menu__export mdl-button mdl-js-button mdl-js-ripple-effect">Export data</button></li><li><button class="tyto-menu__delete-save mdl-button mdl-js-button mdl-js-ripple-effect">Delete data</button></li><a class="tyto-menu__exporter"></a><input class="tyto-menu__importer" type="file"/><li><div class="github-stats"><div class="github-stats__stars"><iframe src="http://ghbtns.com/github-btn.html?user=jh3y&amp;repo=tyto&amp;type=watch&amp;count=true" allowtransparency="true" frameborder="0" scrolling="0" width="90px" height="20"></iframe></div><div class="github-stats__forks"><iframe src="http://ghbtns.com/github-btn.html?user=jh3y&amp;repo=tyto&amp;type=fork&amp;count=true" allowtransparency="true" frameborder="0" scrolling="0" width="90px" height="20"></iframe></div><div class="github-stats__user"><iframe src="http://ghbtns.com/github-btn.html?user=jh3y&amp;repo=tyto&amp;type=follow&amp;count=true" allowtransparency="true" frameborder="0" scrolling="0" width="120px" height="20"></iframe></div></div></li></ul>';
    return __p;
  }, "select": function select(tyto) {
    var __t,
        __p = '',
        __j = Array.prototype.join;
    function print() {
      __p += __j.call(arguments, '');
    }

    if (!tyto.items || tyto.items.length == 0) {
      ;
      __p += '<p><span>To start,</span><button class="tyto-select__add-board mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">Add a board</button></p><p><span>or</span><button class="tyto-select__load-intro-board mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">Load the intro board</button></p>';
    } else {
      ;
      __p += '<p><span>To start, select one of your boards.</span><div class="selector"><select class="tyto-select__board-selector"><option>--select a board--</option>';
      _.each(tyto.items, function (i) {
        ;
        __p += '<option value="' + ((__t = i.id) == null ? '' : __t) + '">' + ((__t = i.title) == null ? '' : __t) + '</option>';
      });
      __p += '</select></div></p><p><span>Alternatively,</span><button class="tyto-select__add-board mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">Add a board</button></p>';
    };

    return __p;
  }, "task": function task(tyto) {
    var __t,
        __p = '',
        __j = Array.prototype.join;
    function print() {
      __p += __j.call(arguments, '');
    }
    __p += '<div class="tyto-task__content"><div class="tyto-task__header tx--center"><i class="material-icons tyto-task__mover does--fade" title="Move task">open_with</i><h2 class="tyto-task__title" contenteditable="true" title="Task title">' + ((__t = tyto.title) == null ? '' : __t) + '</h2><button class="mdl-button mdl-js-button mdl-button--icon tyto-task__menu-btn does--fade" id="' + ((__t = tyto.id) == null ? '' : __t) + '--menu" title="Task options"><i class="material-icons">more_vert</i></button><ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-task__menu mdl-menu--bottom-right" for="' + ((__t = tyto.id) == null ? '' : __t) + '--menu"><li class="mdl-menu__item tyto-task__delete-task" title="Delete task">Delete</li><li class="mdl-menu__item tyto-task__edit-task" title="Edit task">Edit</li><li class="mdl-menu__item tyto-task__track-task" title="Track task time">Track</li></ul></div><div class="mdl-card__supporting-text tyto-task__description" title="Task description">' + ((__t = tyto.description) == null ? '' : __t) + '</div><div class="tyto-task__edit-wrapper"><textarea class="tyto-task__description-edit is--hidden"></textarea><div class="tyto-task__suggestions tyto-suggestions__container mdl-shadow--2dp is--hidden"></div></div>';
    var hidden = tyto.timeSpent.hours > 0 || tyto.timeSpent.minutes > 0 ? '' : 'is--hidden';;
    __p += '<div class="tyto-time tyto-task__time" title="Time spent"><i class="tyto-time__icon material-icons">schedule</i><span class="tyto-task__time__hours tyto-time__hours">' + ((__t = tyto.timeSpent.hours) == null ? '' : __t) + 'h</span><span class="tyto-task__time__minutes tyto-time__minutes">' + ((__t = tyto.timeSpent.minutes) == null ? '' : __t) + 'm</span></div></div>';
    return __p;
  }, "timeModal": function timeModal(tyto) {
    var __t,
        __p = '';
    __p += '<div class="tyto-time-modal__content mdl-card mdl-shadow--4dp"><div class="tyto-time-modal__content-title mdl-card__title"><h2 class="mdl-card__title-text">' + ((__t = tyto.title) == null ? '' : __t) + '</h2></div><div class="tyto-time-modal__content-text tx--center mdl-card__supporting-text"><p class="tyto-time-modal__content-description"></p><h1 class="tyto-time-modal__timer-lbl"><span class="tyto-time-modal__timer-lbl-hours"></span><span>:</span><span class="tyto-time-modal__timer-lbl-minutes"></span><span>:</span><span class="tyto-time-modal__timer-lbl-seconds"></span></h1></div><div class="tyto-time-modal__actions mdl-card__actions mdl-card--border tx--center"><button class="tyto-time-modal__timer-reset mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect" title="Reset time"><i class="material-icons">restore</i></button><button class="tyto-time-modal__timer mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect" title="Stop/Start tracking"><i class="tyto-time-modal__timer-icon material-icons">play_arrow</i></button><button class="tyto-time-modal__close mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect" title="Exit tracking"><i class="material-icons">clear</i></button></div></div>';
    return __p;
  } };

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Suggestions = function Suggestions(_Suggestions, App, Backbone, Marionette) {
  _Suggestions.proto = ['filterItems', 'selectSuggestion', 'renderSuggestions', 'hideSuggestions'];
  _Suggestions.props = {
    ACTIVE_CLASS: 'is--active',
    SUGGESTIONS_ITEM: '.tyto-suggestions__item'
  };
  _Suggestions.bootstrapView = function (view) {

    /*
      Bootstraps the given view with module functions.
      This is purely for a quick DRY fix. There is most definitely
      a better way to do this I am sure.
     */
    _Suggestions.proto.forEach(function (proto) {
      view[proto] = _Suggestions[proto];
    });
  };
  _Suggestions.renderSuggestions = function (filterString) {
    var filterByTerm = function filterByTerm(entity) {
      return entity.attributes.title.toLowerCase().indexOf(filterString.toLowerCase()) !== -1;
    };
    var view = this;
    var edit = view.ui.editDescription;
    var props = view.domAttributes;
    var suggestions = view.ui.suggestions;
    var collection = Tyto.Boards.models.concat(Tyto.Tasks.models);
    collection = filterString ? collection.filter(filterByTerm) : collection;
    var markup = Tyto.TemplateStore.filterList({
      models: collection.slice(0, 4)
    });
    var $body = $('body');
    var $column = $('.tyto-column__tasks');
    var end = edit[0].selectionEnd;
    var start = view.__EDIT_START + 1;
    var val = edit[0].value;
    var handleBlurring = function handleBlurring(e) {
      var el = e.target;
      if (el.nodeName !== 'LI' && el.nodeName !== 'TEXTAREA') {
        view.hideSuggestions();
        view.delegateEvents();
        edit.blur();
        $body.off('click', handleBlurring);
      } else if (el.nodeName === 'TEXTAREA') {
        if (end < start || val.substring(start, end).indexOf(' ') !== -1) {
          view.hideSuggestions();
        }
      }
    };
    var scrollOff = function scrollOff(e) {
      view.delegateEvents();
      edit.focus();
      $body.off('click', handleBlurring);
      $column.off('scroll', scrollOff);
      edit.off('scroll', scrollOff);
      view.hideSuggestions();
    };

    view.$el.off('blur', '.' + edit[0].className);
    $body.on('click', handleBlurring);
    $column.on('scroll', scrollOff);
    edit.on('scroll', scrollOff);
    if (!view.__EDIT_MODE) {
      view.__EDIT_MODE = true;
      view.__EDIT_START = edit[0].selectionStart;
      var coords = Tyto.Utils.getCaretPosition(edit[0]);
      suggestions.html(markup).css({
        left: coords.LEFT,
        top: coords.TOP
      }).removeClass(props.HIDDEN_UTIL_CLASS);
    } else {
      suggestions.html(markup);
    }
  };
  _Suggestions.hideSuggestions = function () {
    var view = this;
    var props = view.domAttributes;
    view.__EDIT_MODE = false;
    view.__ACTIVE_SUGGESTION = null;
    view.__EDIT_MODE_IN_SELECTION = false;
    var suggestions = view.ui.suggestions;
    suggestions.addClass(props.HIDDEN_UTIL_CLASS);
  };
  _Suggestions.filterItems = function (e) {
    var view = this;
    var suggestions = view.ui.suggestions;
    var props = view.domAttributes;
    var edit = view.ui.editDescription;
    var key = e.which;
    var start = edit[0].selectionStart;
    var end = edit[0].selectionEnd;
    var val = edit[0].value;
    if (key === 35 && !view.__EDIT_MODE) {
      var before = val.charAt(start - 1).trim();
      var after = val.charAt(start).trim();
      if (before === '' && after === '') {
        view.renderSuggestions();
      }
    } else if (view.__EDIT_MODE) {
      switch (key) {
        case 35:
        case 32:
          view.hideSuggestions();
        case 13:
          if (view.__EDIT_MODE_IN_SELECTION && view.__ACTIVE_SUGGESTION !== null) {
            e.preventDefault();
            view.__ACTIVE_SUGGESTION.click();
          } else {
            view.hideSuggestions();
          }
          break;
        case 8:
          if (end === view.__EDIT_START) {
            view.hideSuggestions();
          } else {
            view.renderSuggestions(val.substring(view.__EDIT_START + 1, end));
          }
          break;
        case 38:
        case 40:
          if (e.type === 'keydown') {
            e.preventDefault();
            var dir = key === 38 ? 'prev' : 'next';
            var reset = key === 38 ? 'last' : 'first';
            if (view.__EDIT_MODE_IN_SELECTION) {
              if (view.__ACTIVE_SUGGESTION[dir]().length === 0) {
                view.__ACTIVE_SUGGESTION.removeClass(_Suggestions.props.ACTIVE_CLASS);
                view.__ACTIVE_SUGGESTION = suggestions.find(_Suggestions.props.SUGGESTIONS_ITEM)[reset]().addClass(_Suggestions.props.ACTIVE_CLASS);
              } else {
                view.__ACTIVE_SUGGESTION = view.__ACTIVE_SUGGESTION.removeClass(_Suggestions.props.ACTIVE_CLASS)[dir]().addClass(_Suggestions.props.ACTIVE_CLASS);
              }
            } else {
              view.__EDIT_MODE_IN_SELECTION = true;
              view.__ACTIVE_SUGGESTION = suggestions.find(_Suggestions.props.SUGGESTIONS_ITEM)[reset]().addClass(_Suggestions.props.ACTIVE_CLASS);
            }
          }
          break;
        case 37:
        case 39:
          if (e.type === 'keyup') {
            if (end < view.__EDIT_START + 1 || val.substring(view.__EDIT_START, end).length !== val.substring(view.__EDIT_START, end).trim().length) {
              view.hideSuggestions();
            }
          }
          break;
        default:
          if (e.type === 'keyup') {
            view.renderSuggestions(val.substring(view.__EDIT_START + 1, end));
          }
      }
    }
  };
  _Suggestions.selectSuggestion = function (e) {
    var view = this;
    var edit = view.ui.editDescription;
    var entityType = e.target.getAttribute('data-type');
    var entityId = e.target.getAttribute('data-model-id');
    if (entityType) {
      var entity = Tyto[entityType].get(entityId);
      var url = void 0;
      if (entity.attributes.boardId) {
        var boardId = Tyto.Tasks.get(entityId).attributes.boardId;
        url = '#board/' + boardId + '/task/' + entityId;
      } else {
        url = '#board/' + entityId;
      }
      url = '[' + entity.attributes.title + '](' + url + ')';
      var start = edit[0].value.slice(0, view.__EDIT_START);
      var end = edit[0].value.slice(edit[0].selectionEnd, edit[0].value.length);
      edit[0].value = start + ' ' + url + ' ' + end;
    }
    $('body').off('click');
    view.ui.editDescription.focus();
    view.hideSuggestions();
    view.delegateEvents();
  };
};

exports.default = Suggestions;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Utils = function Utils(_Utils, App, Backbone, Marionette) {
  _Utils.upgradeMDL = function (map) {
    _.forEach(map, function (upgrade, idx) {
      if (upgrade.el) {
        componentHandler.upgradeElement(upgrade.el, upgrade.component);
      }
    });
  };

  /*
    Syncs model 'ordinal' property to that of the DOM representation.
     NOTE :: This shouldn't be doing a loop through the collection using
    model.save. With a proper backend this could be avoided but on
    localStorage it will work with no real performance hit.
   */
  _Utils.reorder = function (entity, list, attr) {
    var collection = entity.collection;
    _.forEach(list, function (item, idx) {
      var id = item.getAttribute(attr);
      var model = collection.get(id);
      if (model) {
        model.save({
          ordinal: idx + 1
        });
      }
    });
  };
  _Utils.autoSize = function (el) {
    var sizeUp = function sizeUp() {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    };
    el.addEventListener('keydown', sizeUp);
    el.addEventListener('input', sizeUp);
    el.addEventListener('focus', sizeUp);
    sizeUp();
  };
  _Utils.getCaretPosition = function (el) {
    var carPos = el.selectionEnd;
    var div = document.createElement('div');
    var span = document.createElement('span');
    var copyStyle = getComputedStyle(el);
    var bounds = el.getBoundingClientRect();
    [].forEach.call(copyStyle, function (prop) {
      return div.style[prop] = copyStyle[prop];
    });
    div.style.position = 'absolute';
    div.textContent = el.value.substr(0, carPos);
    span.textContent = el.value.substr(carPos) || '.';
    div.appendChild(span);
    document.body.appendChild(div);
    var fontSize = parseFloat(copyStyle.fontSize.replace('px', ''), 10);
    var top = el.offsetTop - el.scrollTop + span.offsetTop + fontSize;
    top = top > el.offsetHeight ? el.offsetHeight : top;
    var left = el.offsetLeft - el.scrollLeft + span.offsetLeft;
    var coords = {
      TOP: top + bounds.top + 'px',
      LEFT: left + bounds.left + 'px'
    };
    document.body.removeChild(div);
    return coords;
  };
  _Utils.processQueryString = function (params) {
    var qS = {};
    var pushToQs = function pushToQs(set) {
      set = set.split('=');
      qS[set[0]] = set[1];
    };
    params.split('&').map(pushToQs);
    return qS;
  };
  _Utils.bloom = function (el, color, url) {
    var $bloomer = Tyto.BoardView.ui.bloomer;
    var bloomer = $bloomer[0];
    var coord = el.getBoundingClientRect();
    bloomer.style.left = coord.left + coord.width / 2 + 'px';
    bloomer.style.top = coord.top + coord.height / 2 + 'px';
    bloomer.className = 'tyto-board__bloomer ' + 'bg--' + color;
    bloomer.classList.add('is--blooming');
    Tyto.RootView.el.classList.add('is--showing-bloom');
    var goToEdit = function goToEdit() {
      $bloomer.off(Tyto.ANIMATION_EVENT, goToEdit);
      Tyto.navigate(url, true);
    };
    $bloomer.on(Tyto.ANIMATION_EVENT, goToEdit);
  };
  _Utils.load = function (data, importing, wipe) {
    var boards = [];
    var cols = [];
    var tasks = [];
    var altered = {};
    if (importing) {
      delete data.tyto;
      delete data['tyto--board'];
      delete data['tyto--column'];
      delete data['tyto--task'];
    }
    if (wipe) {
      _.forOwn(window.localStorage, function (val, key) {
        if (key.indexOf('tyto') !== -1) {
          window.localStorage.removeItem(key);
        }
      });
    }
    _.forOwn(data, function (val, key) {
      var entity = void 0,
          saveId = void 0;
      if (wipe) {
        window.localStorage.setItem(key, val);
      }
      if (key.indexOf('tyto--board-') !== -1) {
        if (importing) {
          entity = JSON.parse(val);
          if (Tyto.Boards.get(entity.id) !== undefined) {
            saveId = entity.id;
            delete entity.id;
          }
          altered[saveId] = Tyto.Boards.create(entity).id;
        } else {
          boards.push(JSON.parse(val));
        }
      }
      if (key.indexOf('tyto--column-') !== -1) {
        if (importing) {
          entity = JSON.parse(val);
          if (altered[entity.boardId]) {
            entity.boardId = altered[entity.boardId];
          }
          if (Tyto.Columns.get(entity.id) !== undefined) {
            saveId = entity.id;
            delete entity.id;
          }
          altered[saveId] = Tyto.Columns.create(entity).id;
        } else {
          cols.push(JSON.parse(val));
        }
      }
      if (key.indexOf('tyto--task-') !== -1) {
        if (importing) {
          entity = JSON.parse(val);
          if (altered[entity.boardId]) {
            entity.boardId = altered[entity.boardId];
          }
          if (altered[entity.columnId]) {
            entity.columnId = altered[entity.columnId];
          }
          if (Tyto.Tasks.get(entity.id) !== undefined) {
            saveId = entity.id;
            delete entity.id;
          }
          altered[saveId] = Tyto.Tasks.create(entity).id;
        } else {
          tasks.push(JSON.parse(val));
        }
      }
    });
    if (!importing) {
      Tyto.Boards.reset(boards);
      Tyto.Columns.reset(cols);
      Tyto.Tasks.reset(tasks);
    }
  };

  /**
    * ES6 to the rescue!!!
  */
  _Utils.EMAIL_TEMPLATE = '\n    <div>\n      Status for: <%= board.title %>\n      <% if (columns.length > 0 && tasks.length > 0) { %>\n        <% _.forEach(columns, function(column) { %>\n          <%= column.attributes.title %>\n          &#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;\n          <% _.forEach(tasks, function(task) { %>\n            <% if (task.attributes.columnId === column.attributes.id) { %>\n              &#8226; <%= task.attributes.title %>\n              \n\n              <%= task.attributes.description %>\n              <% if (task.attributes.timeSpent.hours > 0 || task.attributes.timeSpent.minutes > 0) { %>\n                \n\n                -- <%=task.attributes.timeSpent.hours %> hours, <%= task.attributes.timeSpent.minutes %> minutes.\n              <% } %>\n            <% } %>\n          <% });%>\n        <% }); %>\n      <% } else { %>\n        Seems we are way ahead, so treat yourself and go grab a coffee! :)\n      <% } %>\n    </div>';
  _Utils.getEmailContent = function (board) {
    var subject = 'Status for ' + Tyto.ActiveBoard.get('title') + ' as of ' + new Date().toString();
    var templateFn = _.template(Tyto.Utils.EMAIL_TEMPLATE);
    var content = templateFn({
      board: board.attributes,
      columns: Tyto.Columns.where({
        boardId: board.id
      }),
      tasks: Tyto.Tasks.where({
        boardId: board.id
      })
    });
    content = encodeURIComponent($(content).text());
    return 'mailto:someone@somewhere.com?subject=' + encodeURIComponent(subject.trim()) + '&body=' + content;
  };
  _Utils.showTimeModal = function (model, view) {
    Tyto.RootView.$el.prepend($('<div class="tyto-time-modal__wrapper"></div>'));
    Tyto.RootView.addRegion('TimeModal', '.tyto-time-modal__wrapper');
    Tyto.TimeModalView = new App.Views.TimeModal({
      model: model,
      modelView: view
    });
    Tyto.RootView.showChildView('TimeModal', Tyto.TimeModalView);
  };
  _Utils.getRenderFriendlyTime = function (time) {
    var renderTime = {};
    var _arr = ['hours', 'minutes', 'seconds'];
    for (var _i = 0; _i < _arr.length; _i++) {
      var measure = _arr[_i];
      renderTime[measure] = time[measure] < 10 ? '0' + time[measure] : time[measure];
    }
    return renderTime;
  };
  return _Utils.renderTime = function (view) {
    var time = view.model.get('timeSpent');
    if (time.hours > 0 || time.minutes > 0) {
      if (view.ui.time.hasClass(view.domAttributes.HIDDEN_UTIL_CLASS)) {
        view.ui.time.removeClass(view.domAttributes.HIDDEN_UTIL_CLASS);
      }
      var friendly = Tyto.Utils.getRenderFriendlyTime(time);
      view.ui.hours.text(friendly.hours + 'h');
      view.ui.minutes.text(friendly.minutes + 'm');
    } else {
      if (!view.ui.time.hasClass(view.domAttributes.HIDDEN_UTIL_CLASS)) {
        view.ui.time.addClass(view.domAttributes.HIDDEN_UTIL_CLASS);
      }
    }
  };
};

exports.default = Utils;

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _column = require('./column');

var _column2 = _interopRequireDefault(_column);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BoardView = Backbone.Marionette.CompositeView.extend({
  tagName: 'div',
  className: function className() {
    return this.domAttributes.VIEW_CLASS;
  },
  template: function template(args) {
    return Tyto.TemplateStore.board(args);
  },
  templateHelpers: function templateHelpers() {
    return {
      boards: Tyto.Boards
    };
  },
  childView: _column2.default,
  childViewContainer: function childViewContainer() {
    return this.domAttributes.CHILD_VIEW_CONTAINER_CLASS;
  },
  childViewOptions: function childViewOptions(c) {
    var view = this;
    var colTasks = Tyto.ActiveTasks.where({
      columnId: c.id
    });
    return {
      collection: new Tyto.Models.TaskCollection(colTasks),
      board: view.model
    };
  },
  ui: {
    addEntity: '.tyto-board__add-entity',
    primaryActions: '.tyto-board__actions',
    boardMenu: '.tyto-board__menu',
    boardSelect: '.tyto-board__selector__menu',
    addColumn: '.tyto-board__add-column',
    addTask: '.tyto-board__super-add',
    deleteBoard: '.tyto-board__delete-board',
    wipeBoard: '.tyto-board__wipe-board',
    emailBoard: '.tyto-board__email-board',
    emailer: '.tyto-board__emailer',
    boardName: '.tyto-board__title',
    columnContainer: '.tyto-board__columns',
    bloomer: '.tyto-board__bloomer'
  },
  collectionEvents: {
    'destroy': 'handleColumnRemoval'
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-board',
    CHILD_VIEW_CONTAINER_CLASS: '.tyto-board__columns',
    COLUMN_CLASS: '.tyto-column',
    COLUMN_ATTR: 'data-col-id',
    COLUMN_MOVER_CLASS: '.tyto-column__mover',
    COLUMN_PLACEHOLDER_CLASS: 'tyto-column__placeholder',
    FAB_MENU_VISIBLE_CLASS: 'is-showing-options',
    ADDING_COLUMN_CLASS: 'is--adding-column'
  },
  getMDLMap: function getMDLMap() {
    var view = this;
    return [{
      el: view.ui.boardMenu[0],
      component: 'MaterialMenu'
    }, {
      el: view.ui.boardSelect[0],
      component: 'MaterialMenu'
    }];
  },
  handleColumnRemoval: function handleColumnRemoval() {
    var view = this;
    var list = view.$el.find(view.domAttributes.COLUMN_CLASS);
    Tyto.Utils.reorder(view, list, view.domAttributes.COLUMN_ATTR);
  },
  events: {
    'click @ui.addEntity': 'showPrimaryActions',
    'click @ui.addColumn': 'addNewColumn',
    'click @ui.addTask': 'addNewTask',
    'click @ui.deleteBoard': 'deleteBoard',
    'click @ui.wipeBoard': 'wipeBoard',
    'click @ui.emailBoard': 'emailBoard',
    'blur @ui.boardName': 'saveBoardName'
  },
  showPrimaryActions: function showPrimaryActions(e) {
    var view = this;
    var ctn = view.ui.primaryActions[0];
    var btn = view.ui.addEntity[0];
    var fabVisibleClass = view.domAttributes.FAB_MENU_VISIBLE_CLASS;
    var processClick = function processClick(evt) {
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
  onBeforeRender: function onBeforeRender() {
    this.collection.models = this.collection.sortBy('ordinal');
  },
  onShow: function onShow() {
    /**
      * Have to upgrade MDL components onShow.
    */
    var view = this;
    Tyto.Utils.upgradeMDL(view.getMDLMap());
  },
  onRender: function onRender() {
    /**
      * As with manually upgrading MDL, need to invoke jQuery UI sortable
      * function on render.
    */
    this.bindColumns();
  },
  bindColumns: function bindColumns() {
    var view = this;
    var attr = view.domAttributes;
    view.ui.columnContainer.sortable({
      connectWith: attr.COLUMN_CLASS,
      handle: attr.COLUMN_MOVER_CLASS,
      placeholder: attr.COLUMN_PLACEHOLDER_CLASS,
      axis: "x",
      containment: view.$childViewContainer,
      stop: function stop(event, ui) {
        var list = Array.prototype.slice.call(view.$el.find(attr.COLUMN_CLASS));
        Tyto.Utils.reorder(view, list, attr.COLUMN_ATTR);
      }
    });
  },
  addNewColumn: function addNewColumn() {
    var view = this;
    var board = view.model;
    view.$el.addClass(view.domAttributes.ADDING_COLUMN_CLASS);
    var columns = view.collection;
    columns.add(Tyto.Columns.create({
      boardId: board.id,
      ordinal: columns.length + 1
    }));
  },
  saveBoardName: function saveBoardName() {
    this.model.save({
      title: this.ui.boardName.text().trim()
    });
  },
  addNewTask: function addNewTask() {
    var view = this;
    var board = view.model;
    var id = _.uniqueId();
    var addUrl = '#board/' + board.id + '/task/' + id + '?isFresh=true';
    Tyto.Utils.bloom(view.ui.addTask[0], Tyto.DEFAULT_TASK_COLOR, addUrl);
  },
  deleteBoard: function deleteBoard() {
    var view = this;
    if (view.collection.length === 0 || confirm(Tyto.CONFIRM_MESSAGE)) {
      view.wipeBoard();
      view.model.destroy();
      view.destroy();
      Tyto.navigate('/', {
        trigger: true
      });
    }
  },
  wipeBoard: function wipeBoard(dontConfirm) {
    var view = this;
    var wipe = function wipe() {
      view.children.forEach(function (colView) {
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
  emailBoard: function emailBoard() {
    var view = this;
    var emailContent = Tyto.Utils.getEmailContent(view.model);
    this.ui.emailer.attr('href', emailContent);
    this.ui.emailer[0].click();
  }
});

exports.default = BoardView;

},{"./column":9}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _task = require('./task');

var _task2 = _interopRequireDefault(_task);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ColumnView = Backbone.Marionette.CompositeView.extend({
  tagName: 'div',
  className: function className() {
    return this.domAttributes.VIEW_CLASS;
  },
  attributes: function attributes() {
    var attr = {};
    attr[this.domAttributes.VIEW_ATTR] = this.model.get('id');
    return attr;
  },
  template: function template(args) {
    return Tyto.TemplateStore.column(args);
  },
  childView: _task2.default,
  childViewContainer: function childViewContainer() {
    return this.domAttributes.CHILD_VIEW_CONTAINER_CLASS;
  },
  events: {
    'click @ui.deleteColumn': 'deleteColumn',
    'click @ui.addTask': 'addTask',
    'blur @ui.columnTitle': 'updateTitle'
  },
  ui: {
    deleteColumn: '.tyto-column__delete-column',
    addTask: '.tyto-column__add-task',
    columnTitle: '.tyto-column__title',
    taskContainer: '.tyto-column__tasks',
    columnMenu: '.tyto-column__menu'
  },
  collectionEvents: {
    'destroy': 'handleTaskRemoval'
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-column',
    VIEW_ATTR: 'data-col-id',
    PARENT_CONTAINER_CLASS: '.tyto-board__columns',
    CHILD_VIEW_CONTAINER_CLASS: '.tyto-column__tasks',
    BOARD_CLASS: '.tyto-board',
    COLUMN_ADD_CLASS: 'is--adding-column',
    TASK_ADD_CLASS: 'is--adding-task',
    TASK_ATTR: 'data-task-id',
    TASK_CLASS: '.tyto-task',
    TASK_MOVER_CLASS: '.tyto-task__mover',
    TASK_PLACEHOLDER_CLASS: 'tyto-task__placeholder'
  },
  getMDLMap: function getMDLMap() {
    var view = this;
    return [{
      el: view.ui.columnMenu[0],
      component: 'MaterialMenu'
    }];
  },
  handleTaskRemoval: function handleTaskRemoval(e) {
    var view = this;
    var attr = view.domAttributes;
    var list = Array.prototype.slice.call(view.$el.find(attr.TASK_CLASS));
    Tyto.Utils.reorder(view, list, attr.TASK_ATTR);
  },
  initialize: function initialize() {
    var view = this;
    var attr = view.domAttributes;
    view.$el.on(Tyto.ANIMATION_EVENT, function () {
      view.$el.parents(attr.BOARD_CLASS).removeClass(attr.COLUMN_ADD_CLASS);
    });
  },
  onBeforeRender: function onBeforeRender() {
    this.collection.models = this.collection.sortBy('ordinal');
  },
  bindTasks: function bindTasks() {
    var view = this;
    var attr = view.domAttributes;
    view.ui.taskContainer.sortable({
      connectWith: attr.CHILD_VIEW_CONTAINER_CLASS,
      handle: attr.TASK_MOVER_CLASS,
      placeholder: attr.TASK_PLACEHOLDER_CLASS,
      containment: view.domAttributes.PARENT_CONTAINER_CLASS,
      stop: function stop(event, ui) {
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
        var list = void 0,
            destination = void 0;
        var model = view.collection.get(ui.item.attr(attr.TASK_ATTR));
        var destinationView = view;
        var newColId = $(ui.item).parents('[' + attr.VIEW_ATTR + ']').attr(attr.VIEW_ATTR);
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
  onShow: function onShow() {
    /**
      * If we are displaying a new column that will be rendered off the page
      * then we need to scroll over in order to see it when it is added.
    */
    var view = this;
    var attr = view.domAttributes;
    var columns = $(attr.PARENT_CONTAINER_CLASS)[0];
    var board = view.$el.parents(attr.BOARD_CLASS);
    if (columns.scrollWidth > window.outerWidth && board.hasClass(attr.COLUMN_ADD_CLASS)) {
      columns.scrollLeft = columns.scrollWidth;
    }
    view.upgradeComponents();
  },
  onRender: function onRender() {
    this.bindTasks();
  },
  upgradeComponents: function upgradeComponents() {
    var view = this;
    Tyto.Utils.upgradeMDL(view.getMDLMap());
  },
  updateTitle: function updateTitle() {
    this.model.save({
      title: this.ui.columnTitle.text()
    });
  },
  addTask: function addTask() {
    var view = this;
    var attr = view.domAttributes;
    this.collection.add(Tyto.Tasks.create({
      columnId: view.model.id,
      boardId: view.options.board.id,
      ordinal: view.collection.length + 1
    }));
    view.$el.addClass(attr.TASK_ADD_CLASS);
  },
  deleteColumn: function deleteColumn() {
    if (this.collection.length === 0 || confirm(Tyto.CONFIRM_MESSAGE)) {
      while (this.collection.length !== 0) {
        this.collection.first().destroy();
      }
      this.model.destroy();
    }
  }
});

exports.default = ColumnView;

},{"./task":15}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var CookieView = Backbone.Marionette.ItemView.extend({
  template: function template(args) {
    return Tyto.TemplateStore.cookieBanner(args);
  },
  ui: {
    closeBtn: '.tyto-cookies__accept'
  },
  events: {
    'click @ui.closeBtn': 'closeBanner'
  },
  closeBanner: function closeBanner() {
    window.localStorage.setItem('tyto', true);
    Tyto.RootView.removeRegion('Cookie');
    this.destroy();
  }
});
exports.default = CookieView;

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var EditView = Backbone.Marionette.ItemView.extend({
  template: function template(args) {
    return Tyto.TemplateStore.edit(args);
  },
  className: function className() {
    return this.domAttributes.VIEW_CLASS;
  },
  templateHelpers: function templateHelpers() {
    var view = this;
    return {
      selectedColumn: _.findWhere(view.options.columns, {
        id: view.model.get('columnId')
      }),
      board: this.options.board,
      columns: _.sortBy(this.options.columns, 'attributes.title'),
      isNew: this.options.isNew,
      colors: Tyto.TASK_COLORS
    };
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-edit',
    BLOOM_SHOW_CLASS: 'is--showing-bloom',
    EDIT_SHOW_CLASS: 'is--showing-edit-view',
    MODEL_PROP_ATTR: 'data-model-prop',
    HIDDEN_UTIL_CLASS: 'is--hidden'
  },
  props: {
    DEFAULT_COLOR_VALUE: 'default'
  },
  ui: {
    save: '.tyto-edit__save',
    color: '.tyto-edit__color-select__menu-option',
    taskDescription: '.tyto-edit__task-description',
    editDescription: '.tyto-edit__edit-description',
    suggestions: '.tyto-task__suggestions',
    taskTitle: '.tyto-edit__task-title',
    column: '.tyto-edit__column-select__menu-option',
    colorMenu: '.tyto-edit__color-select__menu',
    columnMenu: '.tyto-edit__column-select__menu',
    columnLabel: '.tyto-edit__task-column',
    track: '.tyto-edit__track',
    time: '.tyto-edit__task-time',
    hours: '.tyto-edit__task-time__hours',
    minutes: '.tyto-edit__task-time__minutes'
  },
  events: {
    'click @ui.save': 'saveTask',
    'click @ui.color': 'changeColor',
    'click @ui.column': 'changeColumn',
    'click @ui.track': 'trackTime',
    'click @ui.taskDescription': 'showEditMode',
    'blur @ui.editDescription': 'updateTask',
    'blur @ui.taskTitle': 'updateTask',
    'keydown @ui.taskTitle': 'updateTask',

    /**
      * NOTE:: These are functions that are bootstrapped in from
      * the 'Suggestions' module.
    */
    'keypress @ui.editDescription': 'handleKeyInteraction',
    'keydown @ui.editDescription': 'handleKeyInteraction',
    'keyup @ui.editDescription': 'handleKeyInteraction',
    'click @ui.suggestions': 'selectSuggestion'
  },
  initialize: function initialize() {
    var view = this;
    Tyto.Suggestions.bootstrapView(view);
    Tyto.RootView.el.classList.add('bg--' + view.model.get('color'));
    Tyto.RootView.el.classList.remove(view.domAttributes.BLOOM_SHOW_CLASS);
  },
  getMDLMap: function getMDLMap() {
    var view = this;
    return [{
      el: view.ui.columnMenu[0],
      component: 'MaterialMenu'
    }, {
      el: view.ui.colorMenu[0],
      component: 'MaterialMenu'
    }];
  },
  handleKeyInteraction: function handleKeyInteraction(e) {
    if (e.which === 27) this.updateTask(e);
    this.filterItems(e);
  },
  updateTask: function updateTask(e) {
    var view = this;
    var attr = view.domAttributes;
    var el = e.target;
    var val = el.nodeName === 'TEXTAREA' ? el.value : el.innerHTML;
    view.model.set(el.getAttribute(attr.MODEL_PROP_ATTR), val);
    if (el.nodeName === 'TEXTAREA') {
      var desc = view.ui.taskDescription;
      var edit = view.ui.editDescription;
      desc.html(marked(edit.val()));
      edit.addClass(attr.HIDDEN_UTIL_CLASS);
      desc.removeClass(attr.HIDDEN_UTIL_CLASS);
    }
    if (e.type === 'keydown' && e.which === 27) this.ui.taskTitle.blur();
  },
  onShow: function onShow() {
    Tyto.Utils.upgradeMDL(this.getMDLMap());
  },
  onRender: function onRender() {
    var view = this;
    view.ui.taskDescription.html(marked(view.model.get('description')));
    Tyto.Utils.autoSize(view.ui.editDescription[0]);
    Tyto.Utils.renderTime(view);
  },
  trackTime: function trackTime() {
    Tyto.Utils.showTimeModal(this.model, this);
  },
  showEditMode: function showEditMode() {
    var domAttributes = this.domAttributes;
    var model = this.model;
    var desc = this.ui.taskDescription;
    var edit = this.ui.editDescription;
    desc.addClass(domAttributes.HIDDEN_UTIL_CLASS);edit.removeClass(domAttributes.HIDDEN_UTIL_CLASS).val(model.get('description')).focus();
  },

  /**
    * This is a function for handling fresh tasks and saving them on 'DONE'
  */
  saveTask: function saveTask() {
    var view = this;
    var save = function save() {
      delete view.model.attributes.id;
      Tyto.Tasks.create(view.model.attributes);
      Tyto.navigate('/board/' + view.options.board.id, true);
    };
    if (view.options.columns.length !== 0 && !view.selectedColumnId) {
      alert('whoah, you need to select a column for that new task');
    } else if (view.options.columns.length !== 0 && view.selectedColumnId) {
      save();
    } else if (view.options.columns.length === 0) {
      var newCol = Tyto.Columns.create({
        boardId: view.options.board.id,
        ordinal: 1
      });
      view.model.set('columnId', newCol.id);
      view.model.set('ordinal', 1);
      save();
    }
  },
  changeColumn: function changeColumn(e) {
    var view = this;
    var newColumnId = e.target.getAttribute('data-column-id');
    if (newColumnId !== view.model.get('columnId')) {
      view.ui.column.removeClass(Tyto.SELECTED_CLASS);
      e.target.classList.add(Tyto.SELECTED_CLASS);
      var newOrdinal = Tyto.Tasks.where({
        columnId: newColumnId
      }).length + 1;
      view.ui.columnLabel.text(e.target.textContent);
      view.selectedColumnId = newColumnId;
      view.model.set('columnId', newColumnId);
      view.model.set('ordinal', newOrdinal);
    }
  },
  changeColor: function changeColor(e) {
    var view = this;
    var newColor = e.target.getAttribute('data-color');
    Tyto.RootView.el.classList.add(view.domAttributes.EDIT_SHOW_CLASS);
    if (newColor !== view.props.DEFAULT_COLOR_VALUE) {
      view.ui.color.removeClass(Tyto.SELECTED_CLASS);
      e.target.classList.add(Tyto.SELECTED_CLASS);
      Tyto.RootView.el.classList.remove('bg--' + view.model.get('color'));
      Tyto.RootView.el.classList.add('bg--' + newColor);
      view.model.set('color', newColor);
    }
  },
  onBeforeDestroy: function onBeforeDestroy() {
    var view = this;
    Tyto.RootView.$el.removeClass('bg--' + view.model.get('color'));
    Tyto.RootView.$el.removeClass(view.domAttributes.EDIT_SHOW_CLASS);
    if (!view.options.isNew) {
      view.model.save();
    }
  }
});

exports.default = EditView;

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var MenuView = Backbone.Marionette.ItemView.extend({
  template: function template(args) {
    return Tyto.TemplateStore.menu(args);
  },
  tagName: 'div',
  className: function className() {
    return this.domAttributes.VIEW_CLASS;
  },
  ui: {
    addBoardBtn: '.tyto-menu__add-board',
    exportBtn: '.tyto-menu__export',
    loadBtn: '.tyto-menu__load',
    importBtn: '.tyto-menu__import',
    deleteBtn: '.tyto-menu__delete-save',
    exporter: '.tyto-menu__exporter',
    importer: '.tyto-menu__importer',
    action: 'button'
  },
  events: {
    'click  @ui.addBoardBtn': 'addBoard',
    'click  @ui.exportBtn': 'exportData',
    'click  @ui.deleteBtn': 'deleteAppData',
    'click  @ui.loadBtn': 'initLoad',
    'click  @ui.importBtn': 'initLoad',
    'click  @ui.action': 'restoreContent',
    'change @ui.importer': 'handleFile'
  },
  props: {
    DOWNLOAD_FILE_NAME: 'barn.json'
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-menu',
    MENU_VISIBLE_CLASS: 'is-visible'
  },
  onShow: function onShow() {
    var view = this;
    /**
      * The MenuView of Tyto handles the JSON import and export for the
      * application making use of the 'Utils' modules' 'load' function.
    */
    view.reader = new FileReader();
    view.reader.onloadend = function (e) {
      var data = JSON.parse(e.target.result);
      if (view.activeImporter.id === view.ui.loadBtn.attr('id')) {
        Tyto.Utils.load(data, false, true);
      } else {
        Tyto.Utils.load(data, true, false);
      }
      Tyto.navigate('/', true);
    };
  },
  restoreContent: function restoreContent() {
    var props = this.domAttributes;
    var $visibles = Tyto.RootView.getRegion('Menu').$el.parent().find('.' + props.MENU_VISIBLE_CLASS);
    $visibles.removeClass(props.MENU_VISIBLE_CLASS);
  },
  handleFile: function handleFile(e) {
    var view = this;
    var file = e.target.files[0];
    if (file.type.match('application/json') || file.name.indexOf('.json' !== -1)) {
      view.reader.readAsText(file);
      this.ui.importer[0].value = null;
    } else {
      alert('[tyto] only valid json files allowed');
    }
  },
  initLoad: function initLoad(e) {
    this.activeImporter = e.currentTarget;
    var anchor = this.ui.importer[0];
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      anchor.click();
    } else {
      alert('[tyto] Unfortunately the file APIs are not fully supported in your browser');
    }
  },
  exportData: function exportData() {
    var view = this;
    var anchor = view.ui.exporter[0];
    var exportable = {};
    _.forOwn(window.localStorage, function (val, key) {
      if (key.indexOf('tyto') !== -1) {
        return exportable[key] = val;
      }
    });
    var filename = view.props.DOWNLOAD_FILE_NAME;
    var content = 'data:text/plain,' + JSON.stringify(exportable);
    anchor.setAttribute('download', filename);
    anchor.setAttribute('href', content);
    anchor.click();
  },
  deleteAppData: function deleteAppData() {
    _.forOwn(window.localStorage, function (val, key) {
      if (key.indexOf('tyto') !== -1 && key !== 'tyto') {
        return window.localStorage.removeItem(key);
      }
    });
    Tyto.Boards.reset();
    Tyto.Columns.reset();
    Tyto.Tasks.reset();
    Tyto.navigate('/', true);
  },
  addBoard: function addBoard() {
    Tyto.navigate('board/' + Tyto.Boards.create().id, true);
  }
});

exports.default = MenuView;

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var RootLayout = Backbone.Marionette.LayoutView.extend({
  el: '#tyto-app',
  regions: {
    Menu: '#tyto-menu',
    Content: '#tyto-content'
  }
});

exports.default = RootLayout;

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var SelectView = Backbone.Marionette.ItemView.extend({
  template: function template(args) {
    return Tyto.TemplateStore.select(args);
  },
  tagName: 'div',
  className: function className() {
    return this.domAttributes.VIEW_CLASS;
  },
  ui: {
    add: '.tyto-select__add-board',
    load: '.tyto-select__load-intro-board',
    boardSelector: '.tyto-select__board-selector'
  },
  events: {
    'click @ui.add': 'addBoard',
    'change @ui.boardSelector': 'showBoard',
    'click @ui.load': 'loadIntro'
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-select'
  },
  collectionEvents: {
    'all': 'render'
  },
  addBoard: function addBoard() {
    this.showBoard(Tyto.Boards.create().id);
  },
  loadIntro: function loadIntro() {
    var view = this;
    var id = void 0;
    Tyto.RootView.$el.addClass(Tyto.LOADING_CLASS);
    $.getJSON(Tyto.INTRO_JSON_SRC, function (d) {
      Tyto.RootView.$el.removeClass(Tyto.LOADING_CLASS);
      Tyto.Utils.load(d, true, false);
      _.forOwn(d, function (val, key) {
        if (key.indexOf('tyto--board-') !== -1) {
          id = JSON.parse(val).id;
        }
      });
      view.showBoard(id);
    });
  },
  showBoard: function showBoard(id) {
    if (typeof id !== 'string') {
      id = this.ui.boardSelector.val();
    }
    Tyto.navigate('board/' + id, {
      trigger: true
    });
  }
});

exports.default = SelectView;

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var TaskView = Backbone.Marionette.ItemView.extend({
  tagName: 'div',
  className: function className() {
    return this.domAttributes.VIEW_CLASS + this.model.attributes.color;
  },
  attributes: function attributes() {
    var attr = {};
    attr[this.domAttributes.VIEW_ATTR] = this.model.get('id');
    return attr;
  },
  template: function template(args) {
    return Tyto.TemplateStore.task(args);
  },
  ui: {
    deleteTask: '.tyto-task__delete-task',
    editTask: '.tyto-task__edit-task',
    trackTask: '.tyto-task__track-task',
    description: '.tyto-task__description',
    title: '.tyto-task__title',
    menu: '.tyto-task__menu',
    hours: '.tyto-task__time__hours',
    minutes: '.tyto-task__time__minutes',
    time: '.tyto-task__time',
    editDescription: '.tyto-task__description-edit',
    suggestions: '.tyto-task__suggestions'
  },
  events: {
    'click @ui.deleteTask': 'deleteTask',
    'click @ui.editTask': 'editTask',
    'click @ui.trackTask': 'trackTask',
    'blur  @ui.title': 'saveTaskTitle',
    'keydown @ui.title': 'saveTaskTitle',
    'blur  @ui.editDescription': 'saveTaskDescription',
    'click @ui.description': 'showEditMode',

    /**
      * NOTE:: These are functions that are bootstrapped in from
      * the 'Suggestions' module.
     */
    'keypress @ui.editDescription': 'handleKeyInteraction',
    'keydown @ui.editDescription': 'handleKeyInteraction',
    'keyup @ui.editDescription': 'handleKeyInteraction',
    'click @ui.suggestions': 'selectSuggestion'
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-task mdl-card mdl-shadow--2dp bg--',
    VIEW_ATTR: 'data-task-id',
    IS_BEING_ADDED_CLASS: 'is--adding-task',
    COLUMN_CLASS: '.tyto-column',
    TASK_CONTAINER_CLASS: '.tyto-column__tasks',
    HIDDEN_UTIL_CLASS: 'is--hidden',
    INDICATOR: '.indicator'
  },
  getMDLMap: function getMDLMap() {
    var view = this;
    return [{
      el: view.ui.menu[0],
      component: 'MaterialMenu'
    }];
  },
  handleKeyInteraction: function handleKeyInteraction(e) {
    if (e.which === 27) this.saveTaskDescription();
    this.filterItems(e);
  },
  initialize: function initialize() {
    var view = this;
    var attr = view.domAttributes;
    Tyto.Suggestions.bootstrapView(view);
    view.$el.on(Tyto.ANIMATION_EVENT, function () {
      $(this).parents(attr.COLUMN_CLASS).removeClass(attr.IS_BEING_ADDED_CLASS);
    });
  },
  deleteTask: function deleteTask() {
    if (confirm(Tyto.CONFIRM_MESSAGE)) {
      this.model.destroy();
    }
  },
  onShow: function onShow() {
    var view = this;
    var attr = view.domAttributes;
    var container = view.$el.parents(attr.TASK_CONTAINER_CLASS)[0];
    var column = view.$el.parents(attr.COLUMN_CLASS);
    if (container.scrollHeight > container.offsetHeight) {
      container.scrollTop = container.scrollHeight;
    }
    Tyto.Utils.upgradeMDL(view.getMDLMap());
  },
  onRender: function onRender() {
    var view = this;
    view.ui.description.html(marked(view.model.get('description')));
    Tyto.Utils.autoSize(view.ui.editDescription[0]);
    Tyto.Utils.renderTime(view);
  },
  trackTask: function trackTask(e) {
    Tyto.Utils.showTimeModal(this.model, this);
  },
  editTask: function editTask(e) {
    var view = this;
    var boardId = view.model.get('boardId');
    var taskId = view.model.id;
    var editUrl = '#board/' + boardId + '/task/' + taskId;
    Tyto.Utils.bloom(view.ui.editTask[0], view.model.get('color'), editUrl);
  },
  showEditMode: function showEditMode() {
    var domAttributes = this.domAttributes;
    var model = this.model;
    var desc = this.ui.description;
    var edit = this.ui.editDescription;
    desc.addClass(domAttributes.HIDDEN_UTIL_CLASS);
    edit.removeClass(domAttributes.HIDDEN_UTIL_CLASS).val(model.get('description')).focus();
  },
  saveTaskDescription: function saveTaskDescription(e) {
    var domAttributes = this.domAttributes;
    var edit = this.ui.editDescription;
    var desc = this.ui.description;
    edit.addClass(domAttributes.HIDDEN_UTIL_CLASS);
    desc.removeClass(domAttributes.HIDDEN_UTIL_CLASS);
    var content = edit.val();
    this.model.save({
      description: content
    });
    desc.html(marked(content));
    this.hideSuggestions();
  },
  saveTaskTitle: function saveTaskTitle(e) {
    this.model.save({
      title: this.ui.title.text().trim()
    });
    if (e.type === 'keydown' && e.which === 27) this.ui.title.blur();
  }
});

exports.default = TaskView;

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var TimeModal = Backbone.Marionette.ItemView.extend({
  template: function template(args) {
    return Tyto.TemplateStore.timeModal(args);
  },
  className: function className() {
    return this.domAttributes.VIEW_CLASS;
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-time-modal',
    PLAY_ICON: 'play_arrow',
    PAUSE_ICON: 'pause'
  },
  ui: {
    timerBtn: '.tyto-time-modal__timer',
    taskDescription: '.tyto-time-modal__content-description',
    timerIcon: '.tyto-time-modal__timer-icon',
    resetBtn: '.tyto-time-modal__timer-reset',
    closeBtn: '.tyto-time-modal__close',
    timeLbl: '.tyto-time-modal__timer-lbl',
    hours: '.tyto-time-modal__timer-lbl-hours',
    minutes: '.tyto-time-modal__timer-lbl-minutes',
    seconds: '.tyto-time-modal__timer-lbl-seconds'
  },
  events: {
    'click @ui.closeBtn': 'closeModal',
    'click @ui.timerBtn': 'toggleTimer',
    'click @ui.resetBtn': 'resetTimer'
  },
  startTimer: function startTimer() {
    var view = this;
    view.isTiming = true;
    view.ui.timerIcon.text(view.domAttributes.PAUSE_ICON);
    view.ui.resetBtn.attr('disabled', true);
    view.ui.resetBtn.removeClass('mdl-button--accent');
    view.ui.closeBtn.attr('disabled', true);
    view.ui.closeBtn.removeClass('mdl-button--accent');
    view.timingInterval = setInterval(function () {
      view.incrementTime();
      view.renderTime();
    }, 1000);
  },
  incrementTime: function incrementTime() {
    var view = this;
    var time = view.model.get('timeSpent');
    time.seconds++;
    if (time.seconds >= 60) {
      time.seconds = 0;
      time.minutes++;
      if (time.minutes >= 60) {
        time.minutes = 0;
        return time.hours++;
      }
    }
  },
  renderTime: function renderTime() {
    var view = this;
    var newTime = Tyto.Utils.getRenderFriendlyTime(view.model.get('timeSpent'));
    var _arr = ['hours', 'minutes', 'seconds'];
    for (var _i = 0; _i < _arr.length; _i++) {
      var measure = _arr[_i];
      if (view.ui[measure].text() !== newTime[measure]) view.ui[measure].text(newTime[measure]);
    }
  },
  onRender: function onRender() {
    var view = this;
    view.ui.taskDescription.html(marked(view.model.get('description')));
    view.renderTime();
  },
  stopTimer: function stopTimer() {
    var view = this;
    view.isTiming = false;
    view.ui.timerIcon.text(view.domAttributes.PLAY_ICON);
    view.ui.resetBtn.removeAttr('disabled');
    view.ui.resetBtn.addClass('mdl-button--accent');
    view.ui.closeBtn.removeAttr('disabled');
    view.ui.closeBtn.addClass('mdl-button--accent');
    clearInterval(view.timingInterval);
  },
  resetTimer: function resetTimer() {
    var view = this;
    view.model.set('timeSpent', {
      hours: 0,
      minutes: 0,
      seconds: 0
    });
    view.renderTime();
  },
  toggleTimer: function toggleTimer() {
    var view = this;
    if (view.isTiming) {
      view.stopTimer();
    } else {
      view.startTimer();
    }
  },
  closeModal: function closeModal() {
    var view = this;
    view.model.save({
      timeSpent: view.model.get('timeSpent')
    });
    Tyto.RootView.getRegion('TimeModal').$el.remove();
    Tyto.RootView.removeRegion('TimeModal');
    Tyto.Utils.renderTime(view.options.modelView);
    view.destroy();
  }
});

exports.default = TimeModal;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _task = require('./task');

var _task2 = _interopRequireDefault(_task);

var _board = require('./board');

var _board2 = _interopRequireDefault(_board);

var _column = require('./column');

var _column2 = _interopRequireDefault(_column);

var _edit = require('./edit');

var _edit2 = _interopRequireDefault(_edit);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

var _menu = require('./menu');

var _menu2 = _interopRequireDefault(_menu);

var _select = require('./select');

var _select2 = _interopRequireDefault(_select);

var _cookie = require('./cookie');

var _cookie2 = _interopRequireDefault(_cookie);

var _time = require('./time');

var _time2 = _interopRequireDefault(_time);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Views = function Views(_Views, App, Backbone) {
  _Views.Root = _root2.default;
  _Views.Task = _task2.default;
  _Views.Column = _column2.default;
  _Views.Board = _board2.default;
  _Views.Edit = _edit2.default;
  _Views.Menu = _menu2.default;
  _Views.Select = _select2.default;
  _Views.CookieBanner = _cookie2.default;
  _Views.TimeModal = _time2.default;
};

exports.default = Views;

},{"./board":8,"./column":9,"./cookie":10,"./edit":11,"./menu":12,"./root":13,"./select":14,"./task":15,"./time":16}]},{},[1]);
 }());