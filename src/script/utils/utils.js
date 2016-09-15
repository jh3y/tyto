const Utils = function(Utils, App, Backbone, Marionette) {
  Utils.upgradeMDL = function(map) {
    _.forEach(map, function(upgrade, idx) {
      if (upgrade.el) {
        componentHandler.upgradeElement(upgrade.el, upgrade.component);
      }
    });
  };

  /*
    Syncs model 'ordinal' property to that of the DOM representation.

    NOTE :: This shouldn't be doing a loop through the collection using
    model.save. With a proper backend this could be avoided but on
    localStorage it will work with no real performance hit.
   */
  Utils.reorder = function(entity, list, attr) {
    const collection = entity.collection;
    _.forEach(list, function(item, idx) {
      const id = item.getAttribute(attr);
      const model = collection.get(id);
      if (model) {
        model.save({
          ordinal: idx + 1
        });
      }
    });
  };
  Utils.autoSize = function(el) {
    const sizeUp = function() {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    };
    el.addEventListener('keydown', sizeUp);
    el.addEventListener('input', sizeUp);
    el.addEventListener('focus', sizeUp);
    sizeUp();
  };
  Utils.getCaretPosition = function(el) {
    const carPos = el.selectionEnd;
    const div = document.createElement('div');
    const span = document.createElement('span');
    const copyStyle = getComputedStyle(el);
    const bounds = el.getBoundingClientRect();
    [].forEach.call(copyStyle, function(prop) {
      return div.style[prop] = copyStyle[prop];
    });
    div.style.position = 'absolute';
    div.textContent = el.value.substr(0, carPos);
    span.textContent = el.value.substr(carPos) || '.';
    div.appendChild(span);
    document.body.appendChild(div);
    const fontSize = parseFloat(copyStyle.fontSize.replace('px', ''), 10);
    let top = el.offsetTop - el.scrollTop + span.offsetTop + fontSize;
    top = (top > el.offsetHeight) ? el.offsetHeight : top;
    const left = el.offsetLeft - el.scrollLeft + span.offsetLeft;
    const coords = {
      TOP: top + bounds.top + 'px',
      LEFT: left + bounds.left + 'px'
    };
    document.body.removeChild(div);
    return coords;
  };
  Utils.processQueryString = function(params) {
    const qS = {};
    const pushToQs = function(set) {
      set = set.split('=');
      qS[set[0]] = set[1];
    };
    params.split('&').map(pushToQs);
    return qS;
  };
  Utils.bloom = function(el, color, url) {
    const $bloomer = Tyto.BoardView.ui.bloomer;
    const bloomer = $bloomer[0];
    const coord = el.getBoundingClientRect();
    bloomer.style.left = coord.left + (coord.width / 2) + 'px';
    bloomer.style.top = coord.top + (coord.height / 2) + 'px';
    bloomer.className = 'tyto-board__bloomer ' + 'bg--' + color;
    bloomer.classList.add('is--blooming');
    Tyto.RootView.el.classList.add('is--showing-bloom');
    const goToEdit = function() {
      $bloomer.off(Tyto.ANIMATION_EVENT, goToEdit);
      Tyto.navigate(url, true);
    };
    $bloomer.on(Tyto.ANIMATION_EVENT, goToEdit);
  };
  Utils.load = function(data, importing, wipe) {
    const boards = [];
    const cols = [];
    const tasks = [];
    const altered = {};
    if (importing) {
      delete data.tyto;
      delete data['tyto--board'];
      delete data['tyto--column'];
      delete data['tyto--task'];
    }
    if (wipe) {
      _.forOwn(window.localStorage, function(val, key) {
        if (key.indexOf('tyto') !== -1) {
          window.localStorage.removeItem(key);
        }
      });
    }
    _.forOwn(data, function(val, key) {
      let entity, saveId;
      if (wipe) {
        window.localStorage.setItem(key, val);
      }
      if (key.indexOf('tyto--board-') !== -1) {
        if (importing) {
          entity = JSON.parse(val);
          if (Tyto.Boards.get(entity.id) !== undefined) {
            saveId = entity.id;
            delete entity.id;
          }
          altered[saveId] = Tyto.Boards.create(entity).id;
        } else {
          boards.push(JSON.parse(val));
        }
      }
      if (key.indexOf('tyto--column-') !== -1) {
        if (importing) {
          entity = JSON.parse(val);
          if (altered[entity.boardId]) {
            entity.boardId = altered[entity.boardId];
          }
          if (Tyto.Columns.get(entity.id) !== undefined) {
            saveId = entity.id;
            delete entity.id;
          }
          altered[saveId] = Tyto.Columns.create(entity).id;
        } else {
          cols.push(JSON.parse(val));
        }
      }
      if (key.indexOf('tyto--task-') !== -1) {
        if (importing) {
          entity = JSON.parse(val);
          if (altered[entity.boardId]) {
            entity.boardId = altered[entity.boardId];
          }
          if (altered[entity.columnId]) {
            entity.columnId = altered[entity.columnId];
          }
          if (Tyto.Tasks.get(entity.id) !== undefined) {
            saveId = entity.id;
            delete entity.id;
          }
          altered[saveId] = Tyto.Tasks.create(entity).id;
        } else {
          tasks.push(JSON.parse(val));
        }
      }
    });
    if (!importing) {
      Tyto.Boards.reset(boards);
      Tyto.Columns.reset(cols);
      Tyto.Tasks.reset(tasks);
    }
  };

  /**
    * ES6 to the rescue!!!
  */
  Utils.EMAIL_TEMPLATE = `
    <div>
      Status for: <%= board.title %>
      <% if (columns.length > 0 && tasks.length > 0) { %>
        <% _.forEach(columns, function(column) { %>
          <%= column.attributes.title %>
          &#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;&#8212;
          <% _.forEach(tasks, function(task) { %>
            <% if (task.attributes.columnId === column.attributes.id) { %>
              &#8226; <%= task.attributes.title %>
              \n
              <%= task.attributes.description %>
              <% if (task.attributes.timeSpent.hours > 0 || task.attributes.timeSpent.minutes > 0) { %>
                \n
                -- <%=task.attributes.timeSpent.hours %> hours, <%= task.attributes.timeSpent.minutes %> minutes.
              <% } %>
            <% } %>
          <% });%>
        <% }); %>
      <% } else { %>
        Seems we are way ahead, so treat yourself and go grab a coffee! :)
      <% } %>
    </div>`;
  Utils.getEmailContent = function(board) {
    const subject = `Status for ${Tyto.ActiveBoard.get('title')} as of ${new Date().toString()}`;
    const templateFn = _.template(Tyto.Utils.EMAIL_TEMPLATE);
    let content = templateFn({
      board: board.attributes,
      columns: Tyto.Columns.where({
        boardId: board.id
      }),
      tasks: Tyto.Tasks.where({
        boardId: board.id
      })
    });
    content = encodeURIComponent($(content).text());
    return `mailto:someone@somewhere.com?subject=${encodeURIComponent(subject.trim())}&body=${content}`;
  };
  Utils.showTimeModal = function(model, view) {
    Tyto.RootView.$el.prepend($('<div class="tyto-time-modal__wrapper"></div>'));
    Tyto.RootView.addRegion('TimeModal', '.tyto-time-modal__wrapper');
    Tyto.TimeModalView = new App.Views.TimeModal({
      model    : model,
      modelView: view
    });
    Tyto.RootView.showChildView('TimeModal', Tyto.TimeModalView);
  };
  Utils.getRenderFriendlyTime = function(time) {
    const renderTime = {};
    for(let measure of ['hours', 'minutes', 'seconds']) {
      renderTime[measure] = (time[measure] < 10) ? '0' + time[measure] : time[measure];
    }
    return renderTime;
  };
  return Utils.renderTime = function(view) {
    const time = view.model.get('timeSpent');
    if (time.hours > 0 || time.minutes > 0) {
      if (view.ui.time.hasClass(view.domAttributes.HIDDEN_UTIL_CLASS)) {
        view.ui.time.removeClass(view.domAttributes.HIDDEN_UTIL_CLASS);
      }
      const friendly = Tyto.Utils.getRenderFriendlyTime(time);
      view.ui.hours.text(friendly.hours + 'h');
      view.ui.minutes.text(friendly.minutes + 'm');
    } else {
      if (!view.ui.time.hasClass(view.domAttributes.HIDDEN_UTIL_CLASS)) {
        view.ui.time.addClass(view.domAttributes.HIDDEN_UTIL_CLASS);
      }
    }
  };
};

export default Utils;
