module.exports = (Columns, App, Backbone) ->
  Columns.Column = Backbone.Model.extend
    defaults:
      title: 'New Column'

  Columns.ColumnList = Backbone.Collection.extend
    model: Columns.Column
