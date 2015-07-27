describe('tyto', function() {
  var boardModel,
    boardsCollection,
    columnsCollection,
    tasksCollection,
    taskModel,
    columnModel,
    testView;
  describe('Views', function() {
    beforeEach(function() {
      boardsCollection = new Tyto.Models.BoardCollection();
      boardModel       = boardsCollection.create();
    });
    describe('BoardView', function() {
      beforeEach(function(){
        columnsCollection = new Tyto.Models.ColumnCollection();
        viewCollection    = new Tyto.Models.ColumnCollection();
        testView = new Tyto.Views.Board({
          model     : boardModel,
          collection: viewCollection
        });
        testView.render();
      });
      it('Using the delete option destroys the model', function() {
        testView.ui.deleteBoard.click();
        expect(boardsCollection.length).to.equal(0);
      });
      it('Using the wipe board option, destroys all models associated with a board', function() {
        /*
          Test requires having at least a column and a task defined
          for the board.
        */
        testView.collection.add(columnsCollection.create());
        colView = testView.children.first();
        colView.ui.addTask.click();
        /*
          Check here that correct amount of tasks has been created.

          NOTE:: 2 is the correct amount as ui.addTask refers to 2
          element that will both be clicked on invoking .click()
        */
        expect(colView.collection.length).to.equal(2);
        /*
          wipeBoard uses a "confirm" to verify that you want to delete the
          board contents.

          Instead of testing the functionality on click. We can test the
          view function by invoking it direct.
        */
        testView.wipeBoard();
        expect(colView.collection.length).to.equal(0);
        expect(testView.collection.length).to.equal(0);

      });
      it('Renders the correct amount of columns', function() {
        expect(testView.$el.find('.tyto-column').length).to.equal(0);
        testView.collection.add(columnsCollection.create());
        expect(testView.$el.find('.tyto-column').length).to.equal(1);
        testView.collection.add(columnsCollection.create());
        expect(testView.$el.find('.tyto-column').length).to.equal(2);
      });
      it('Clicking addColumn btn increases collection', function() {
        testView.ui.addColumn.click();
        expect(testView.collection.length).to.equal(1);
      });
    });
    describe('ColumnView', function() {
      beforeEach(function() {
        columnsCollection = new Tyto.Models.ColumnCollection();
        taskCollection    = new Tyto.Models.TaskCollection();

        columnModel       = columnsCollection.create({
          boardId: boardModel.id,
          ordinal: columnsCollection.length + 1
        });

        viewCollection    = new Tyto.Models.TaskCollection();
        testView          = new Tyto.Views.Column({
          model     : columnModel,
          collection: viewCollection,
          board     : boardModel
        })
        testView.render();
      });
      it('Renders the correct amount of tasks', function() {
        expect(testView.$el.find('.tyto-task').length).to.equal(0);
        testView.collection.add(taskCollection.create());
        expect(testView.$el.find('.tyto-task').length).to.equal(1);
        testView.collection.add(taskCollection.create());
        expect(testView.$el.find('.tyto-task').length).to.equal(2);
      });
      it('Using the delete option destroys the model', function(){
        testView.ui.deleteColumn.click();
        expect(columnsCollection.length).to.equal(0);
      });
      it('Using the add task UI components adds tasks', function() {
        testView.ui.addTask.click();
        /*
          The length expected here should actually be 2 and not 1 as there
          are two buttons for adding tasks both referenced by the same className

          Firing a click, will fire on both, essentially adding 2 tasks.
        */
        expect(viewCollection.length).to.equal(2);
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
