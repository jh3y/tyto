Tyto.module 'Columns', (Columns, App, Backbone) ->
  Columns.Column = Backbone.Model.extend
    defaults:
      title: 'New Column'
      todos: []

  Columns.ColumnList = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto--col'
    model: Columns.Column
