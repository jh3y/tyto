Models = (Models, App, Backbone) ->
  Models.Board = Backbone.Model.extend
    defaults:
      title: 'New Board'
    # localStorage: new Backbone.LocalStorage 'tyto--board'

  Models.BoardCollection = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto--board'
    model: Models.Board

  Models.Column = Backbone.Model.extend
    defaults:
      title: 'New Column'
      ordinal: 1
    localStorage: new Backbone.LocalStorage 'tyto--column'

  Models.ColumnCollection = Backbone.Collection.extend
    model: Models.Column
    localStorage: new Backbone.LocalStorage 'tyto--column'

  Models.Task = Backbone.Model.extend
    defaults:
      title      : 'New Todo'
      description: 'Making this work!'
      color      : 'yellow'
    localStorage: new Backbone.LocalStorage 'tyto--task'

  Models.TaskCollection = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto--task'
    model: Models.Task


module.exports = Models
