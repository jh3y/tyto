const Models = function(Models, App, Backbone) {
  Models.Board = Backbone.Model.extend({
    defaults: {
      title: 'New Board'
    }
  });
  Models.BoardCollection = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('tyto--board'),
    model       : Models.Board
  });
  Models.Column = Backbone.Model.extend({
    defaults: {
      title  : 'New Column',
      ordinal: 1
    },
    localStorage: new Backbone.LocalStorage('tyto--column')
  });
  Models.ColumnCollection = Backbone.Collection.extend({
    model       : Models.Column,
    localStorage: new Backbone.LocalStorage('tyto--column')
  });
  Models.Task = Backbone.Model.extend({
    defaults: {
      title      : 'New Todo',
      description: 'Making this work!',
      color      : 'yellow',
      timeSpent  : {
        hours  : 0,
        minutes: 0,
        seconds: 0
      }
    },
    localStorage: new Backbone.LocalStorage('tyto--task')
  });
  Models.TaskCollection = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('tyto--task'),
    model       : Models.Task
  });
};

export default Models;
