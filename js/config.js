define([], function() {
  var config;
  return config = {
    autoSave: true,
    showIntroModalOnLoad: false,
    introModalId: 'tytoIntroModal',
    helpModalId: 'tytoHelpModal',
    infoModalId: 'tytoInfoModal',
    DOMId: 'barn',
    DOMElementSelector: '.barn',
    emailSubject: 'my current items',
    emailRecipient: 'you@me.com',
    saveFilename: 'barn',
    maxColumns: 10,
    columns: [
      {
        title: 'A column',
        items: [
          {
            content: "I'm your first item, and just like all items I am draggable between columns by using the move icon.",
            collapsed: false,
            title: "Item header."
          }, {
            collapsed: false,
            content: 'there are actions available above for you to add columns and items, export your board, load a board etc.',
            title: "Click to edit me!"
          }
        ]
      }, {
        title: 'Another column',
        items: [
          {
            collapsed: false,
            content: "You can also collapse/expand items by clicking the plus/minus icon.",
            title: "collapsible"
          }
        ]
      }, {
        title: 'Click me to edit',
        items: [
          {
            collapsed: false,
            title: "edit me",
            content: 'you can click an item to enter edit mode and edit it.'
          }, {
            collapsed: true,
            content: "I was collapsed.",
            title: "collapsed"
          }
        ]
      }, {
        title: 'Done',
        items: [
          {
            content: 'You can also drag columns to resort their ordering using the move icon at the top next to the remove icon.'
          }
        ]
      }
    ]
  };
});
