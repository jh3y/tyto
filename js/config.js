define([], function() {
  var config;
  return config = {
    theme: 'default',
    DOMId: 'taskboard',
    DOMElementSelector: '.taskboard',
    emailSubject: 'my current tasks',
    emailRecipient: 'you@me.com',
    actionsTab: true,
    saveFilename: 'taskboard',
    columns: [
      {
        title: 'To do',
        tasks: [
          {
            content: 'finish implementing workflow'
          }
        ]
      }, {
        title: 'In progress',
        tasks: []
      }, {
        title: 'Awaiting merge',
        tasks: []
      }, {
        title: 'Done',
        tasks: []
      }
    ]
  };
});
