/*
tyto - http://jh3y.github.io/tyto
Licensed under the MIT license

jh3y (c) 2015

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function() { (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Tyto, TytoApp, TytoCtrl, TytoModels, TytoViews, Utils;

TytoApp = require('./config/tyto');

window.Tyto = Tyto = new TytoApp();

Tyto.TemplateStore = require('./templates/templates');

TytoCtrl = require('./controllers/tyto');

TytoViews = require('./views/tyto');

TytoModels = require('./models/tyto');

Utils = require('./utils/tyto');

Tyto.module('Models', TytoModels);

Tyto.module('Ctrl', TytoCtrl);

Tyto.module('Views', TytoViews);

Tyto.module('Utils', Utils);

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
    var e, error, out, prot;
    if (this.options.sanitize) {
      try {
        prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g, '').toLowerCase();
      } catch (error) {
        e = error;
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


},{"./config/tyto":2,"./controllers/tyto":3,"./models/tyto":4,"./templates/templates":5,"./utils/tyto":6,"./views/tyto":16}],2:[function(require,module,exports){
var appConfig;

appConfig = Marionette.Application.extend({
  navigate: function(route, opts) {
    return Backbone.history.navigate(route, opts);
  },
  setRootLayout: function() {
    return Tyto.RootView = new Tyto.Views.Root();
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

module.exports = appConfig;


},{}],3:[function(require,module,exports){

/*
  This needs a new name for sure.
 */
var AppCtrl;

AppCtrl = function(AppCtrl, App, Backbone, Marionette) {
  AppCtrl.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'board/:board': 'showBoardView',
      'board/:board/task/:task': 'showEditView',
      'board/:board/task/:task?:params': 'showEditView',
      '*path': 'showSelectView'
    }
  });
  return AppCtrl.Controller = Marionette.Controller.extend({
    start: function() {
      this.showMenu();
      if (window.localStorage && !window.localStorage.tyto) {
        return this.showCookieBanner();
      }
    },
    showSelectView: function() {
      Tyto.SelectView = new App.Views.Select({
        collection: Tyto.Boards
      });
      return Tyto.RootView.showChildView('Content', Tyto.SelectView);
    },
    showMenu: function() {
      Tyto.MenuView = new App.Views.Menu();
      return Tyto.RootView.showChildView('Menu', Tyto.MenuView);
    },
    showCookieBanner: function() {

      /*
        Show cookie banner by creating a temporary region and showing
        the view.
       */
      Tyto.RootView.$el.prepend($('<div id="cookie-banner"></div>'));
      Tyto.RootView.addRegion('Cookie', '#cookie-banner');
      Tyto.CookieBannerView = new App.Views.CookieBanner();
      return Tyto.RootView.showChildView('Cookie', Tyto.CookieBannerView);
    },
    showBoardView: function(id) {
      var cols, model, tasks;
      Tyto.ActiveBoard = model = Tyto.Boards.get(id);
      if (model !== undefined) {
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
        return App.RootView.showChildView('Content', Tyto.BoardView);
      } else {
        return App.navigate('/', true);
      }
    },
    showEditView: function(bId, tId, params) {
      var board, columns, isNew, parentColumn, qS, taskToEdit;
      board = Tyto.Boards.get(bId);
      columns = Tyto.Columns.where({
        boardId: bId
      });
      parentColumn = undefined;
      isNew = false;
      if (params) {
        qS = Tyto.Utils.processQueryString(params);
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
        return App.RootView.showChildView('Content', Tyto.EditView);
      } else if (board) {
        return Tyto.navigate('/board/' + board.id, true);
      } else {
        return Tyto.navigate('/', true);
      }
    }
  });
};

module.exports = AppCtrl;


},{}],4:[function(require,module,exports){
var Models;

Models = function(Models, App, Backbone) {
  Models.Board = Backbone.Model.extend({
    defaults: {
      title: 'New Board'
    }
  });
  Models.BoardCollection = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('tyto--board'),
    model: Models.Board
  });
  Models.Column = Backbone.Model.extend({
    defaults: {
      title: 'New Column',
      ordinal: 1
    },
    localStorage: new Backbone.LocalStorage('tyto--column')
  });
  Models.ColumnCollection = Backbone.Collection.extend({
    model: Models.Column,
    localStorage: new Backbone.LocalStorage('tyto--column')
  });
  Models.Task = Backbone.Model.extend({
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
  return Models.TaskCollection = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('tyto--task'),
    model: Models.Task
  });
};

module.exports = Models;


},{}],5:[function(require,module,exports){
module.exports = { "board": function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="tyto-board__options"><button id="tyto-board__menu" title="Board options" class="mdl-button mdl-js-button mdl-button--icon tyto-board__menu-btn "><i class="material-icons">more_vert</i></button><ul for="tyto-board__menu" class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-board__menu mdl-menu--bottom-right"><li class="tyto-board__wipe-board mdl-menu__item">Wipe board</li><li class="tyto-board__delete-board mdl-menu__item">Delete board</li><li class="tyto-board__email-board mdl-menu__item">Email board</li><a style="display: none;" class="tyto-board__emailer"></a></ul></div><div class="tyto-board__details"><h1 contenteditable="true" class="tyto-board__title bg--white">' +
((__t = ( title )) == null ? '' : __t) +
'</h1>';
 if (boards.length > 1) { ;
__p += '<button id="tyto-board__selector" title="Select a board" class="mdl-button mdl-js-button mdl-button--icon tyto-board__selector__menu-btn "><i class="material-icons">expand_more</i></button><ul for="tyto-board__selector" class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-board__selector__menu mdl-menu--bottom-right">';
 _.each(boards.models, function(i){ ;
__p += '\n';
 if (i.attributes.id != id) { ;
__p += '<li title="View board" class="mdl-menu__item tyto-board__selector-option"><a href="#board/' +
((__t = ( i.attributes.id )) == null ? '' : __t) +
'">' +
((__t = ( i.attributes.title )) == null ? '' : __t) +
'</a></li>';
 } ;
__p += '\n';
 }) ;
__p += '</ul>';
 } ;
__p += '</div><div class="tyto-board__columns"></div><div class="tyto-board__actions mdl-button--fab_flinger-container"><button class="tyto-board__add-entity mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored"><i class="material-icons">add</i></button><div class="mdl-button--fab_flinger-options"><button title="Add task" class="tyto-board__super-add mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored"><i class="material-icons">description</i><i class="material-icons sub">add</i></button><button title="Add column" class="tyto-board__add-column mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored"><i class="material-icons">view_column</i><i class="material-icons sub">add</i></button></div></div><div class="tyto-board__bloomer"></div>';

}
return __p
},"column": function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class="tyto-column__content"><div class="tyto-column__actions"><i title="Move column" class="tyto-column__mover material-icons does--fade">open_with</i><h6 contenteditable="true" title="Column title" class="tyto-column__title input--fade bg--white">' +
((__t = ( title )) == null ? '' : __t) +
'</h6><button id="' +
((__t = ( id )) == null ? '' : __t) +
'--menu" title="Column options" class="mdl-button mdl-js-button mdl-button--icon tyto-column__menu-btn does--fade"><i class="material-icons">more_vert</i></button><ul for="' +
((__t = ( id )) == null ? '' : __t) +
'--menu" class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-column__menu mdl-menu--bottom-right"><li title="Delete column" class="tyto-column__delete-column mdl-menu__item">Delete</li><li title="Add task" class="tyto-column__add-task mdl-menu__item">Add task</li></ul></div><div class="tyto-column__tasks"></div><div class="tyto-column__action"><i title="Add task" class="material-icons tyto-column__add-task does--fade">add</i></div></div>';

}
return __p
},"cookieBanner": function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class="tyto-cookies bg--blue"><img src="img/tyto.png"/><p>tyto uses cookies that enable it to provide functionality and a better user experience. By using tyto and closing this message you agree to the use of cookies. <a href="cookies.html" target="_blank">Read more...</a></p><button class="tyto-cookies__accept mdl-button mdl-js-button mdl-button--raised mdl-button--accent mdl-js-ripple-effect">Close</button></div>';

}
return __p
},"edit": function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="tyto-edit__nav">';
 if (isNew) { ;
__p += '<button class="tyto-edit__save mdl-button mdl-js-button mdl-js-ripple-effect">Done</button><a href="#board/';
 board.id ;
__p += '" class="tyto-edit__cancel mdl-button mdl-js-button mdl-js-ripple-effect">Cancel</a>';
 } else { ;
__p += '<a href="#board/' +
((__t = ( board.id )) == null ? '' : __t) +
'" class="tyto-edit__back mdl-button mdl-js-button mdl-js-ripple-effect">Return to board</a>';
 } ;
__p += '</div><div class="tyto-edit__content"><div class="tyto-edit__details has--bottom-margin"><h1 contenteditable="true" data-model-prop="title" title="Task title" class="tyto-edit__task-title">' +
((__t = ( title )) == null ? '' : __t) +
'</h1><textarea data-model-prop="description" title="Task description" class="tyto-edit__task-description">' +
((__t = ( description )) == null ? '' : __t) +
'</textarea></div><div class="tyto-edit__details-footer tx--right has--bottom-margin"><div title="Time spent" class="tyto-time tyto-edit__task-time"><i class="tyto-time__icon material-icons">schedule</i><span class="tyto-edit__task-time__hours tyto-time__hours">' +
((__t = ( timeSpent.hours )) == null ? '' : __t) +
'h</span><span class="tyto-edit__task-time__minutes tyto-time__minutes">' +
((__t = ( timeSpent.minutes )) == null ? '' : __t) +
'm</span></div><div class="tyto-edit__task-column">';
 if (selectedColumn) { ;
__p += '\n' +
((__t = ( selectedColumn.attributes.title )) == null ? '' : __t) +
'\n';
 } ;
__p += '</div></div><div class="tyto-edit__actions">';
 if (columns.length > 0 ) { ;
__p += '<button id="column-select" title="Select column" class="mdl-button mdl-js-button mdl-button--icon tyto-edit__column-select__menu-btn "><i class="material-icons">view_column</i></button><ul for="column-select" class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-edit__column-select__menu mdl-menu--bottom-right">';
 _.forEach(columns, function(column) { ;
__p += '\n';
 if (!isNew) { var activeClass = (column.attributes.id === columnId) ? 'is--selected': '' } ;
__p += '<li data-column-id="' +
((__t = ( column.id )) == null ? '' : __t) +
'" class="mdl-menu__item tyto-edit__column-select__menu-option ' +
((__t = ( activeClass )) == null ? '' : __t) +
'">' +
((__t = ( column.attributes.title )) == null ? '' : __t) +
'</li>';
 }); ;
__p += '</ul>';
 } ;
__p += '<button id="color-select" title="Change color" class="mdl-button mdl-js-button mdl-button--icon tyto-edit__color-select__menu-btn "><i class="material-icons">color_lens</i></button><ul for="color-select" class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-edit__color-select__menu mdl-menu--bottom-right">';
 _.forEach(colors, function(col) { ;
__p += '\n';
 var activeColor = (col === color) ? 'is--selected': '' ;
__p += '<li data-color="' +
((__t = ( col )) == null ? '' : __t) +
'" title="' +
((__t = ( col )) == null ? '' : __t) +
'" class="mdl-menu__item tyto-edit__color-select__menu-option bg--' +
((__t = ( col )) == null ? '' : __t) +
' hv--' +
((__t = ( col )) == null ? '' : __t) +
' ' +
((__t = ( activeColor )) == null ? '' : __t) +
'"></li>';
 }); ;
__p += '</ul><button title="Start tracking" class="tyto-edit__track mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect"><i class="material-icons">schedule</i></button></div></div>';

}
return __p
},"menu": function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class="mdl-layout-title"><div class="tyto-menu__title"><h1>tyto</h1></div></div><ul class="tyto-menu__actions"><li><button class="tyto-menu__add-board mdl-button mdl-js-button mdl-js-ripple-effect">Add new board</button></li><li><button class="tyto-menu__import mdl-button mdl-js-button mdl-js-ripple-effect">Import data</button></li><li><button class="tyto-menu__load mdl-button mdl-js-button mdl-js-ripple-effect">Load data</button></li><li><button class="tyto-menu__export mdl-button mdl-js-button mdl-js-ripple-effect">Export data</button></li><li><button class="tyto-menu__delete-save mdl-button mdl-js-button mdl-js-ripple-effect">Delete data</button></li><a class="tyto-menu__exporter"></a><input type="file" class="tyto-menu__importer"/><li><div class="github-stats"><div class="github-stats__stars"><iframe src="http://ghbtns.com/github-btn.html?user=jh3y&amp;repo=tyto&amp;type=watch&amp;count=true" allowtransparency="true" frameborder="0" scrolling="0" width="90px" height="20"></iframe></div><div class="github-stats__forks"><iframe src="http://ghbtns.com/github-btn.html?user=jh3y&amp;repo=tyto&amp;type=fork&amp;count=true" allowtransparency="true" frameborder="0" scrolling="0" width="90px" height="20"></iframe></div><div class="github-stats__user"><iframe src="http://ghbtns.com/github-btn.html?user=jh3y&amp;repo=tyto&amp;type=follow&amp;count=true" allowtransparency="true" frameborder="0" scrolling="0" width="120px" height="20"></iframe></div></div></li></ul>';

}
return __p
},"select": function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 if (items.length == 0) { ;
__p += '<p><span>To start,</span><button class="tyto-select__add-board mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">Add a board</button></p><p><span>or</span><button class="tyto-select__load-intro-board mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">Load the intro board</button></p>';
 } else {;
__p += '<p><span>To start, select one of your boards.</span><div class="selector"><select class="tyto-select__board-selector"><option>--select a board--</option>';
 _.each(items, function(i){ ;
__p += '<option value="' +
((__t = ( i.id )) == null ? '' : __t) +
'">' +
((__t = ( i.title )) == null ? '' : __t) +
'</option>';
 }) ;
__p += '</select></div></p><p><span>Alternatively,</span><button class="tyto-select__add-board mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">Add a board</button></p>';
 } ;


}
return __p
},"task": function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="tyto-task__content"><div class="tyto-task__header tx--center"><i title="Move task" class="material-icons tyto-task__mover does--fade">open_with</i><h2 contenteditable="true" title="Task title" class="tyto-task__title">' +
((__t = ( title )) == null ? '' : __t) +
'</h2><button id="' +
((__t = ( id )) == null ? '' : __t) +
'--menu" title="Task options" class="mdl-button mdl-js-button mdl-button--icon tyto-task__menu-btn does--fade"><i class="material-icons">more_vert</i></button><ul for="' +
((__t = ( id )) == null ? '' : __t) +
'--menu" class="mdl-menu mdl-js-menu mdl-js-ripple-effect tyto-task__menu mdl-menu--bottom-right"><li title="Delete task" class="mdl-menu__item tyto-task__delete-task">Delete</li><li title="Edit task" class="mdl-menu__item tyto-task__edit-task">Edit</li><li title="Track task time" class="mdl-menu__item tyto-task__track-task">Track</li></ul></div><div title="Task description" class="mdl-card__supporting-text tyto-task__description">' +
((__t = ( description )) == null ? '' : __t) +
'</div><textarea class="tyto-task__description-edit is--hidden"></textarea>';
 var hidden = (timeSpent.hours > 0 || timeSpent.minutes > 0) ? '': 'is--hidden'; ;
__p += '<div title="Time spent" class="tyto-time tyto-task__time"><i class="tyto-time__icon material-icons">schedule</i><span class="tyto-task__time__hours tyto-time__hours">' +
((__t = ( timeSpent.hours )) == null ? '' : __t) +
'h</span><span class="tyto-task__time__minutes tyto-time__minutes">' +
((__t = ( timeSpent.minutes )) == null ? '' : __t) +
'm</span></div></div>';

}
return __p
},"timeModal": function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class="tyto-time-modal__content mdl-card mdl-shadow--4dp"><div class="tyto-time-modal__content-title mdl-card__title"><h2 class="mdl-card__title-text">' +
((__t = ( title )) == null ? '' : __t) +
'</h2></div><div class="tyto-time-modal__content-text tx--center mdl-card__supporting-text"><p>' +
((__t = ( description )) == null ? '' : __t) +
'</p><h1 class="tyto-time-modal__timer-lbl"><span class="tyto-time-modal__timer-lbl-hours"></span><span>:</span><span class="tyto-time-modal__timer-lbl-minutes"></span><span>:</span><span class="tyto-time-modal__timer-lbl-seconds"></span></h1></div><div class="tyto-time-modal__actions mdl-card__actions mdl-card--border tx--center"><button title="Reset time" class="tyto-time-modal__timer-reset mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect"><i class="material-icons">restore</i></button><button title="Stop/Start tracking" class="tyto-time-modal__timer mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect"><i class="tyto-time-modal__timer-icon material-icons">play_arrow</i></button><button title="Exit tracking" class="tyto-time-modal__close mdl-button mdl-js-button mdl-button--icon mdl-button--accent mdl-js-ripple-effect"><i class="material-icons">clear</i></button></div></div>';

}
return __p
} };
},{}],6:[function(require,module,exports){
var Utils;

Utils = function(Utils, App, Backbone, Marionette) {
  Utils.upgradeMDL = function(map) {
    return _.forEach(map, function(upgrade, idx) {
      if (upgrade.el) {
        return componentHandler.upgradeElement(upgrade.el, upgrade.component);
      }
    });
  };

  /*
    Syncs model 'ordinal' property to that of the DOM representation.
  
    NOTE :: This shouldn't be doing a loop through the collection using
    model.save. With a proper backend this could be avoided but on
    localStorage it will work with no real performance hit.
   */
  Utils.reorder = function(entity, list, attr) {
    var collection;
    collection = entity.collection;
    return _.forEach(list, function(item, idx) {
      var id, model;
      id = item.getAttribute(attr);
      model = collection.get(id);
      if (model) {
        return model.save({
          ordinal: idx + 1
        });
      }
    });
  };
  Utils.processQueryString = function(params) {
    var pushToQs, qS;
    qS = {};
    pushToQs = function(set) {
      set = set.split('=');
      return qS[set[0]] = set[1];
    };
    _.map(params.split('&'), pushToQs);
    return qS;
  };
  Utils.bloom = function(el, color, url) {
    var $bloomer, bloomer, coord, goToEdit;
    $bloomer = Tyto.BoardView.ui.bloomer;
    bloomer = $bloomer[0];
    coord = el.getBoundingClientRect();
    bloomer.style.left = coord.left + (coord.width / 2) + 'px';
    bloomer.style.top = coord.top + (coord.height / 2) + 'px';
    bloomer.className = 'tyto-board__bloomer ' + 'bg--' + color;
    bloomer.classList.add('is--blooming');
    Tyto.RootView.el.classList.add('is--showing-bloom');
    goToEdit = function() {
      $bloomer.off(Tyto.ANIMATION_EVENT, goToEdit);
      return Tyto.navigate(url, true);
    };
    return $bloomer.on(Tyto.ANIMATION_EVENT, goToEdit);
  };
  Utils.load = function(data, importing, wipe) {
    var altered, boards, cols, tasks;
    boards = [];
    cols = [];
    tasks = [];
    altered = {};
    if (importing) {
      delete data.tyto;
      delete data['tyto--board'];
      delete data['tyto--column'];
      delete data['tyto--task'];
    }
    if (wipe) {
      _.forOwn(window.localStorageJ, function(val, key) {
        if (key.indexOf('tyto') !== -1) {
          return window.localStorage.removeItem(key);
        }
      });
    }
    _.forOwn(data, function(val, key) {
      var entity, saveId;
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
          return altered[saveId] = Tyto.Tasks.create(entity).id;
        } else {
          return tasks.push(JSON.parse(val));
        }
      }
    });
    if (!importing) {
      Tyto.Boards.reset(boards);
      Tyto.Columns.reset(cols);
      return Tyto.Tasks.reset(tasks);
    }
  };

  /*
    The EMAIL_TEMPLATE is not a particularly nice thing to look at. In order to
    maintain formatting and not introduce much unwanted whitespace I've resorted
    to using a large string with no indentation.
  
    I did try implementing this part through the templateStore but with mixed results. May return to look at this at a later date.
   */
  Utils.EMAIL_TEMPLATE = '<div>Status for: <%= board.title %>\n\n<% if (columns.length > 0 && tasks.length > 0) { %><% _.forEach(columns, function(column) { %><%= column.attributes.title %>\n&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;\n\n<% _.forEach(tasks, function(task) { %><% if (task.attributes.columnId === column.attributes.id) { %>&#8226; <%= task.attributes.title %>; <%= task.attributes.description %><% if (task.attributes.timeSpent.hours > 0 || task.attributes.timeSpent.minutes > 0) { %> -- <%=task.attributes.timeSpent.hours %> hours, <%= task.attributes.timeSpent.minutes %> minutes.<% } %>\n<% } %><% });%>\n<% }); %><% } else { %>Seems we are way ahead, so treat yourself and go grab a coffee! :)<% } %></div>';
  Utils.getEmailContent = function(board) {
    var content, mailString, recipient, subject, templateFn;
    mailString = 'mailto:';
    recipient = 'someone@somewhere.com';
    subject = 'Status for ' + Tyto.ActiveBoard.get('title') + ' as of ' + new Date().toString();
    templateFn = _.template(Tyto.Utils.EMAIL_TEMPLATE);
    content = templateFn({
      board: board.attributes,
      columns: Tyto.Columns.where({
        boardId: board.id
      }),
      tasks: Tyto.Tasks.where({
        boardId: board.id
      })
    });
    content = $(content).text();
    content = encodeURIComponent(content);
    return mailString + recipient + '?subject=' + encodeURIComponent(subject.trim()) + '&body=' + content;
  };
  Utils.showTimeModal = function(model, view) {
    Tyto.RootView.$el.prepend($('<div class="tyto-time-modal__wrapper"></div>'));
    Tyto.RootView.addRegion('TimeModal', '.tyto-time-modal__wrapper');
    Tyto.TimeModalView = new App.Views.TimeModal({
      model: model,
      modelView: view
    });
    return Tyto.RootView.showChildView('TimeModal', Tyto.TimeModalView);
  };
  Utils.getRenderFriendlyTime = function(time) {
    var i, len, measure, ref, renderTime;
    renderTime = {};
    ref = ['hours', 'minutes', 'seconds'];
    for (i = 0, len = ref.length; i < len; i++) {
      measure = ref[i];
      renderTime[measure] = time[measure] < 10 ? '0' + time[measure] : time[measure];
    }
    return renderTime;
  };
  return Utils.renderTime = function(view) {
    var friendly, time;
    time = view.model.get('timeSpent');
    if (time.hours > 0 || time.minutes > 0) {
      if (view.ui.time.hasClass(view.domAttributes.HIDDEN_UTIL_CLASS)) {
        view.ui.time.removeClass(view.domAttributes.HIDDEN_UTIL_CLASS);
      }
      friendly = Tyto.Utils.getRenderFriendlyTime(time);
      view.ui.hours.text(friendly.hours + 'h');
      return view.ui.minutes.text(friendly.minutes + 'm');
    } else {
      if (!view.ui.time.hasClass(view.domAttributes.HIDDEN_UTIL_CLASS)) {
        return view.ui.time.addClass(view.domAttributes.HIDDEN_UTIL_CLASS);
      }
    }
  };
};

module.exports = Utils;


},{}],7:[function(require,module,exports){
var Column;

Column = require('./column');

module.exports = Backbone.Marionette.CompositeView.extend({
  tagName: 'div',
  className: function() {
    return this.domAttributes.VIEW_CLASS;
  },
  template: Tyto.TemplateStore.board,
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
    var colTasks, view;
    view = this;
    colTasks = Tyto.ActiveTasks.where({
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
  getMDLMap: function() {
    var view;
    view = this;
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
    var list, view;
    view = this;
    list = view.$el.find(view.domAttributes.COLUMN_CLASS);
    return Tyto.Utils.reorder(view, list, view.domAttributes.COLUMN_ATTR);
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
  showPrimaryActions: function(e) {
    var btn, ctn, fabVisibleClass, processClick, view;
    view = this;
    ctn = view.ui.primaryActions[0];
    btn = view.ui.addEntity[0];
    fabVisibleClass = view.domAttributes.FAB_MENU_VISIBLE_CLASS;
    processClick = function(evt) {
      if (e.timeStamp !== evt.timeStamp) {
        ctn.classList.remove(fabVisibleClass);
        ctn.IS_SHOWING_MENU = false;
        return document.removeEventListener('click', processClick);
      }
    };
    if (!ctn.IS_SHOWING_MENU) {
      ctn.IS_SHOWING_MENU = true;
      ctn.classList.add(fabVisibleClass);
      return document.addEventListener('click', processClick);
    }
  },
  onBeforeRender: function() {
    return this.collection.models = this.collection.sortBy('ordinal');
  },
  onShow: function() {

    /*
      Have to upgrade MDL components onShow.
     */
    var view;
    view = this;
    return Tyto.Utils.upgradeMDL(view.getMDLMap());
  },
  onRender: function() {

    /*
      As with manually upgrading MDL, need to invoke jQuery UI sortable
      function on render.
     */
    return this.bindColumns();
  },
  bindColumns: function() {
    var attr, view;
    view = this;
    attr = view.domAttributes;
    return view.ui.columnContainer.sortable({
      connectWith: attr.COLUMN_CLASS,
      handle: attr.COLUMN_MOVER_CLASS,
      placeholder: attr.COLUMN_PLACEHOLDER_CLASS,
      axis: "x",
      containment: view.$childViewContainer,
      stop: function(event, ui) {
        var list;
        list = Array.prototype.slice.call(view.$el.find(attr.COLUMN_CLASS));
        return Tyto.Utils.reorder(view, list, attr.COLUMN_ATTR);
      }
    });
  },
  addNewColumn: function() {
    var board, columns, view;
    view = this;
    board = view.model;
    columns = view.collection;
    view.$el.addClass(view.domAttributes.ADDING_COLUMN_CLASS);
    return columns.add(Tyto.Columns.create({
      boardId: board.id,
      ordinal: columns.length + 1
    }));
  },
  saveBoardName: function() {
    return this.model.save({
      title: this.ui.boardName.text().trim()
    });
  },
  addNewTask: function() {
    var addUrl, board, id, view;
    view = this;
    board = view.model;
    id = _.uniqueId();
    addUrl = '#board/' + board.id + '/task/' + id + '?isFresh=true';
    return Tyto.Utils.bloom(view.ui.addTask[0], Tyto.DEFAULT_TASK_COLOR, addUrl);
  },
  deleteBoard: function() {
    var view;
    view = this;
    if (view.collection.length === 0 || confirm(Tyto.CONFIRM_MESSAGE)) {
      view.wipeBoard();
      view.model.destroy();
      view.destroy();
      return Tyto.navigate('/', {
        trigger: true
      });
    }
  },
  wipeBoard: function(dontConfirm) {
    var view, wipe;
    view = this;
    wipe = function() {
      return view.children.forEach(function(colView) {
        while (colView.collection.length !== 0) {
          colView.collection.first().destroy();
        }
        return colView.model.destroy();
      });
    };
    if (dontConfirm) {
      if (confirm('[tyto] are you sure you wish to wipe the board?')) {
        return wipe();
      }
    } else {
      return wipe();
    }
  },
  emailBoard: function() {
    var emailContent, view;
    view = this;
    emailContent = Tyto.Utils.getEmailContent(view.model);
    this.ui.emailer.attr('href', emailContent);
    return this.ui.emailer[0].click();
  }
});


},{"./column":8}],8:[function(require,module,exports){
var Task;

Task = require('./task');

module.exports = Backbone.Marionette.CompositeView.extend({
  tagName: 'div',
  className: function() {
    return this.domAttributes.VIEW_CLASS;
  },
  attributes: function() {
    var attr;
    attr = {};
    attr[this.domAttributes.VIEW_ATTR] = this.model.get('id');
    return attr;
  },
  template: Tyto.TemplateStore.column,
  childView: Task,
  childViewContainer: function() {
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
  getMDLMap: function() {
    var view;
    view = this;
    return [
      {
        el: view.ui.columnMenu[0],
        component: 'MaterialMenu'
      }
    ];
  },
  handleTaskRemoval: function(e) {
    var attr, list, view;
    view = this;
    attr = view.domAttributes;
    list = Array.prototype.slice.call(view.$el.find(attr.TASK_CLASS));
    return Tyto.Utils.reorder(view, list, attr.TASK_ATTR);
  },
  initialize: function() {
    var attr, view;
    view = this;
    attr = view.domAttributes;
    return view.$el.on(Tyto.ANIMATION_EVENT, function() {
      return view.$el.parents(attr.BOARD_CLASS).removeClass(attr.COLUMN_ADD_CLASS);
    });
  },
  onBeforeRender: function() {
    return this.collection.models = this.collection.sortBy('ordinal');
  },
  bindTasks: function() {
    var attr, view;
    view = this;
    attr = view.domAttributes;
    return view.ui.taskContainer.sortable({
      connectWith: attr.CHILD_VIEW_CONTAINER_CLASS,
      handle: attr.TASK_MOVER_CLASS,
      placeholder: attr.TASK_PLACEHOLDER_CLASS,
      containment: view.domAttributes.PARENT_CONTAINER_CLASS,
      stop: function(event, ui) {

        /*
          This is most likely the most complicated piece of code in `tyto`.
        
          It handles what happens when you move tasks from one column to another.
        
          There may be a better way of doing this in a future release, but,
          essentially we work out if the task is going to move column and if it
          is we grab an instance of the view associated to the column.
        
          We then have to update the tasks' columnID, remove it from it's current collection and add it to the new column collection.
        
          Lastly, we need to run our reordering logic to maintain ordinality on page load.
        
          NOTE:: Also required to manually upgrade our MDL components here
          after view/s have rendered.
         */
        var destination, destinationView, list, model, newColId;
        model = view.collection.get(ui.item.attr(attr.TASK_ATTR));
        destinationView = view;
        newColId = $(ui.item).parents('[' + attr.VIEW_ATTR + ']').attr(attr.VIEW_ATTR);
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
        return view.upgradeComponents();
      }
    });
  },
  onShow: function() {

    /*
      If we are displaying a new column that will be rendered off the page
      then we need to scroll over in order to see it when it is added.
     */
    var attr, board, columns, view;
    view = this;
    attr = view.domAttributes;
    columns = $(attr.PARENT_CONTAINER_CLASS)[0];
    board = view.$el.parents(attr.BOARD_CLASS);
    if (columns.scrollWidth > window.outerWidth && board.hasClass(attr.COLUMN_ADD_CLASS)) {
      columns.scrollLeft = columns.scrollWidth;
    }
    return view.upgradeComponents();
  },
  onRender: function() {
    return this.bindTasks();
  },
  upgradeComponents: function() {
    var view;
    view = this;
    return Tyto.Utils.upgradeMDL(view.getMDLMap());
  },
  updateTitle: function() {
    return this.model.save({
      title: this.ui.columnTitle.text()
    });
  },
  addTask: function() {
    var attr, view;
    view = this;
    attr = view.domAttributes;
    view.$el.addClass(attr.TASK_ADD_CLASS);
    return this.collection.add(Tyto.Tasks.create({
      columnId: view.model.id,
      boardId: view.options.board.id,
      ordinal: view.collection.length + 1
    }));
  },
  deleteColumn: function() {
    if (this.collection.length === 0 || confirm(Tyto.CONFIRM_MESSAGE)) {
      while (this.collection.length !== 0) {
        this.collection.first().destroy();
      }
      return this.model.destroy();
    }
  }
});


},{"./task":14}],9:[function(require,module,exports){
module.exports = Backbone.Marionette.ItemView.extend({
  template: Tyto.TemplateStore.cookieBanner,
  ui: {
    closeBtn: '.tyto-cookies__accept'
  },
  events: {
    'click @ui.closeBtn': 'closeBanner'
  },
  closeBanner: function() {
    window.localStorage.setItem('tyto', true);
    Tyto.RootView.removeRegion('Cookie');
    return this.destroy();
  }
});


},{}],10:[function(require,module,exports){
var EditView;

EditView = Backbone.Marionette.ItemView.extend({
  template: Tyto.TemplateStore.edit,
  className: function() {
    return this.domAttributes.VIEW_CLASS;
  },
  templateHelpers: function() {
    var view;
    view = this;
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
  initialize: function() {
    var view;
    view = this;
    Tyto.RootView.el.classList.add('bg--' + view.model.get('color'));
    return Tyto.RootView.el.classList.remove(view.domAttributes.BLOOM_SHOW_CLASS);
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
    'blur @ui.taskDescription': 'updateTask',
    'blur @ui.taskTitle': 'updateTask'
  },
  getMDLMap: function() {
    var view;
    view = this;
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
  updateTask: function(e) {
    var attr, el, val, view;
    view = this;
    attr = view.domAttributes;
    el = e.target;
    val = el.nodeName === 'TEXTAREA' ? el.value : el.innerHTML;
    return view.model.set(el.getAttribute(attr.MODEL_PROP_ATTR), val);
  },
  onShow: function() {
    return Tyto.Utils.upgradeMDL(this.getMDLMap());
  },
  onRender: function() {
    var view;
    view = this;
    return Tyto.Utils.renderTime(view);
  },
  trackTime: function() {
    return Tyto.Utils.showTimeModal(this.model, this);
  },

  /*
    This is a function for handling fresh tasks and saving them on 'DONE'
   */
  saveTask: function() {
    var newCol, save, view;
    view = this;
    save = function() {
      delete view.model.attributes.id;
      Tyto.Tasks.create(view.model.attributes);
      return Tyto.navigate('/board/' + view.options.board.id, true);
    };
    if (view.options.columns.length !== 0 && !view.selectedColumnId) {
      return alert('whoah, you need to select a column for that new task');
    } else if (view.options.columns.length !== 0 && view.selectedColumnId) {
      return save();
    } else if (view.options.columns.length === 0) {
      newCol = Tyto.Columns.create({
        boardId: view.options.board.id,
        ordinal: 1
      });
      view.model.set('columnId', newCol.id);
      view.model.set('ordinal', 1);
      return save();
    }
  },
  changeColumn: function(e) {
    var newColumnId, newOrdinal, view;
    view = this;
    newColumnId = e.target.getAttribute('data-column-id');
    if (newColumnId !== view.model.get('columnId')) {
      view.ui.column.removeClass(Tyto.SELECTED_CLASS);
      e.target.classList.add(Tyto.SELECTED_CLASS);
      newOrdinal = Tyto.Tasks.where({
        columnId: newColumnId
      }).length + 1;
      view.ui.columnLabel.text(e.target.textContent);
      view.selectedColumnId = newColumnId;
      view.model.set('columnId', newColumnId);
      return view.model.set('ordinal', newOrdinal);
    }
  },
  changeColor: function(e) {
    var newColor, view;
    view = this;
    newColor = e.target.getAttribute('data-color');
    Tyto.RootView.el.classList.add(view.domAttributes.EDIT_SHOW_CLASS);
    if (newColor !== view.props.DEFAULT_COLOR_VALUE) {
      view.ui.color.removeClass(Tyto.SELECTED_CLASS);
      e.target.classList.add(Tyto.SELECTED_CLASS);
      Tyto.RootView.el.classList.remove('bg--' + view.model.get('color'));
      Tyto.RootView.el.classList.add('bg--' + newColor);
      return view.model.set('color', newColor);
    }
  },
  onBeforeDestroy: function() {
    var view;
    view = this;
    Tyto.RootView.$el.removeClass('bg--' + view.model.get('color'));
    Tyto.RootView.$el.removeClass(view.domAttributes.EDIT_SHOW_CLASS);
    if (!view.options.isNew) {
      return view.model.save();
    }
  }
});

module.exports = EditView;


},{}],11:[function(require,module,exports){
module.exports = Backbone.Marionette.ItemView.extend({
  template: Tyto.TemplateStore.menu,
  tagName: 'div',
  className: function() {
    return this.domAttributes.VIEW_CLASS;
  },
  ui: {
    addBoardBtn: '.tyto-menu__add-board',
    exportBtn: '.tyto-menu__export',
    loadBtn: '.tyto-menu__load',
    importBtn: '.tyto-menu__import',
    deleteBtn: '.tyto-menu__delete-save',
    exporter: '.tyto-menu__exporter',
    importer: '.tyto-menu__importer'
  },
  events: {
    'click  @ui.addBoardBtn': 'addBoard',
    'click  @ui.exportBtn': 'exportData',
    'click  @ui.deleteBtn': 'deleteAppData',
    'click  @ui.loadBtn': 'initLoad',
    'click  @ui.importBtn': 'initLoad',
    'change @ui.importer': 'handleFile'
  },
  props: {
    DOWNLOAD_FILE_NAME: 'barn.json'
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-menu'
  },
  onShow: function() {
    var view;
    view = this;

    /*
      The MenuView of Tyto handles the JSON import and export for the
      application making use of the 'Utils' modules' 'load' function.
     */
    view.reader = new FileReader();
    return view.reader.onloadend = function(e) {
      var data;
      data = JSON.parse(e.target.result);
      if (view.activeImporter.id === view.ui.loadBtn.attr('id')) {
        Tyto.Utils.load(data, false, true);
      } else {
        Tyto.Utils.load(data, true, false);
      }
      return Tyto.navigate('/', true);
    };
  },
  handleFile: function(e) {
    var file, view;
    view = this;
    file = e.target.files[0];
    if ((file.type.match('application/json')) || (file.name.indexOf('.json' !== -1))) {
      view.reader.readAsText(file);
    } else {
      alert('[tyto] only valid json files allowed');
    }
  },
  initLoad: function(e) {
    var anchor;
    this.activeImporter = e.currentTarget;
    anchor = this.ui.importer[0];
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      return anchor.click();
    } else {
      return alert('[tyto] Unfortunately the file APIs are not fully supported in your browser');
    }
  },
  exportData: function() {
    var anchor, content, exportable, filename, view;
    view = this;
    anchor = view.ui.exporter[0];
    exportable = {};
    _.forOwn(window.localStorage, function(val, key) {
      if (key.indexOf('tyto') !== -1) {
        return exportable[key] = val;
      }
    });
    filename = view.props.DOWNLOAD_FILE_NAME;
    content = 'data:text/plain,' + JSON.stringify(exportable);
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
    return Tyto.navigate('/', true);
  },
  addBoard: function() {
    return Tyto.navigate('board/' + Tyto.Boards.create().id, true);
  }
});


},{}],12:[function(require,module,exports){
var RootLayout;

RootLayout = Backbone.Marionette.LayoutView.extend({
  el: '#tyto-app',
  regions: {
    Menu: '#tyto-menu',
    Content: '#tyto-content'
  }
});

module.exports = RootLayout;


},{}],13:[function(require,module,exports){
module.exports = Backbone.Marionette.ItemView.extend({
  template: Tyto.TemplateStore.select,
  tagName: 'div',
  className: function() {
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
  initialize: function() {
    var sV;
    return sV = this;
  },
  addBoard: function() {
    return this.showBoard(Tyto.Boards.create().id);
  },
  loadIntro: function() {
    var id, view;
    view = this;
    id = undefined;
    Tyto.RootView.$el.addClass(Tyto.LOADING_CLASS);
    return $.getJSON(Tyto.INTRO_JSON_SRC, function(d) {
      Tyto.RootView.$el.removeClass(Tyto.LOADING_CLASS);
      Tyto.Utils.load(d, true, false);
      _.forOwn(d, function(val, key) {
        if (key.indexOf('tyto--board-') !== -1) {
          return id = JSON.parse(val).id;
        }
      });
      return view.showBoard(id);
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


},{}],14:[function(require,module,exports){
module.exports = Backbone.Marionette.ItemView.extend({
  tagName: 'div',
  className: function() {
    return this.domAttributes.VIEW_CLASS + this.model.attributes.color;
  },
  attributes: function() {
    var attr;
    attr = {};
    attr[this.domAttributes.VIEW_ATTR] = this.model.get('id');
    return attr;
  },
  template: Tyto.TemplateStore.task,
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
    editDescription: '.tyto-task__description-edit'
  },
  events: {
    'click @ui.deleteTask': 'deleteTask',
    'click @ui.editTask': 'editTask',
    'click @ui.trackTask': 'trackTask',
    'blur  @ui.title': 'saveTaskTitle',
    'blur  @ui.editDescription': 'saveTaskDescription',
    'click @ui.description': 'showEditMode'
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-task mdl-card mdl-shadow--2dp bg--',
    VIEW_ATTR: 'data-task-id',
    IS_BEING_ADDED_CLASS: 'is--adding-task',
    COLUMN_CLASS: '.tyto-column',
    TASK_CONTAINER_CLASS: '.tyto-column__tasks',
    HIDDEN_UTIL_CLASS: 'is--hidden'
  },
  getMDLMap: function() {
    var view;
    view = this;
    return [
      {
        el: view.ui.menu[0],
        component: 'MaterialMenu'
      }
    ];
  },
  initialize: function() {
    var attr, view;
    view = this;
    attr = view.domAttributes;
    return view.$el.on(Tyto.ANIMATION_EVENT, function() {
      return $(this).parents(attr.COLUMN_CLASS).removeClass(attr.IS_BEING_ADDED_CLASS);
    });
  },
  deleteTask: function() {
    if (confirm(Tyto.CONFIRM_MESSAGE)) {
      return this.model.destroy();
    }
  },
  onShow: function() {
    var attr, column, container, view;
    view = this;
    attr = view.domAttributes;
    container = view.$el.parents(attr.TASK_CONTAINER_CLASS)[0];
    column = view.$el.parents(attr.COLUMN_CLASS);
    if (container.scrollHeight > container.offsetHeight && column.hasClass(attr.IS_BEING_ADDED_CLASS)) {
      container.scrollTop = container.scrollHeight;
    }
    return Tyto.Utils.upgradeMDL(view.getMDLMap());
  },
  onRender: function() {
    var view;
    view = this;
    view.ui.description.html(marked(view.model.get('description')));
    return Tyto.Utils.renderTime(view);
  },
  trackTask: function(e) {
    return Tyto.Utils.showTimeModal(this.model, this);
  },
  editTask: function(e) {
    var boardId, editUrl, taskId, view;
    view = this;
    boardId = view.model.get('boardId');
    taskId = view.model.id;
    editUrl = '#board/' + boardId + '/task/' + taskId;
    return Tyto.Utils.bloom(view.ui.editTask[0], view.model.get('color'), editUrl);
  },
  showEditMode: function() {
    var desc, domAttributes, edit, model;
    domAttributes = this.domAttributes;
    model = this.model;
    desc = this.ui.description;
    edit = this.ui.editDescription;
    desc.addClass(domAttributes.HIDDEN_UTIL_CLASS);
    return edit.removeClass(domAttributes.HIDDEN_UTIL_CLASS).val(model.get('description')).focus();
  },
  saveTaskDescription: function() {
    var content, desc, domAttributes, edit;
    domAttributes = this.domAttributes;
    edit = this.ui.editDescription;
    desc = this.ui.description;
    edit.addClass(domAttributes.HIDDEN_UTIL_CLASS);
    desc.removeClass(domAttributes.HIDDEN_UTIL_CLASS);
    content = edit.val();
    this.model.save({
      description: content
    });
    return desc.html(marked(content));
  },
  saveTaskTitle: function() {
    return this.model.save({
      title: this.ui.title.text().trim()
    });
  }
});


},{}],15:[function(require,module,exports){
var TimeModal;

TimeModal = Backbone.Marionette.ItemView.extend({
  template: Tyto.TemplateStore.timeModal,
  className: function() {
    return this.domAttributes.VIEW_CLASS;
  },
  domAttributes: {
    VIEW_CLASS: 'tyto-time-modal',
    PLAY_ICON: 'play_arrow',
    PAUSE_ICON: 'pause'
  },
  ui: {
    timerBtn: '.tyto-time-modal__timer',
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
  startTimer: function() {
    var view;
    view = this;
    view.isTiming = true;
    view.ui.timerIcon.text(view.domAttributes.PAUSE_ICON);
    view.ui.resetBtn.attr('disabled', true);
    view.ui.resetBtn.removeClass('mdl-button--accent');
    view.ui.closeBtn.attr('disabled', true);
    view.ui.closeBtn.removeClass('mdl-button--accent');
    return view.timingInterval = setInterval(function() {
      view.incrementTime();
      return view.renderTime();
    }, 1000);
  },
  incrementTime: function() {
    var time, view;
    view = this;
    time = view.model.get('timeSpent');
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
  renderTime: function() {
    var i, len, measure, newTime, ref, results, view;
    view = this;
    newTime = Tyto.Utils.getRenderFriendlyTime(view.model.get('timeSpent'));
    ref = ['hours', 'minutes', 'seconds'];
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      measure = ref[i];
      if (view.ui[measure].text() !== newTime[measure]) {
        results.push(view.ui[measure].text(newTime[measure]));
      } else {
        results.push(void 0);
      }
    }
    return results;
  },
  onRender: function() {
    var view;
    view = this;
    return view.renderTime();
  },
  stopTimer: function() {
    var view;
    view = this;
    view.isTiming = false;
    view.ui.timerIcon.text(view.domAttributes.PLAY_ICON);
    view.ui.resetBtn.removeAttr('disabled');
    view.ui.resetBtn.addClass('mdl-button--accent');
    view.ui.closeBtn.removeAttr('disabled');
    view.ui.closeBtn.addClass('mdl-button--accent');
    return clearInterval(view.timingInterval);
  },
  resetTimer: function() {
    var view;
    view = this;
    view.model.set('timeSpent', {
      hours: 0,
      minutes: 0,
      seconds: 0
    });
    return view.renderTime();
  },
  toggleTimer: function() {
    var view;
    view = this;
    if (view.isTiming) {
      return view.stopTimer();
    } else {
      return view.startTimer();
    }
  },
  closeModal: function() {
    var view;
    view = this;
    view.model.save({
      timeSpent: view.model.get('timeSpent')
    });
    Tyto.RootView.getRegion('TimeModal').el.remove();
    Tyto.RootView.removeRegion('TimeModal');
    Tyto.Utils.renderTime(view.options.modelView);
    return view.destroy();
  }
});

module.exports = TimeModal;


},{}],16:[function(require,module,exports){
var BoardView, ColumnView, CookieBannerView, EditView, MenuView, RootView, SelectView, TaskView, TimeModalView, Views;

TaskView = require('./task');

BoardView = require('./board');

ColumnView = require('./column');

EditView = require('./edit');

RootView = require('./root');

MenuView = require('./menu');

SelectView = require('./select');

CookieBannerView = require('./cookie');

TimeModalView = require('./time');

Views = function(Views, App, Backbone) {
  Views.Root = RootView;
  Views.Task = TaskView;
  Views.Column = ColumnView;
  Views.Board = BoardView;
  Views.Edit = EditView;
  Views.Menu = MenuView;
  Views.Select = SelectView;
  Views.CookieBanner = CookieBannerView;
  return Views.TimeModal = TimeModalView;
};

module.exports = Views;


},{"./board":7,"./column":8,"./cookie":9,"./edit":10,"./menu":11,"./root":12,"./select":13,"./task":14,"./time":15}]},{},[1]);
 }());