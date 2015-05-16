module.exports = (Tasks, App, Backbone) ->
  Tasks.Task = Backbone.Model.extend
    defaults:
      title: 'New Todo'
      description: 'Making this work!'

  Tasks.TaskList = Backbone.Collection.extend
    model: Tasks.Task
