const Suggestions = function(Suggestions, App, Backbone, Marionette) {
  Suggestions.proto = [
    'filterItems',
    'selectSuggestion',
    'renderSuggestions',
    'hideSuggestions'
  ];
  Suggestions.props = {
    ACTIVE_CLASS: 'is--active',
    SUGGESTIONS_ITEM: '.tyto-suggestions__item'
  };
  Suggestions.bootstrapView = function(view) {

    /*
      Bootstraps the given view with module functions.
      This is purely for a quick DRY fix. There is most definitely
      a better way to do this I am sure.
     */
    Suggestions.proto.forEach(function(proto) {
      view[proto] = Suggestions[proto];
    });
  };
  Suggestions.renderSuggestions = function(filterString) {
    const filterByTerm = function(entity) {
      return entity.attributes.title.toLowerCase().indexOf(filterString.toLowerCase()) !== -1;
    };
    const view = this;
    const edit = view.ui.editDescription;
    const props = view.domAttributes;
    const suggestions = view.ui.suggestions;
    let collection = Tyto.Boards.models.concat(Tyto.Tasks.models);
    collection = (filterString) ? collection.filter(filterByTerm) : collection;
    const markup = Tyto.TemplateStore.filterList({
      models: collection.slice(0, 4)
    });
    const $body = $('body');
    const $column = $('.tyto-column__tasks');
    const end = edit[0].selectionEnd;
    const start = view.__EDIT_START + 1;
    const val = edit[0].value;
    const handleBlurring = function(e) {
      const el = e.target;
      if (el.nodeName !== 'LI' && el.nodeName !== 'TEXTAREA') {
        view.hideSuggestions();
        view.delegateEvents();
        edit.blur();
        $body.off('click', handleBlurring);
      } else if (el.nodeName === 'TEXTAREA') {
        if (end < start || val.substring(start, end).indexOf(' ') !== -1) {
          view.hideSuggestions();
        }
      }
    };
    const scrollOff = function(e) {
      view.delegateEvents();
      edit.focus();
      $body.off('click', handleBlurring);
      $column.off('scroll', scrollOff);
      edit.off('scroll', scrollOff);
      view.hideSuggestions();
    };

    view.$el.off('blur', '.' + edit[0].className);
    $body.on('click', handleBlurring);
    $column.on('scroll', scrollOff);
    edit.on('scroll', scrollOff);
    if (!view.__EDIT_MODE) {
      view.__EDIT_MODE = true;
      view.__EDIT_START = edit[0].selectionStart;
      const coords = Tyto.Utils.getCaretPosition(edit[0]);
      suggestions.html(markup).css({
        left: coords.LEFT,
        top: coords.TOP
      }).removeClass(props.HIDDEN_UTIL_CLASS);
    } else {
      suggestions.html(markup);
    }
  };
  Suggestions.hideSuggestions = function() {
    const view = this;
    const props = view.domAttributes;
    view.__EDIT_MODE = false;
    view.__ACTIVE_SUGGESTION = null;
    view.__EDIT_MODE_IN_SELECTION = false;
    const suggestions = view.ui.suggestions;
    suggestions.addClass(props.HIDDEN_UTIL_CLASS);
  };
  Suggestions.filterItems = function(e) {
    const view = this;
    const suggestions = view.ui.suggestions;
    const props = view.domAttributes;
    const edit = view.ui.editDescription;
    const key = e.which;
    const start = edit[0].selectionStart;
    const end = edit[0].selectionEnd;
    const val = edit[0].value;
    if (key === 35 && !view.__EDIT_MODE) {
      const before = val.charAt(start - 1).trim();
      const after = val.charAt(start).trim();
      if (before === '' && after === '') {
        view.renderSuggestions();
      }
    } else if (view.__EDIT_MODE) {
      switch (key) {
        case 35:
        case 32:
          view.hideSuggestions();
        case 13:
          if (view.__EDIT_MODE_IN_SELECTION && view.__ACTIVE_SUGGESTION !== null) {
            e.preventDefault();
            view.__ACTIVE_SUGGESTION.click();
          } else {
            view.hideSuggestions();
          }
          break;
        case 8:
          if (end === view.__EDIT_START) {
            view.hideSuggestions();
          } else {
            view.renderSuggestions(val.substring(view.__EDIT_START + 1, end));
          }
          break;
        case 38:
        case 40:
          if (e.type === 'keydown') {
            e.preventDefault();
            const dir = (key === 38) ? 'prev' : 'next';
            const reset = (key === 38) ? 'last' : 'first';
            if (view.__EDIT_MODE_IN_SELECTION) {
              if (view.__ACTIVE_SUGGESTION[dir]().length === 0) {
                view.__ACTIVE_SUGGESTION.removeClass(Suggestions.props.ACTIVE_CLASS);
                view.__ACTIVE_SUGGESTION = suggestions.find(Suggestions.props.SUGGESTIONS_ITEM)[reset]().addClass(Suggestions.props.ACTIVE_CLASS);
              } else {
                view.__ACTIVE_SUGGESTION = view.__ACTIVE_SUGGESTION.removeClass(Suggestions.props.ACTIVE_CLASS)[dir]().addClass(Suggestions.props.ACTIVE_CLASS);
              }
            } else {
              view.__EDIT_MODE_IN_SELECTION = true;
              view.__ACTIVE_SUGGESTION = suggestions.find(Suggestions.props.SUGGESTIONS_ITEM)[reset]().addClass(Suggestions.props.ACTIVE_CLASS);
            }
          }
          break;
        case 37:
        case 39:
          if (e.type === 'keyup') {
            if (end < (view.__EDIT_START + 1) || val.substring(view.__EDIT_START, end).length !== val.substring(view.__EDIT_START, end).trim().length) {
              view.hideSuggestions();
            }
          }
          break;
        default:
          if (e.type === 'keyup') {
            view.renderSuggestions(val.substring(view.__EDIT_START + 1, end));
          }
      }
    }
  };
  Suggestions.selectSuggestion = function(e) {
    const view = this;
    const edit = view.ui.editDescription;
    const entityType = e.target.getAttribute('data-type');
    const entityId = e.target.getAttribute('data-model-id');
    if (entityType) {
      const entity = Tyto[entityType].get(entityId);
      let url;
      if (entity.attributes.boardId) {
        const boardId = Tyto.Tasks.get(entityId).attributes.boardId;
        url = '#board/' + boardId + '/task/' + entityId;
      } else {
        url = '#board/' + entityId;
      }
      url = '[' + entity.attributes.title + '](' + url + ')';
      const start = edit[0].value.slice(0, view.__EDIT_START);
      const end = edit[0].value.slice(edit[0].selectionEnd, edit[0].value.length);
      edit[0].value = start + ' ' + url + ' ' + end;
    }
    $('body').off('click');
    view.ui.editDescription.focus();
    view.hideSuggestions();
    view.delegateEvents();
  };
};

export default Suggestions;
