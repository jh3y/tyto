define(['jquery', 'config', 'handlebars', 'tab', 'text!templates/workflow/column.html', 'text!templates/workflow/task.html', 'text!templates/workflow/actions.html', 'text!templates/workflow/email.html'], function($, config, Handlebars, tab, columnHtml, taskHtml, actionsHtml, emailHtml) {
  var workflow;
  workflow = function(options) {
    if (!(this instanceof workflow)) {
      return new workflow();
    }
    config = options !== undefined ? options : config;
    this._createTaskboard(config);
    this._bindPageEvents();
    return this;
  };
  workflow.prototype._createTaskboard = function(config) {
    var i;
    workflow = this;
    workflow.config = config;
    if (config.DOMElementSelector !== undefined || config.DOMId !== undefined) {
      workflow.element = config.DOMId !== undefined ? $('#' + config.DOMId) : $(config.DOMElementSelector);
      if (config.columns !== undefined && config.columns.length > 0) {
        workflow.element.find('.column').remove();
        i = 0;
        while (i < config.columns.length) {
          workflow._createColumn(config.columns[i]);
          i++;
        }
        workflow._resizeColumns();
        if (workflow.element.find('.task').length > 0) {
          $.each(workflow.element.find('.task'), function(index, task) {
            return workflow._bindTaskEvents($(task));
          });
        }
      }
      if (config.theme !== undefined && typeof config.theme === 'string') {
        workflow.element.addClass(config.theme);
      }
      if (config.actionsTab && $('[data-tab]').length === 0) {
        workflow._createActionsTab();
        return workflow._bindTabActions();
      }
    }
  };
  workflow.prototype._createColumn = function(columnData) {
    var $newColumn, template;
    template = Handlebars.compile(columnHtml);
    Handlebars.registerPartial("task", taskHtml);
    $newColumn = $(template(columnData));
    this._bindColumnEvents($newColumn);
    return this.element.append($newColumn);
  };
  workflow.prototype._bindPageEvents = function() {
    return $('body').on('click', function(event) {
      var $clicked, $clickedTask, isSidebar;
      $clicked = $(event.target);
      $clickedTask = $clicked.hasClass('task') ? $clicked : $clicked.parents('.task').length > 0 ? $clicked.parents('.task') : void 0;
      $.each($('.task'), function(index, task) {
        if (!$(task).is($clickedTask)) {
          $(task).find('.task-content').removeClass('edit').removeAttr('contenteditable');
          return $(task).attr('draggable', true);
        }
      });
      if (workflow.config.actionsTab) {
        isSidebar = ($clicked.attr('data-tab')) || ($clicked.parents('[data-tab]').length > 0);
        if (!isSidebar) {
          return workflow.tab.open = false;
        }
      }
    });
  };
  workflow.prototype._bindColumnEvents = function($column) {
    workflow = this;
    $column.find('.column-title').on('keydown', function(event) {
      var columnTitle;
      columnTitle = this;
      if (event.keyCode === 13 || event.charCode === 13) {
        return columnTitle.blur();
      }
    });
    $column[0].addEventListener("dragenter", (function(event) {
      return $column.find('.task-holder').addClass("over");
    }), false);
    $column[0].addEventListener("dragover", (function(event) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      event.dataTransfer.dropEffect = "move";
      return false;
    }), false);
    $column[0].addEventListener("dragleave", (function(event) {
      return $column.find('.task-holder').removeClass("over");
    }), false);
    return $column[0].addEventListener("drop", (function(event) {
      if (event.stopPropagation && event.preventDefault) {
        event.stopPropagation();
        event.preventDefault();
      }
      if (workflow._dragTask && workflow._dragTask !== null) {
        $column.find('.task-holder')[0].appendChild(workflow._dragTask);
        workflow._dragTask.style.opacity = 1;
      }
      $column.find('.task-holder').removeClass("over");
      return false;
    }), false);
  };
  workflow.prototype.addColumn = function() {
    this._createColumn();
    return this._resizeColumns();
  };
  workflow.prototype.removeColumn = function() {
    var removeLast;
    workflow = this;
    removeLast = function() {
      workflow.element.find('.column').last().remove();
      return workflow._resizeColumns();
    };
    if (workflow.element.find('.column').last().find('.task').length > 0) {
      if (confirm('are you sure you want to remove the last column? doing so will lose any tasks within that column')) {
        return removeLast();
      }
    } else {
      return removeLast();
    }
  };
  workflow.prototype.addTask = function(column, content) {
    if (column == null) {
      column = $('.column').first();
    }
    return this._createTask($(column), content);
  };
  workflow.prototype._createTask = function($column, content) {
    var $newTask, template;
    template = Handlebars.compile(taskHtml);
    $newTask = $(template({}));
    this._bindTaskEvents($newTask);
    $newTask.css({
      'max-width': $column[0].offsetWidth * 0.9 + 'px'
    });
    return $column.find('.task-holder').append($newTask);
  };
  workflow.prototype._bindTaskEvents = function($task) {
    var disableEdit, enableEdit, toggleEdit;
    workflow = this;
    enableEdit = function(content) {
      content.contentEditable = true;
      $(content).addClass('edit');
      return $task.attr('draggable', false);
    };
    disableEdit = function(content) {
      content.contentEditable = false;
      $(content).removeAttr('contenteditable');
      $(content).removeClass('edit');
      $(content).blur();
      return $task.attr('draggable', true);
    };
    toggleEdit = function(content) {
      if (content.contentEditable !== 'true') {
        return enableEdit(content);
      } else {
        return disableEdit(content);
      }
    };
    $task.find('.close').on('click', function(event) {
      return $task.remove();
    });
    $task.find('.task-content').on('dblclick', function() {
      return toggleEdit(this);
    });
    $task.find('.task-content').on('mousedown', function() {
      return $($(this)[0]._parent).on('mousemove', function() {
        return $(this).blur();
      });
    });
    $task.find('.task-content').on('blur', function() {
      this.contentEditable = false;
      $(this).removeAttr('contenteditable');
      $(this).removeClass('edit');
      return $task.attr('draggable', true);
    });
    return $task[0].addEventListener("dragstart", (function(event) {
      $task.find('-task-content').blur();
      this.style.opacity = "0.4";
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/html", this);
      return workflow._dragTask = this;
    }), false);
  };
  workflow.prototype._createActionsTab = function() {
    workflow = this;
    return workflow.tab = new tab({
      title: 'actions',
      attachTo: workflow.element[0],
      content: actionsHtml
    });
  };
  workflow.prototype._bindTabActions = function() {
    workflow = this;
    $('button.addtask').on('click', function(event) {
      return workflow.addTask();
    });
    $('button.addcolumn').on('click', function(event) {
      return workflow.addColumn();
    });
    $('button.removecolumn').on('click', function(event) {
      return workflow.removeColumn();
    });
    $('button.savetaskboard').on('click', function(event) {
      return workflow.saveTaskboard();
    });
    $('button.loadtaskboard').on('click', function(event) {
      return workflow.loadTaskboard();
    });
    return $('button.emailtaskboard').on('click', function(event) {
      return workflow.emailTaskboard();
    });
  };
  workflow.prototype._resizeColumns = function() {
    var correctWidth;
    correctWidth = 100 / $('.column').length;
    $('.column').css({
      'width': correctWidth + '%'
    });
    return $('.task').css({
      'max-width': $('.column').first()[0].offsetWidth * 0.9 + 'px'
    });
  };
  workflow.prototype._createTaskboardJSON = function() {
    var columns, taskboardJSON;
    workflow = this;
    taskboardJSON = {
      theme: workflow.config.theme,
      actionsTab: workflow.config.actionsTab,
      emailSubject: workflow.config.emailSubject,
      emailRecipient: workflow.config.emailRecipient,
      DOMId: workflow.config.DOMId,
      DOMElementSelector: workflow.config.DOMElementSelector,
      columns: []
    };
    columns = workflow.element.find('.column');
    $.each(columns, function(index, column) {
      var columnTasks, columnTitle, tasks;
      columnTitle = $(column).find('.column-title')[0].innerHTML.toString().trim();
      tasks = [];
      columnTasks = $(column).find('.task');
      $.each(columnTasks, function(index, task) {
        return tasks.push({
          content: task.querySelector('.task-content').innerHTML.toString().trim()
        });
      });
      return taskboardJSON.columns.push({
        title: columnTitle,
        tasks: tasks
      });
    });
    return taskboardJSON;
  };
  workflow.prototype._loadTaskboardJSON = function(json) {
    workflow._createTaskboard(json);
    return workflow.tab.open = false;
  };
  workflow.prototype.saveTaskboard = function() {
    var content, filename, saveAnchor;
    workflow = this;
    saveAnchor = $('#saveworkflow');
    filename = workflow.config.saveFilename !== undefined ? workflow.config.saveFilename + '.json' : 'taskboard.json';
    content = 'data:text/plain,' + JSON.stringify(workflow._createTaskboardJSON());
    saveAnchor[0].setAttribute('download', filename);
    saveAnchor[0].setAttribute('href', content);
    saveAnchor[0].click();
    return workflow.tab.open = false;
  };
  workflow.prototype.loadTaskboard = function() {
    var $files;
    workflow = this;
    $files = $('#workflowfiles');
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      $files[0].click();
    } else {
      alert('workflow: the file APIs are not fully supported in your browser');
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
            return workflow._loadTaskboardJSON(result);
          } else {
            return alert('workflow: incorrect json');
          }
        };
        return reader.readAsText(f);
      } else {
        return alert('workflow: only load a valid taskboard json file');
      }
    });
  };
  workflow.prototype._getEmailContent = function() {
    var $email, contentString, regex, taskboardJSON, template;
    workflow = this;
    contentString = '';
    taskboardJSON = workflow._createTaskboardJSON();
    template = Handlebars.compile(emailHtml);
    $email = $(template(taskboardJSON));
    regex = new RegExp('&lt;br&gt;', 'gi');
    if ($email.html().trim() === "Here are your current tasks.") {
      return "You have no tasks on your plate so go grab a glass and fill up a drink! :)";
    } else {
      return $email.html().replace(regex, '').trim();
    }
  };
  workflow.prototype.emailTaskboard = function() {
    var content, d, mailto, mailtoString, recipient, subject;
    workflow = this;
    mailto = 'mailto:';
    recipient = workflow.config.emailRecipient ? workflow.config.emailRecipient : 'someone@somewhere.com';
    d = new Date();
    subject = workflow.config.emailSubject ? workflow.config.emailSubject : 'Tasks as of ' + d.toString();
    content = workflow._getEmailContent();
    content = encodeURIComponent(content);
    mailtoString = mailto + recipient + '?subject=' + encodeURIComponent(subject.trim()) + '&body=' + content;
    $('#workflowemail').attr('href', mailtoString);
    return $('#workflowemail')[0].click();
  };
  return workflow;
});
