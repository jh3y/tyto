module.exports = (Tasks, App, Backbone) ->
  Tasks.Task = Backbone.Model.extend
    defaults:
      title: 'New Todo'
      description: 'Making this work!'
    localStorage: new Backbone.LocalStorage 'tyto--task'

  Tasks.TaskList = Backbone.Collection.extend
    localStorage: new Backbone.LocalStorage 'tyto--task'
    model: Tasks.Task
