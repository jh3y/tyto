const App = Marionette.Application.extend({
  navigate: (route, opts) => {
    Backbone.history.navigate(route, opts);
  },
  setRootLayout: () => {
    Tyto.RootView = new Tyto.Views.Root();
  },
  NAVIGATION_DURATION: 500,
  TASK_COLORS        : [
    'yellow',
    'red',
    'blue',
    'indigo',
    'green',
    'purple',
    'orange',
    'pink'
  ],
  DEFAULT_TASK_COLOR : 'yellow',
  ANIMATION_EVENT    : 'animationend webkitAnimationEnd oAnimationEnd',
  INTRO_JSON_SRC     : 'js/intro.json',
  LOADING_CLASS      : 'is--loading',
  SELECTED_CLASS     : 'is--selected',
  CONFIRM_MESSAGE    : '[tyto] are you sure you wish to delete this item?'
});
export default App;
