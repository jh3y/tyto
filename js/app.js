var mytyto;

mytyto = undefined;

define('app', ['tyto'], function(tyto) {
  var initialize;
  initialize = function() {
    return mytyto = new tyto();
  };
  return {
    initialize: initialize
  };
});
