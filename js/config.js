define([], function() {
  var config;
  return config = {
    showModalOnLoad: true,
    theme: false,
    themePath: 'css/themes/theme.css',
    DOMId: 'barn',
    DOMElementSelector: '.barn',
    emailSubject: 'my current items',
    emailRecipient: 'you@me.com',
    actionsTab: true,
    saveFilename: 'barn',
    columns: [
      {
        title: 'A column',
        items: [
          {
            content: 'your first item'
          }, {
            content: 'there are actions available in the tab to the left, just click it to access the actions'
          }
        ]
      }, {
        title: 'Another column',
        items: []
      }, {
        title: 'Click me to edit',
        items: [
          {
            content: 'you can double-click me to enter edit mode'
          }
        ]
      }, {
        title: 'Done',
        items: [
          {
            content: 'then click to edit and when you are done click elsewhere or double click the item again'
          }
        ]
      }
    ]
  };
});
