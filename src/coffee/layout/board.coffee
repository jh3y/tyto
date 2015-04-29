
Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Column = Backbone.Marionette.CompositeView.extend
    template: tytoTmpl.column
    ui:
      deleteColumn: '#delete-column'
    events:
      'click @ui.deleteColumn': 'deleteColumn'
    deleteColumn: ->
      this.trigger 'destroy:column', this.model
    initialize: ->
      # Will listen to vent calls to flush out views
      this.listenTo Tyto.vent, 'flush', (d) ->
        console.log d, this,'GETTING HERE'
        this.model.destroy()
        this.destroy()

Tyto.module 'Layout', (Layout, App, Backbone) ->
  Layout.Board = Backbone.Marionette.CompositeView.extend
    template: tytoTmpl.board
    childView: Layout.Column
    childViewContainer: '.columns'
    deletedCols: []
    newCols: []
    modelEvents:
      'destroy': 'render'
    ui:
      addColumn: '#add-column'
      saveBoard: '#save-board'
      deleteBoard: '#delete-board'
    events:
      'click @ui.addColumn': 'addColumn'
      'click @ui.saveBoard': 'saveBoard'
      'click @ui.deleteBoard': 'deleteBoard'
    initialize: ->
      this.newCols = []
      this.deletedCols = []
      console.info 'created board viw'
      this.on 'childview:destroy:column', (d) ->
        this.collection.remove d.model
        this.deletedCols.push d
        this.render()
    onRender: ->
      console.info 'renderrring', this.collection.length
    addColumn: ->
      newCol = new Tyto.Columns.Column()
      this.model.get('columns').add newCol
      this.newCols.push newCol
      this.collection = this.model.get 'columns'
      this.render()
      return
    saveBoard: ->
      if this.newCols.length > 0
        _.forEach this.newCols, (col) ->
          col.save()
        this.newCols = []
      this.model.save()
      ## Need to clean up deleted columns on save from localStorage.
      if this.deletedCols.length > 0
        _.forEach this.deletedCols, (col) ->
          col.model.destroy()
        this.deletedCols = []
      this.collection = this.model.get 'columns'
      this.render()
    deleteBoard: ->
      Tyto.vent.trigger 'flush', this.model.get 'id'
      this.newCols = []
      this.deletedCols = []
      this.model.destroy()
      this.destroy()
      Tyto.navigate '/',
        trigger: true
