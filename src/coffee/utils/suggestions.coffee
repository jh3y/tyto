Suggestions = (Suggestions, App, Backbone, Marionette) ->
  Suggestions.proto = [
    'filterItems'
    'selectSuggestion'
    'renderSuggestions'
    'hideSuggestions'
  ]
  Suggestions.props =
    ACTIVE_CLASS    : 'is--active'
    SUGGESTIONS_ITEM: '.tyto-suggestions__item'

  Suggestions.bootstrapView = (view) ->
    ###
      Bootstraps the given view with module functions.
      This is purely for a quick DRY fix. There is most definitely
      a better way to do this I am sure.
    ###
    for idx, func of Suggestions.proto
      view[func] = Suggestions[func]

  Suggestions.renderSuggestions = (filterString) ->
    filterByTerm = (entity) ->
      return entity.attributes.title.toLowerCase().indexOf(filterString.toLowerCase()) isnt -1
    view        = this
    edit        = view.ui.editDescription
    props       = view.domAttributes
    suggestions = view.ui.suggestions
    collection  = Tyto.Boards.models.concat Tyto.Tasks.models
    collection  = if filterString then collection.filter(filterByTerm) else collection
    markup      = Tyto.TemplateStore.filterList
      models: collection.slice(0, 4)
    $body       = $ 'body'
    $column     = $ '.tyto-column__tasks'
    end         = edit[0].selectionEnd
    start       = view.__EDIT_START + 1
    val         = edit[0].value

    handleBlurring = (e) ->
      el = e.target
      if el.nodeName isnt 'LI' and el.nodeName isnt 'TEXTAREA'
        view.hideSuggestions()
        view.delegateEvents()
        edit.blur()
        $body.off 'click', handleBlurring
      else if el.nodeName is 'TEXTAREA'
        if end < start or val.substring(start, end).indexOf(' ') isnt -1
          view.hideSuggestions()

    scrollOff = (e) ->
      view.delegateEvents()
      edit.focus()
      $body.off   'click' , handleBlurring
      $column.off 'scroll', scrollOff
      edit.off    'scroll', scrollOff
      view.hideSuggestions()

    view.$el.off 'blur'  , '.' + edit[0].className
    $body.on     'click' , handleBlurring
    $column.on   'scroll', scrollOff
    edit.on      'scroll', scrollOff

    if !view.__EDIT_MODE
      view.__EDIT_MODE  = true
      view.__EDIT_START = edit[0].selectionStart
      coords            = Tyto.Utils.getCaretPosition edit[0]
      suggestions.html(markup)
        .css({
          left: coords.LEFT,
          top : coords.TOP
        })
        .removeClass props.HIDDEN_UTIL_CLASS
    else
      suggestions.html markup

  Suggestions.hideSuggestions = ->
    view                          = this
    props                         = view.domAttributes
    view.__EDIT_MODE              = false
    view.__ACTIVE_SUGGESTION      = null
    view.__EDIT_MODE_IN_SELECTION = false
    suggestions                   = view.ui.suggestions
    suggestions.addClass props.HIDDEN_UTIL_CLASS

  Suggestions.filterItems = (e) ->
    view        = this
    suggestions = view.ui.suggestions
    props       = view.domAttributes
    edit        = view.ui.editDescription
    key         = e.which
    start       = edit[0].selectionStart
    end         = edit[0].selectionEnd
    val         = edit[0].value
    # ONLY TRIGGERING IF 35 or in VIEW.__EDIT_MODE
    if key is 35 and !view.__EDIT_MODE
      before = val.charAt(start - 1).trim()
      after  = val.charAt(start).trim()
      if before is '' and after is ''
        view.renderSuggestions()
    else if view.__EDIT_MODE
      switch key
        # HASH, SPACE
        when 35, 32
          view.hideSuggestions()
        # ENTER
        when 13
          if view.__EDIT_MODE_IN_SELECTION and view.__ACTIVE_SUGGESTION isnt null
            e.preventDefault()
            view.__ACTIVE_SUGGESTION.click()
          else
            view.hideSuggestions()
        # BACKSPACE
        when 8
          if end is view.__EDIT_START
            view.hideSuggestions()
          else
            view.renderSuggestions val.substring(view.__EDIT_START + 1, end)
        # UP/DOWN
        when 38, 40
          if e.type is 'keydown'
            e.preventDefault()
            dir   = if key is 38 then 'prev' else 'next'
            reset = if key is 38 then 'last' else 'first'
            if view.__EDIT_MODE_IN_SELECTION
              if view.__ACTIVE_SUGGESTION[dir]().length is 0
                view.__ACTIVE_SUGGESTION.removeClass Suggestions.props.ACTIVE_CLASS
                view.__ACTIVE_SUGGESTION = suggestions.find(Suggestions.props.SUGGESTIONS_ITEM)[reset]().addClass Suggestions.props.ACTIVE_CLASS
              else
                view.__ACTIVE_SUGGESTION =  view.__ACTIVE_SUGGESTION.removeClass(Suggestions.props.ACTIVE_CLASS)[dir]()
                  .addClass(Suggestions.props.ACTIVE_CLASS)
            else
              view.__EDIT_MODE_IN_SELECTION = true
              view.__ACTIVE_SUGGESTION = suggestions.find(Suggestions.props.SUGGESTIONS_ITEM)[reset]().addClass Suggestions.props.ACTIVE_CLASS
        # LEFT/RIGHT
        when 37, 39
          # Need to check for left/right arrow press and being within the work so to speak.
          if e.type is 'keyup'
            if end < (view.__EDIT_START + 1) or val.substring(view.__EDIT_START, end).length isnt val.substring(view.__EDIT_START, end).trim().length
              view.hideSuggestions()
        else
          # Render filtered suggestions using filterString
          if e.type is 'keyup'
            view.renderSuggestions val.substring(view.__EDIT_START + 1, end)

  Suggestions.selectSuggestion = (e) ->
    view        = this
    edit        = view.ui.editDescription
    entityType  = e.target.getAttribute 'data-type'
    entityId    = e.target.getAttribute 'data-model-id'
    if entityType
      entity    = Tyto[entityType].get entityId
      if entity.attributes.boardId
        boardId = Tyto.Tasks.get(entityId).attributes.boardId
        url     = '#board/' + boardId + '/task/' + entityId
      else
        url     = '#board/' + entityId
      url   = '[' + entity.attributes.title + '](' + url + ')'
      start = edit[0].value.slice 0, view.__EDIT_START
      end   = edit[0].value.slice edit[0].selectionEnd, edit[0].value.length
      edit[0].value = start + ' ' + url + ' ' + end

    $('body').off 'click'
    view.ui.editDescription.focus()
    view.hideSuggestions()
    view.delegateEvents()

module.exports = Suggestions
