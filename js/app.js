var myWorkflow;

myWorkflow = undefined;

define('app', ['workflow'], function(workflow) {
  var initialize;
  initialize = function() {
    return myWorkflow = new workflow();
  };
  return {
    initialize: initialize
  };
});
