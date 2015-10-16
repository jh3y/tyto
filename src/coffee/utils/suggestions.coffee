Suggestions = (Suggestions, App, Backbone, Marionette) ->
  Suggestions.proto = [
    'filterItems'
    'selectSuggestion'
    'renderSuggestions'
    'hideSuggestions'
  ]

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
    collection  = if filterString then Tyto.Boards.models.concat(Tyto.Tasks.models).filter(filterByTerm) else Tyto.Boards.models.concat(Tyto.Tasks.models)
    markup      = Tyto.TemplateStore.filterList
      models: collection.slice(0, 4)
    $body       = $ 'body'
    $column     = $ '.tyto-column__tasks'

    handleBlurring = (e) ->
      el = e.target
      if el.nodeName isnt 'LI' and el.nodeName isnt 'TEXTAREA'
        view.hideSuggestions()
        view.delegateEvents()
        edit.blur()
        $body.off 'click', handleBlurring
      else if el.nodeName is 'TEXTAREA'
        if e.target.selectionEnd < (view.__EDIT_START + 1) or e.target.value.substring(view.__EDIT_START, e.target.selectionEnd).indexOf(' ') isnt -1
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
    switch key
      when 35
        if view.__EDIT_MODE
          view.hideSuggestions()
        else
          before = edit[0].value.charAt(edit[0].selectionStart - 1).trim()
          after  = edit[0].value.charAt(edit[0].selectionStart).trim()
          if before is '' and after is ''
            view.renderSuggestions()
      when 32
        if view.__EDIT_MODE
          view.hideSuggestions()
      when 13
        if view.__EDIT_MODE_IN_SELECTION and view.__ACTIVE_SUGGESTION isnt null
          e.preventDefault()
          view.__ACTIVE_SUGGESTION.click()
        else if view.__EDIT_MODE
          view.hideSuggestions()
      when 8
        if view.__EDIT_MODE and ((edit[0].selectionEnd) is view.__EDIT_START)
          view.hideSuggestions()
        else if view.__EDIT_MODE
          view.renderSuggestions edit[0].value.substring(view.__EDIT_START + 1, edit[0].selectionEnd)
      when 38, 40
        if e.type is 'keydown' and view.__EDIT_MODE
          dir = if key is 38 then 'prev' else 'next'
          reset = if key is 38 then 'last' else 'first'
          e.preventDefault()
          if view.__EDIT_MODE_IN_SELECTION
            if view.__ACTIVE_SUGGESTION[dir]().length is 0
              view.__ACTIVE_SUGGESTION.removeClass 'is--active'
              view.__ACTIVE_SUGGESTION = suggestions.find('.tyto-suggestions__item')[reset]().addClass 'is--active'
            else
              view.__ACTIVE_SUGGESTION =  view.__ACTIVE_SUGGESTION.removeClass('is--active')[dir]()
                .addClass('is--active')
          else
            view.__EDIT_MODE_IN_SELECTION = true
            # Need to select the first item in the view...
            view.__ACTIVE_SUGGESTION = suggestions.find('.tyto-suggestions__item')[reset]().addClass 'is--active'
      when 37, 39
        # Need to check for left/right arrow press and being within the work so to speak.
        if view.__EDIT_MODE and e.type is 'keydown'
          if edit[0].selectionEnd < (view.__EDIT_START + 1) or edit[0].value.substring(view.__EDIT_START, edit[0].selectionEnd).length isnt edit[0].value.substring(view.__EDIT_START, edit[0].selectionEnd).trim().length
            view.hideSuggestions()
      else
        # Render filtered suggestions using filterString
        if view.__EDIT_MODE and e.type is 'keyup'
          view.renderSuggestions edit[0].value.substring(view.__EDIT_START + 1, edit[0].selectionEnd)

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
