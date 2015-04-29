Tyto.module 'Columns', (Columns, App, Backbone) ->
  Columns.Column = Backbone.Model.extend
    localStorage: new Backbone.LocalStorage 'tyto--col'
    defaults:
      title: 'New Column'
    initialize: ->
      console.info 'created a new column'

  Columns.ColumnList = Backbone.Collection.extend
    model: Columns.Column
    initialize: ->
      console.info 'new columns collection created.'

  return
