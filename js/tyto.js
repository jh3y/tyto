define(['jquery', 'bootstrap', 'config', 'handlebars', 'tab', 'text!templates/tyto/column.html', 'text!templates/tyto/item.html', 'text!templates/tyto/actions.html', 'text!templates/tyto/email.html'], function($, bootstrap, config, Handlebars, tab, columnHtml, itemHtml, actionsHtml, emailHtml) {
  var tyto;
  tyto = function(options) {
    if (!(this instanceof tyto)) {
      return new tyto();
    }
    config = options !== undefined ? options : config;
    this.config = config;
    this.modals = {};
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
      tyto._createBarn(tyto.config);
      return tyto.element.trigger('tyto:action');
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
      tyto._createBarn(tyto.config);
      return tyto.element.trigger('tyto:action');
    });
    return tyto.modals.introModal.find('.tytoloadconfig').on('click', function(e) {
      return tyto.loadBarn();
    });
  };
  tyto.prototype._createBarn = function(config) {
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
          tyto.element.addClass(config.theme);
        } catch (_error) {
          e = _error;
          throw Error('tyto: could not load theme.');
        }
      }
      if (config.actionsTab && $('[data-tab]').length === 0) {
        tyto._createActionsTab();
        tyto._bindTabActions();
      }
    }
    if (tyto.modals.introModal !== undefined) {
      return tyto.modals.introModal.modal('hide');
    }
  };
  tyto.prototype._createColumn = function(columnData) {
    var $newColumn, template;
    template = Handlebars.compile(columnHtml);
    Handlebars.registerPartial("item", itemHtml);
    $newColumn = $(template(columnData));
    this._bindColumnEvents($newColumn);
    return this.element.append($newColumn);
  };
  tyto.prototype._bindPageEvents = function() {
    var tytoFlap;
    tyto = this;
    $('body').on('click', function(event) {
      var $clicked, $clickeditem, isSidebar;
      $clicked = $(event.target);
      $clickeditem = $clicked.hasClass('item') ? $clicked : $clicked.parents('.tyto-item').length > 0 ? $clicked.parents('.tyto-item') : void 0;
      $.each($('.tyto-item'), function(index, item) {
        if (!$(item).is($clickeditem)) {
          $(item).find('.tyto-item-content').removeClass('edit').removeAttr('contenteditable');
          return $(item).attr('draggable', true);
        }
      });
      if (tyto.config.actionsTab) {
        isSidebar = ($clicked.attr('data-tab')) || ($clicked.parents('[data-tab]').length > 0);
        if (!isSidebar && tyto.tab !== undefined) {
          tyto.tab.open = false;
          return true;
        }
      }
    });
    if ($('html').hasClass('csstransforms')) {
      tytoFlap = function() {
        $('.tyto-header').find('.tyto-logo').addClass('flap');
        return setTimeout((function() {
          return $('.tyto-header').find('.tyto-logo').removeClass('flap');
        }), 1000);
      };
      $('body').on('tyto:action', function(e) {
        return tytoFlap();
      });
    } else {
      $('.tyto-logo-image').attr('src', 'images/tyto.png');
    }
    return $('#forkongithub').on('hover', function(e) {
      return $(this).trigger('tyto:action');
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
      if (tyto._dragitem && tyto._dragitem !== null) {
        $column.find('.tyto-item-holder')[0].appendChild(tyto._dragitem);
      }
      $column.find('.tyto-item-holder').removeClass("over");
      return false;
    }), false);
    $column.children('.close').on('click', function(e) {
      return tyto.removeColumn($column);
    });
    return $column.children('.additem').on('click', function(e) {
      return tyto.addItem($column);
    });
  };
  tyto.prototype.addColumn = function() {
    tyto = this;
    tyto._createColumn();
    tyto._resizeColumns();
    return tyto.element.trigger('tyto:action');
  };
  tyto.prototype.removeColumn = function($column) {
    var removeColumn;
    if ($column == null) {
      $column = this.element.find('.column').last();
    }
    tyto = this;
    removeColumn = function() {
      $column.remove();
      return tyto._resizeColumns();
    };
    if ($column.find('.tyto-item').length > 0) {
      if (confirm('are you sure you want to remove this column? doing so will lose all items within it.')) {
        removeColumn();
      }
    } else {
      removeColumn();
    }
    return tyto.element.trigger('tyto:action');
  };
  tyto.prototype.addItem = function($column, content) {
    if ($column == null) {
      $column = this.element.find('.column').first();
    }
    this._createItem($column, content);
    return tyto.element.trigger('tyto:action');
  };
  tyto.prototype._createItem = function($column, content) {
    var $newitem, template;
    template = Handlebars.compile(itemHtml);
    $newitem = $(template({}));
    this._binditemEvents($newitem);
    $newitem.css({
      'max-width': $column[0].offsetWidth * 0.9 + 'px'
    });
    $column.find('.tyto-item-holder').append($newitem);
    return tyto.element.trigger('tyto:action');
  };
  tyto.prototype._binditemEvents = function($item) {
    var disableEdit, enableEdit, toggleEdit;
    tyto = this;
    enableEdit = function(content) {
      content.contentEditable = true;
      $(content).addClass('edit');
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
      if (confirm('are you sure you want to remove this item?')) {
        $item.remove();
        return tyto.element.trigger('tyto:action');
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
      return $item.attr('draggable', true);
    });
    $item[0].addEventListener("dragstart", (function(event) {
      $item.find('-item-content').blur();
      this.style.opacity = "0.4";
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/html", this);
      return tyto._dragitem = this;
    }), false);
    return $item[0].addEventListener("dragend", (function(event) {
      this.style.opacity = "1";
      return tyto.element.trigger('tyto:action');
    }), false);
  };
  tyto.prototype._createActionsTab = function() {
    tyto = this;
    return tyto.tab = new tab({
      title: 'menu',
      attachTo: tyto.element[0],
      content: actionsHtml
    });
  };
  tyto.prototype._bindTabActions = function() {
    tyto = this;
    $('button.additem').on('click', function(event) {
      return tyto.addItem();
    });
    $('button.addcolumn').on('click', function(event) {
      return tyto.addColumn();
    });
    $('button.savebarn').on('click', function(event) {
      return tyto.saveBarn();
    });
    $('button.loadbarn').on('click', function(event) {
      return tyto.loadBarn();
    });
    $('button.emailbarn').on('click', function(event) {
      return tyto.emailBarn();
    });
    $('button.helpbarn').on('click', function(event) {
      return tyto.showHelp();
    });
    return $('button.infobarn').on('click', function(event) {
      return tyto.showInfo();
    });
  };
  tyto.prototype._resizeColumns = function() {
    var correctWidth;
    tyto = this;
    if (tyto.element.find('.column').length > 0) {
      correctWidth = 100 / tyto.element.find('.column').length;
      tyto.element.find('.column').css({
        'width': correctWidth + '%'
      });
      return tyto.element.find('.tyto-item').css({
        'max-width': tyto.element.find('.column').first()[0].offsetWidth * 0.9 + 'px'
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
      actionsTab: tyto.config.actionsTab,
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
    tyto._createBarn(json);
    tyto.tab.open = false;
    return tyto.element.trigger('tyto:action');
  };
  tyto.prototype.saveBarn = function() {
    var content, filename, saveAnchor;
    tyto = this;
    saveAnchor = $('#savetyto');
    filename = tyto.config.saveFilename !== undefined ? tyto.config.saveFilename + '.json' : 'itemboard.json';
    content = 'data:text/plain,' + JSON.stringify(tyto._createBarnJSON());
    saveAnchor[0].setAttribute('download', filename);
    saveAnchor[0].setAttribute('href', content);
    saveAnchor[0].click();
    tyto.tab.open = false;
    return tyto.element.trigger('tyto:action');
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
    $('#tytoemail')[0].click();
    tyto.tab.open = false;
    return tyto.element.trigger('tyto:action');
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
