/**
  * Global App Controller
*/
const AppCtrl = function(AppCtrl, App, Backbone, Marionette) {
  AppCtrl.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'board/:board'                   : 'showBoardView',
      'board/:board/task/:task'        : 'showEditView',
      'board/:board/task/:task?:params': 'showEditView',
      '*path'                          : 'showSelectView'
    }
  });
  AppCtrl.Controller = Marionette.Controller.extend({
    start: function() {
      this.showMenu();
      if (window.localStorage && !window.localStorage.tyto) {
        this.showCookieBanner();
      }
    },
    showSelectView: function() {
      Tyto.SelectView = new App.Views.Select({
        collection: Tyto.Boards
      });
      Tyto.RootView.showChildView('Content', Tyto.SelectView);
    },
    showMenu: function() {
      Tyto.MenuView = new App.Views.Menu();
      Tyto.RootView.showChildView('Menu', Tyto.MenuView);
    },
    showCookieBanner: function() {
      /*
        Show cookie banner by creating a temporary region and showing
        the view.
       */
      Tyto.RootView.$el.prepend($('<div id="cookie-banner"></div>'));
      Tyto.RootView.addRegion('Cookie', '#cookie-banner');
      Tyto.CookieBannerView = new App.Views.CookieBanner();
      Tyto.RootView.showChildView('Cookie', Tyto.CookieBannerView);
    },
    showBoardView: function(id) {
      let cols, model, tasks;
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
    showEditView: function(bId, tId, params) {
      let taskToEdit;
      const board = Tyto.Boards.get(bId);
      const columns = Tyto.Columns.where({
        boardId: bId
      });
      let parentColumn;
      let isNew = false;
      if (params) {
        let qS = Tyto.Utils.processQueryString(params);
        if (qS.isFresh === 'true') {
          isNew = true;
          taskToEdit = Tyto.TempTask = new Tyto.Models.Task({
            boardId: bId,
            id     : tId
          });
        }
      } else {
        taskToEdit = Tyto.Tasks.get(tId);
      }
      if (taskToEdit && board) {
        Tyto.EditView = new App.Views.Edit({
          model  : taskToEdit,
          board  : board,
          columns: columns,
          isNew  : isNew
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

export default AppCtrl;
