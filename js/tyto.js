define(['jquery', 'config', 'handlebars', 'text!templates/tyto/column.html', 'text!templates/tyto/item.html', 'text!templates/tyto/actions.html', 'text!templates/tyto/email.html'], function($, config, Handlebars, columnHtml, itemHtml, actionsHtml, emailHtml) {
  var tyto;
  tyto = function(options) {
    if (!(this instanceof tyto)) {
      return new tyto();
    }
    config = options !== undefined ? options : config;
    this.config = config;
    this.modals = {};
    this.undo = {};
    this._bindPageEvents();
    if (config.showIntroModalOnLoad && config.introModalId) {
      this.modals.introModal = $('#' + config.introModalId);
      this._bindIntroModalEvents();
      this.modals.introModal.modal({
        backdrop: 'static'
      });
    } else {
      this._createBarn(config);
    }
    return this;
  };
  tyto.prototype._bindIntroModalEvents = function() {
    tyto = this;
    tyto.modals.introModal.find('.loadtytodefaultconfig').on('click', function(e) {
      return tyto._createBarn(tyto.config);
    });
    tyto.modals.introModal.find('.loadtytocolumns').on('click', function(e) {
      var columns, i, numberOfCols;
      columns = [];
      numberOfCols = parseInt(tyto.modals.introModal.find('.tytonumberofcols').val());
      i = 0;
      while (i < numberOfCols) {
        columns.push({
          title: "column",
          tasks: []
        });
        i++;
      }
      tyto.config.columns = columns;
      return tyto._createBarn(tyto.config);
    });
    return tyto.modals.introModal.find('.tytoloadconfig').on('click', function(e) {
      return tyto.loadBarn();
    });
  };
  tyto.prototype._createBarn = function(config) {
    tyto = this;
    tyto._buildDOM(config);
    tyto.element.find('[data-action="addcolumn"]').on('click', function(e) {
      return tyto.addColumn();
    });
    tyto._bindActions();
    if (tyto.modals.introModal !== undefined) {
      tyto.modals.introModal.modal('hide');
    }
    tyto.undo = {};
    return $('[data-action="undolast"]').removeClass('btn-info').addClass('btn-disabled').attr('disabled', true);
  };
  tyto.prototype._buildDOM = function(config) {
    var e, i;
    tyto = this;
    if (config.DOMElementSelector !== undefined || config.DOMId !== undefined) {
      tyto.element = config.DOMId !== undefined ? $('#' + config.DOMId) : $(config.DOMElementSelector);
      tyto.element.attr('data-tyto', 'true');
      if (config.columns !== undefined && config.columns.length > 0) {
        tyto.element.find('.column').remove();
        i = 0;
        while (i < config.columns.length) {
          tyto._createColumn(config.columns[i]);
          i++;
        }
        tyto._resizeColumns();
        if (tyto.element.find('.tyto-item').length > 0) {
          $.each(tyto.element.find('.tyto-item'), function(index, item) {
            return tyto._binditemEvents($(item));
          });
        }
      }
      if (config.theme !== undefined && typeof config.theme === 'string' && config.themePath !== undefined && typeof config.themePath === 'string') {
        try {
          $('head').append($('<link type="text/css" rel="stylesheet" href="' + config.themePath + '"></link>'));
          return tyto.element.addClass(config.theme);
        } catch (_error) {
          e = _error;
          throw Error('tyto: could not load theme.');
        }
      }
    }
  };
  tyto.prototype._createColumn = function(columnData) {
    var $newColumn, template;
    template = Handlebars.compile(columnHtml);
    Handlebars.registerPartial("item", itemHtml);
    $newColumn = $(template(columnData));
    this._bindColumnEvents($newColumn);
    this.element.append($newColumn);
    return tyto.element.trigger({
      type: 'tyto:action',
      name: 'add-column',
      DOMcolumn: $newColumn,
      DOMitem: void 0
    });
  };
  tyto.prototype._bindPageEvents = function() {
    tyto = this;
    $('body').on('tyto:action', function(event) {
      console.log(event);
      tyto.undo.action = event.name;
      tyto.undo.column = event.DOMcolumn;
      tyto.undo.item = event.DOMitem;
      tyto.undo.columnIndex = event.columnIndex;
      tyto.undo.itemIndex = event.itemIndex;
      tyto.undo.editContent = event.content;
      return $('[data-action="undolast"]').removeAttr('disabled').removeClass('btn-disabled').addClass('btn-default');
    });
    return $('body').on('click', function(event) {
      var $clicked, $clickeditem;
      $clicked = $(event.target);
      $clickeditem = $clicked.hasClass('item') ? $clicked : $clicked.parents('.tyto-item').length > 0 ? $clicked.parents('.tyto-item') : void 0;
      return $.each($('.tyto-item'), function(index, item) {
        if (!$(item).is($clickeditem)) {
          $(item).find('.tyto-item-content').removeClass('edit').removeAttr('contenteditable');
          return $(item).attr('draggable', true);
        }
      });
    });
  };
  tyto.prototype._bindColumnEvents = function($column) {
    tyto = this;
    $column.find('.column-title').on('keydown', function(event) {
      var columnTitle;
      columnTitle = this;
      if (event.keyCode === 13 || event.charCode === 13) {
        return columnTitle.blur();
      }
    });
    $column.find('.column-title').on('click', function(event) {
      return tyto._preEditItemContent = this.innerHTML.toString().trim();
    });
    $column.find('.column-title').on('blur', function(e) {
      return tyto.element.trigger({
        type: 'tyto:action',
        name: 'edit-column-title',
        DOMcolumn: $column,
        content: tyto._preEditItemContent
      });
    });
    $column[0].addEventListener("dragenter", (function(event) {
      return $column.find('.tyto-item-holder').addClass("over");
    }), false);
    $column[0].addEventListener("dragover", (function(event) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      event.dataTransfer.dropEffect = "move";
      return false;
    }), false);
    $column[0].addEventListener("dragleave", (function(event) {
      return $column.find('.tyto-item-holder').removeClass("over");
    }), false);
    $column[0].addEventListener("drop", (function(event) {
      if (event.stopPropagation && event.preventDefault) {
        event.stopPropagation();
        event.preventDefault();
      }
      if (tyto._dragItem && tyto._dragItem !== null) {
        $column.find('.tyto-item-holder .items')[0].appendChild(tyto._dragItem);
        tyto.element.trigger({
          type: 'tyto:action',
          name: 'move-item',
          DOMcolumn: tyto._dragColumn,
          DOMitem: tyto._dragItem,
          itemIndex: tyto._dragItemIndex
        });
      }
      $column.find('.tyto-item-holder').removeClass("over");
      return false;
    }), false);
    $column.find('[data-action="removecolumn"]').on('click', function(e) {
      return tyto.removeColumn($column);
    });
    $column.find('[data-action="additem"]').on('click', function(e) {
      return tyto.addItem($column);
    });
    return tyto;
  };
  tyto.prototype.undoLast = function() {
    tyto = this;
    if (tyto.undo) {
      switch (tyto.undo.action) {
        case 'add-column':
          tyto.undo.column.remove();
          tyto._resizeColumns();
          break;
        case 'add-item':
          tyto.undo.item.remove();
          break;
        case 'remove-column':
          if (tyto.undo.columnIndex > tyto.element.find('.column').length - 1) {
            tyto.element.append(tyto.undo.column);
          } else {
            $(tyto.element.find('.column')[tyto.undo.columnIndex]).before(tyto.undo.column);
          }
          tyto._bindColumnEvents(tyto.undo.column);
          $.each(tyto.undo.column.find('[data-tyto-item]'), function() {
            return tyto._binditemEvents($(this));
          });
          tyto._resizeColumns();
          break;
        case 'remove-item':
          if (tyto.undo.itemIndex > tyto.undo.column.find('[data-tyto-item]').length - 1) {
            tyto.undo.column.find('.items').append(tyto.undo.item);
          } else {
            $(tyto.element.find(tyto.undo.column).find('[data-tyto-item]')[tyto.undo.itemIndex]).before(tyto.undo.item);
          }
          tyto._binditemEvents(tyto.undo.item);
          break;
        case 'move-item':
          if (tyto.undo.itemIndex > tyto.undo.column.find('[data-tyto-item]').length - 1) {
            tyto.undo.column.find('.items').append(tyto.undo.item);
          } else {
            $(tyto.element.find(tyto.undo.column).find('[data-tyto-item]')[tyto.undo.itemIndex]).before(tyto.undo.item);
          }
          break;
        case 'edit-item':
          tyto.undo.item.find('.tyto-item-content')[0].innerHTML = tyto.undo.editContent;
          break;
        case 'edit-column-title':
          tyto.undo.column.find('.column-title')[0].innerHTML = tyto.undo.editContent;
          break;
        default:
          console.log('no luck');
      }
      return $('[data-action="undolast"]').removeClass('btn-info').addClass('btn-disabled').attr('disabled', true);
    }
  };
  tyto.prototype.addColumn = function() {
    tyto = this;
    if (tyto.element.find('.column').length < tyto.config.maxColumns) {
      tyto._createColumn();
      return tyto._resizeColumns();
    } else {
      return alert("whoah, it's getting busy and you've reached the maximum amount of columns. You can however increase the amount of maximum columns via the config.");
    }
  };
  tyto.prototype.removeColumn = function($column) {
    var calculateIndex, removeColumn;
    if ($column == null) {
      $column = this.element.find('.column').last();
    }
    tyto = this;
    calculateIndex = function() {
      var colIndex;
      colIndex = void 0;
      $.each($(".column"), function(key, value) {
        if ($column[0] === value) {
          colIndex = key;
          return false;
        }
      });
      return colIndex;
    };
    removeColumn = function() {
      var columnList;
      columnList = Array.prototype.slice.call($column.parent('[data-tyto]').children('.column'));
      tyto.element.trigger({
        type: 'tyto:action',
        name: 'remove-column',
        DOMitem: void 0,
        DOMcolumn: $column,
        columnIndex: columnList.indexOf($column[0])
      });
      $column.remove();
      return tyto._resizeColumns();
    };
    if ($column.find('.tyto-item').length > 0) {
      if (confirm('are you sure you want to remove this column? doing so will lose all items within it.')) {
        return removeColumn();
      }
    } else {
      return removeColumn();
    }
  };
  tyto.prototype.addItem = function($column, content) {
    if ($column == null) {
      $column = this.element.find('.column').first();
    }
    return this._createItem($column, content);
  };
  tyto.prototype._createItem = function($column, content) {
    var $newitem, template;
    tyto = this;
    template = Handlebars.compile(itemHtml);
    $newitem = $(template({}));
    tyto._binditemEvents($newitem);
    $column.find('.tyto-item-holder .items').append($newitem);
    return tyto.element.trigger({
      type: 'tyto:action',
      name: 'add-item',
      DOMitem: $newitem,
      DOMcolumn: $column
    });
  };
  tyto.prototype._binditemEvents = function($item) {
    var disableEdit, enableEdit, toggleEdit;
    tyto = this;
    enableEdit = function(content) {
      content.contentEditable = true;
      $(content).addClass('edit');
      $(content).on('click', function(e) {
        return tyto._preEditItemContent = content.innerHTML.toString().trim();
      });
      return $item.attr('draggable', false);
    };
    disableEdit = function(content) {
      content.contentEditable = false;
      $(content).removeAttr('contenteditable');
      $(content).removeClass('edit');
      $(content).blur();
      return $item.attr('draggable', true);
    };
    toggleEdit = function(content) {
      if (content.contentEditable !== 'true') {
        return enableEdit(content);
      } else {
        return disableEdit(content);
      }
    };
    $item.find('.close').on('click', function(event) {
      var itemList;
      if (confirm('are you sure you want to remove this item?')) {
        itemList = Array.prototype.slice.call($item.parent('.items').children());
        tyto.element.trigger({
          type: 'tyto:action',
          name: 'remove-item',
          DOMitem: $item,
          DOMcolumn: $item.parents('.column'),
          columnIndex: void 0,
          itemIndex: itemList.indexOf($item[0])
        });
        return $item.remove();
      }
    });
    $item.find('.tyto-item-content').on('dblclick', function() {
      return toggleEdit(this);
    });
    $item.find('.tyto-item-content').on('mousedown', function() {
      return $($(this)[0]._parent).on('mousemove', function() {
        return $(this).blur();
      });
    });
    $item.find('.tyto-item-content').on('blur', function() {
      this.contentEditable = false;
      $(this).removeAttr('contenteditable');
      $(this).removeClass('edit');
      $item.attr('draggable', true);
      return tyto.element.trigger({
        type: 'tyto:action',
        name: 'edit-item',
        DOMitem: $item,
        DOMcolumn: $item.parents('.column'),
        content: tyto._preEditItemContent
      });
    });
    $item[0].addEventListener("dragstart", (function(event) {
      var itemList;
      $item.find('-item-content').blur();
      this.style.opacity = "0.4";
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/html", $item[0]);
      tyto._dragItem = $item[0];
      itemList = Array.prototype.slice.call($item.parent('.items').children());
      tyto._dragItemIndex = itemList.indexOf($item[0]);
      return tyto._dragColumn = $item.parents('.column');
    }), false);
    return $item[0].addEventListener("dragend", (function(event) {
      return this.style.opacity = "1";
    }), false);
  };
  tyto.prototype._bindActions = function() {
    var action, actionMap;
    tyto = this;
    actionMap = {
      additem: 'addItem',
      addcolumn: 'addColumn',
      savebarn: 'saveBarn',
      loadbarn: 'loadBarn',
      emailbarn: 'emailBarn',
      helpbarn: 'showHelp',
      infobarn: 'showInfo',
      undolast: 'undoLast'
    };
    action = "";
    return $('.actions').on('click', '[data-action]', function(e) {
      action = e.target.dataset.action;
      return tyto[actionMap[action]]();
    });
  };
  tyto.prototype._resizeColumns = function() {
    var correctWidth;
    tyto = this;
    if (tyto.element.find('.column').length > 0) {
      correctWidth = 100 / tyto.element.find('.column').length;
      return tyto.element.find('.column').css({
        'width': correctWidth + '%'
      });
    }
  };
  tyto.prototype._createBarnJSON = function() {
    var columns, itemboardJSON;
    tyto = this;
    itemboardJSON = {
      showIntroModalOnLoad: tyto.config.showIntroModalOnLoad,
      introModalId: tyto.config.introModalId,
      theme: tyto.config.theme,
      themePath: tyto.config.themePath,
      emailSubject: tyto.config.emailSubject,
      emailRecipient: tyto.config.emailRecipient,
      DOMId: tyto.config.DOMId,
      DOMElementSelector: tyto.config.DOMElementSelector,
      columns: []
    };
    columns = tyto.element.find('.column');
    $.each(columns, function(index, column) {
      var columnTitle, columnitems, items;
      columnTitle = $(column).find('.column-title')[0].innerHTML.toString().trim();
      items = [];
      columnitems = $(column).find('.tyto-item');
      $.each(columnitems, function(index, item) {
        return items.push({
          content: item.querySelector('.tyto-item-content').innerHTML.toString().trim()
        });
      });
      return itemboardJSON.columns.push({
        title: columnTitle,
        items: items
      });
    });
    return itemboardJSON;
  };
  tyto.prototype._loadBarnJSON = function(json) {
    return tyto._buildDOM(json);
  };
  tyto.prototype.saveBarn = function() {
    var content, filename, saveAnchor;
    tyto = this;
    saveAnchor = $('#savetyto');
    filename = tyto.config.saveFilename !== undefined ? tyto.config.saveFilename + '.json' : 'itemboard.json';
    content = 'data:text/plain,' + JSON.stringify(tyto._createBarnJSON());
    saveAnchor[0].setAttribute('download', filename);
    saveAnchor[0].setAttribute('href', content);
    return saveAnchor[0].click();
  };
  tyto.prototype.loadBarn = function() {
    var $files;
    tyto = this;
    $files = $('#tytofiles');
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      $files[0].click();
    } else {
      alert('tyto: the file APIs are not fully supported in your browser');
    }
    return $files.on('change', function(event) {
      var f, reader;
      f = event.target.files[0];
      if ((f.type.match('application/json')) || (f.name.indexOf('.json' !== -1))) {
        reader = new FileReader();
        reader.onloadend = function(event) {
          var result;
          result = JSON.parse(this.result);
          if (result.columns !== undefined && result.theme !== undefined && (result.DOMId !== undefined || result.DOMElementSelector !== undefined)) {
            return tyto._loadBarnJSON(result);
          } else {
            return alert('tyto: incorrect json');
          }
        };
        return reader.readAsText(f);
      } else {
        return alert('tyto: only load a valid itemboard json file');
      }
    });
  };
  tyto.prototype._getEmailContent = function() {
    var $email, contentString, itemboardJSON, regex, template;
    tyto = this;
    contentString = '';
    itemboardJSON = tyto._createBarnJSON();
    template = Handlebars.compile(emailHtml);
    $email = $(template(itemboardJSON));
    regex = new RegExp('&lt;br&gt;', 'gi');
    if ($email.html().trim() === "Here are your current items.") {
      return "You have no items on your plate so go grab a glass and fill up a drink! :)";
    } else {
      return $email.html().replace(regex, '').trim();
    }
  };
  tyto.prototype.emailBarn = function() {
    var content, d, mailto, mailtoString, recipient, subject;
    tyto = this;
    mailto = 'mailto:';
    recipient = tyto.config.emailRecipient ? tyto.config.emailRecipient : 'someone@somewhere.com';
    d = new Date();
    subject = tyto.config.emailSubject ? tyto.config.emailSubject : 'items as of ' + d.toString();
    content = tyto._getEmailContent();
    content = encodeURIComponent(content);
    mailtoString = mailto + recipient + '?subject=' + encodeURIComponent(subject.trim()) + '&body=' + content;
    $('#tytoemail').attr('href', mailtoString);
    return $('#tytoemail')[0].click();
  };
  tyto.prototype.showHelp = function() {
    tyto = this;
    if (tyto.config.helpModalId) {
      tyto.modals.helpModal = $('#' + tyto.config.helpModalId);
      return tyto.modals.helpModal.modal();
    }
  };
  tyto.prototype.showInfo = function() {
    tyto = this;
    if (tyto.config.infoModalId) {
      tyto.modals.infoModal = $('#' + tyto.config.infoModalId);
      return tyto.modals.infoModal.modal();
    }
  };
  return tyto;
});
