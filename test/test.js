describe('tyto', function() {
  var boardModel,
    columnsCollection,
    tasksCollection,
    taskModel,
    testView;
  describe('Views', function() {
    describe('BoardView', function() {
      beforeEach(function(){
        boardModel        = new Tyto.Models.Board();
        columnsCollection = new Tyto.Models.ColumnCollection();
      });
      it('Renders the correct amount of columns', function() {
        testView = new Tyto.Views.Board({
          model     : boardModel,
          collection: columnsCollection
        });
        testView.render();
        expect(testView.$el.find('.tyto-column').length).to.equal(0);
        /* Add a column to the collection and ensure the render happens for one
          column.
        */
        columnsCollection.reset([
          {
            'title'  : 'New Column',
            'boardId': boardModel.id,
            'id'     : 1
          }
        ]);
        expect(testView.$el.find('.tyto-column').length).to.equal(1);
        /*
          Then ensure it happens for more than one.
        */
        columnsCollection.reset([
          {
            'title'  : 'New Column',
            'boardId': boardModel.id,
            'id'     : 1
          },
          {
            'title'  : 'New Column',
            'boardId': boardModel.id,
            'id'     : 2
          }
        ]);
        expect(testView.$el.find('.tyto-column').length).to.equal(2);
      });
      it('Clicking addColumn btn increases collection', function() {
        testView = new Tyto.Views.Board({
          model     : boardModel,
          collection: columnsCollection
        });
        testView.render();
        testView.ui.addColumn.click();
        expect(testView.collection.length).to.equal(1);
      });
    });
    describe('TaskView', function() {
      beforeEach(function() {
        tasksCollection = new Tyto.Models.TaskCollection();
      });
      it('Using the delete option destroys the model', function() {
        taskModel = tasksCollection.create();
        testView  = new Tyto.Views.Task(
          {
            model: taskModel
          }
        );
        testView.render();
        expect(tasksCollection.length).to.equal(1);
        testView.ui.deleteTask.click();
        expect(tasksCollection.length).to.equal(0);
      });
    });
  });
});
