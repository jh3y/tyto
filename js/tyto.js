define(["jquery", "bootstrap", "config", "handlebars", "tab", "utils", "text!templates/tyto/column.html", "text!templates/tyto/item.html", "text!templates/tyto/actions.html", "text!templates/tyto/email.html"], function($, bootstrap, config, Handlebars, Tab, utils, columnHtml, itemHtml, actionsHtml, emailHtml) {
  var Tyto;
  Tyto = function(options) {
    if (!(this instanceof Tyto)) {
      new Tyto();
    }
    config = options || config;
    this.config = config;
    this.modals = {};
    this._bindPageEvents();
    if (config.showIntroModalOnLoad && config.introModalId) {
      this.modals.introModal = $("#" + config.introModalId);
      this.$introModal = this.modals.introModal;
      this.$introModal.modal({
        backdrop: "static"
      });
      this._bindIntroModalEvents();
    } else {
      this._createBarn(config);
    }
    return this;
  };
  Tyto.prototype._bindIntroModalEvents = function() {
    var tyto;
    tyto = this;
    tyto.$introModal.find(".loadtytodefaultconfig").on("click", function(e) {
      tyto._createBarn(tyto.config);
      return tyto.$element.trigger("tyto:action");
    });
    tyto.$introModal.find(".loadtytocolumns").on("click", function(e) {
      var columns, i, numberOfCols;
      columns = [];
      i = 0;
      numberOfCols = parseInt(tyto.$introModal.find(".tytonumberofcols").val());
      while (i < numberOfCols) {
        columns.push({
          title: "column",
          tasks: []
        });
        i++;
      }
      tyto.config.columns = columns;
      tyto._createBarn(tyto.config);
      return tyto.$element.trigger("tyto:action");
    });
    return tyto.$introModal.find(".tytoloadconfig").on("click", function(e) {
      return tyto.loadBarn();
    });
  };
  Tyto.prototype._createBarn = function(config) {
    var e, i, tyto, _error;
    tyto = this;
    e = void 0;
    i = void 0;
    if (config.DOMElementSelector !== undefined || config.DOMId !== undefined) {
      tyto.$element = (config.DOMId !== undefined ? $("#" + config.DOMId) : $(config.DOMElementSelector));
      tyto.$element.attr("data-tyto", "true");
      if (config.columns !== undefined && config.columns.length > 0) {
        tyto.$element.find(".column").remove();
        i = 0;
        while (i < config.columns.length) {
          tyto._createColumn(config.columns[i]);
          i++;
        }
        tyto._resizeColumns();
        tyto.$tyto_item = tyto.$element.find(".tyto-item");
        if (tyto.$tyto_item.length) {
          $.each(tyto.$tyto_item, function() {
            return tyto._binditemEvents(this);
          });
        }
      }
      if (config.theme !== undefined && typeof config.theme === "string" && config.themePath !== undefined && typeof config.themePath === "string") {
        try {
          $("head").append($("<link type=\"text/css\" rel=\"stylesheet\" href=\"" + config.themePath + "\"></link>"));
          tyto.$element.addClass(config.theme);
        } catch (_error) {
          _error = _error;
          e = _error;
          throw new Error("tyto: could not load theme.");
        }
      }
      if (config.actionsTab && $("[data-tab]").length === 0) {
        tyto._createActionsTab();
        tyto._bindTabActions();
      }
    }
    if (tyto.$introModal !== undefined) {
      return tyto.$introModal.modal("hide");
    }
  };
  Tyto.prototype._createColumn = function(columnData) {
    var $newColumn, template, tyto;
    tyto = this;
    template = Handlebars.compile(columnHtml);
    $newColumn = void 0;
    Handlebars.registerPartial("item", itemHtml);
    $newColumn = $(template(columnData));
    tyto._bindColumnEvents($newColumn[0]);
    return tyto.$element.append($newColumn);
  };
  Tyto.prototype._bindPageEvents = function() {
    var tyto, tytoFlap;
    tyto = this;
    tytoFlap = void 0;
    $("body").on("click", function(event) {
      var $clicked, $clickeditem, isSidebar;
      $clicked = void 0;
      $clickeditem = void 0;
      isSidebar = void 0;
      $clicked = $(event.target);
      $clickeditem = ($clicked.hasClass("item") ? $clicked : ($clicked.parents(".tyto-item").length > 0 ? $clicked.parents(".tyto-item") : void 0));
      $.each($(".tyto-item"), function(index, item) {
        if (!$(item).is($clickeditem)) {
          $(item).find(".tyto-item-content").removeClass("edit").removeAttr("contenteditable");
          return $(item).attr("draggable", true);
        }
      });
      if (tyto.config.actionsTab) {
        isSidebar = ($clicked.attr("data-tab")) || ($clicked.parents("[data-tab]").length > 0);
        if (!isSidebar && tyto.tab !== undefined) {
          tyto.tab.open = false;
          return true;
        }
      }
    });
    if ($("html").hasClass("csstransforms")) {
      tytoFlap = function() {
        $(".tyto-header").find(".tyto-logo").addClass("flap");
        return setTimeout((function() {
          return $(".tyto-header").find(".tyto-logo").removeClass("flap");
        }), 1000);
      };
      $("body").on("tyto:action", function(e) {
        return tytoFlap();
      });
    } else {
      $(".tyto-logo-image").attr("src", "images/tyto.png");
    }
    return $("#forkongithub").on("hover", function(e) {
      return $(this).trigger("tyto:action");
    });
  };
  Tyto.prototype._bindColumnEvents = function(column) {
    var $column, $tytoItemHolder, columnTitle, evt, evtMap, tyto;
    tyto = this;
    $column = $(column);
    $tytoItemHolder = $column.find(".tyto-item-holder");
    columnTitle = void 0;
    evt = void 0;
    evtMap = {};
    $column.on("keydown", ".column-title", function(e) {
      columnTitle = this;
      if (e.keyCode === 13 || e.charCode === 13) {
        return columnTitle.blur();
      }
    }).on("click", ".actions", function(e) {
      var fn;
      fn = e.target.dataset.fn;
      return tyto[fn]($column);
    });
    return utils.addMultipleListeners(column, "dragleave dragenter dragover drop", function(e) {
      evt = e.type;
      evtMap = {
        dragleave: "removeClass",
        dragenter: "addClass"
      };
      if (evt === "dragover") {
        e.preventDefault && e.preventDefault();
        return e.dataTransfer.dropEffect = "move";
      } else if (evt === "drop") {
        if (e.stopPropagation && e.preventDefault) {
          e.stopPropagation();
          e.preventDefault();
        }
        if (tyto._dragitem && tyto._dragitem !== null) {
          $tytoItemHolder[0].appendChild(tyto._dragitem);
        }
        return $tytoItemHolder.removeClass("over");
      } else {
        if (evtMap[evt]) {
          return $tytoItemHolder[evtMap[evt]]("over");
        }
      }
    });
  };
  Tyto.prototype.addColumn = function() {
    var tyto;
    tyto = this;
    tyto._createColumn();
    tyto._resizeColumns();
    return tyto.$element.trigger("tyto:action");
  };
  Tyto.prototype.removeColumn = function($column) {
    var removeColumn, tyto;
    tyto = this;
    removeColumn = void 0;
    if ($column === null) {
      $column = this.element.find(".column").last();
    }
    removeColumn = function() {
      $column.remove();
      return tyto._resizeColumns();
    };
    if ($column.find(".tyto-item").length > 0) {
      if (confirm("are you sure you want to remove this column? doing so will lose all items within it.")) {
        removeColumn();
      }
    } else {
      removeColumn();
    }
    return tyto.$element.trigger("tyto:action");
  };
  Tyto.prototype.addItem = function($column, content) {
    var tyto;
    tyto = this;
    if ($column === null) {
      $column = this.$element.find(".column").first();
    }
    tyto._createItem($column, content);
    return tyto.$element.trigger("tyto:action");
  };
  Tyto.prototype._createItem = function($column, content) {
    var $newitem, template;
    $newitem = void 0;
    template = void 0;
    template = Handlebars.compile(itemHtml);
    $newitem = $(template({}));
    this._binditemEvents($newitem[0]);
    $newitem.css({
      "max-width": $column[0].offsetWidth * 0.9 + "px"
    });
    $column.find(".tyto-item-holder").append($newitem);
    return tyto.$element.trigger("tyto:action");
  };
  Tyto.prototype._binditemEvents = function(item) {
    var $item, toggleEdit, tyto;
    tyto = this;
    toggleEdit = void 0;
    $item = $(item);
    toggleEdit = function(content) {
      content.contentEditable = !content.isContentEditable;
      $(content).toggleClass("edit");
      return $item.attr("draggable", function() {
        return !$(this).prop("draggable");
      });
    };
    $item.on("dblclick mousedown", ".tyto-item-content", function(e) {
      var evt;
      evt = e.type;
      if (evt === "dblclick") {
        return toggleEdit(this);
      } else if (evt === "mousedown") {
        return $($(this)[0]._parent).on("mousemove", function() {
          return $(this).blur();
        });
      }
    }).on("click", ".close", function(e) {
      if (confirm("are you sure you want to remove this item?")) {
        $item.remove();
        return tyto.$element.trigger("tyto:action");
      }
    });
    return utils.addMultipleListeners(item, "dragstart dragend", function(e) {
      var evt;
      evt = e.type;
      if (evt === "dragstart") {
        $item.find("-item-content").blur();
        this.style.opacity = "0.4";
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", this);
        return tyto._dragitem = this;
      } else if (evt === "dragend") {
        this.style.opacity = "1";
        return tyto.$element.trigger("tyto:action");
      }
    });
  };
  Tyto.prototype._createActionsTab = function() {
    var tyto;
    tyto = this;
    return tyto.tab = new Tab({
      title: "menu",
      attachTo: tyto.$element[0],
      content: actionsHtml
    });
  };
  Tyto.prototype._bindTabActions = function() {
    var action, actionMap, tyto;
    tyto = this;
    actionMap = {
      additem: "addItem",
      addcolumn: "addColumn",
      savebarn: "saveBarn",
      loadbarn: "loadBarn",
      emailbarn: "emailBarn",
      helpbarn: "showHelp",
      infobarn: "showInfo"
    };
    action = void 0;
    return $(".actions").on("click", "button", function(e) {
      action = e.target.dataset.action;
      return tyto[actionMap[action]]();
    });
  };
  Tyto.prototype._resizeColumns = function() {
    var $column, $item, correctWidth, tyto;
    tyto = this;
    correctWidth = void 0;
    $column = tyto.$element.find(".column");
    $item = tyto.$element.find(".tyto-item");
    if ($column.length) {
      correctWidth = 100 / $column.length;
      $column.css({
        width: correctWidth + "%"
      });
      return $item.css({
        "max-width": $column.first()[0].offsetWidth * 0.9 + "px"
      });
    }
  };
  Tyto.prototype._createBarnJSON = function() {
    var $columns, itemboardJSON, tyto;
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
    $columns = tyto.$element.find(".column");
    $.each($columns, function(index, column) {
      var $columnitems, columnTitle, items;
      columnTitle = $(column).find(".column-title")[0].innerHTML.toString().trim();
      items = [];
      $columnitems = $(column).find(".tyto-item");
      $.each($columnitems, function(index, item) {
        return items.push({
          content: item.querySelector(".tyto-item-content").innerHTML.toString().trim()
        });
      });
      return itemboardJSON.columns.push({
        title: columnTitle,
        items: items
      });
    });
    return itemboardJSON;
  };
  Tyto.prototype._loadBarnJSON = function(json) {
    tyto._createBarn(json);
    tyto.tab.open = false;
    return tyto.$element.trigger("tyto:action");
  };
  Tyto.prototype.saveBarn = function() {
    var content, filename, saveAnchor, tyto;
    tyto = this;
    saveAnchor = document.getElementById("savetyto");
    filename = (tyto.config.saveFilename || "itemboard") + ".json";
    content = "data:text/plain," + JSON.stringify(tyto._createBarnJSON());
    saveAnchor.setAttribute("download", filename);
    saveAnchor.setAttribute("href", content);
    saveAnchor.click();
    tyto.tab.open = false;
    return tyto.$element.trigger("tyto:action");
  };
  Tyto.prototype.loadBarn = function() {
    var $files, f, files, reader, result, tyto;
    tyto = this;
    files = document.getElementById("tytofiles");
    $files = $(files);
    f = void 0;
    reader = void 0;
    result = void 0;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      files.click();
    } else {
      alert("tyto: the file APIs are not fully supported in your browser");
    }
    return $files.on("change", function(event) {
      f = event.target.files[0];
      if ((f.type.match("application/json")) || (f.name.indexOf(".json" !== -1))) {
        reader = new FileReader();
        reader.onloadend = function(event) {
          result = JSON.parse(this.result);
          if (result.columns !== undefined && result.theme !== undefined && (result.DOMId !== undefined || result.DOMElementSelector !== undefined)) {
            return tyto._loadBarnJSON(result);
          } else {
            return alert("tyto: incorrect json");
          }
        };
        return reader.readAsText(f);
      } else {
        return alert("tyto: only load a valid itemboard json file");
      }
    });
  };
  Tyto.prototype._getEmailContent = function() {
    var $email, itemboardJSON, regex, template, tyto;
    tyto = this;
    itemboardJSON = tyto._createBarnJSON();
    template = Handlebars.compile(emailHtml);
    $email = $(template(itemboardJSON));
    regex = new RegExp("&lt;br&gt;", "gi");
    if ($email.html().trim() === "Here are your current items.") {
      return "You have no items on your plate so go grab a glass and fill up a drink! :)";
    } else {
      return $email.html().replace(regex, "").trim();
    }
  };
  Tyto.prototype.emailBarn = function() {
    var $tytoemail, content, mailto, mailtoString, recipient, subject, tyto;
    tyto = this;
    mailto = "mailto:";
    recipient = tyto.config.emailRecipient || "someone@somewhere.com";
    subject = tyto.config.emailSubject || "items as of " + (new Date()).toString();
    content = encodeURIComponent(tyto._getEmailContent());
    mailtoString = mailto + recipient + "?subject=" + encodeURIComponent(subject.trim()) + "&body=" + content;
    $tytoemail = $("#tytoemail");
    $tytoemail.attr("href", mailtoString);
    $tytoemail[0].click();
    tyto.tab.open = false;
    return tyto.$element.trigger("tyto:action");
  };
  Tyto.prototype.showHelp = function() {
    var tyto;
    tyto = this;
    if (tyto.config.helpModalId) {
      tyto.modals.helpModal = $("#" + tyto.config.helpModalId);
      return tyto.modals.helpModal.modal();
    }
  };
  Tyto.prototype.showInfo = function() {
    var tyto;
    tyto = this;
    if (tyto.config.infoModalId) {
      tyto.modals.infoModal = $("#" + tyto.config.infoModalId);
      return tyto.modals.infoModal.modal();
    }
  };
  return Tyto;
});
