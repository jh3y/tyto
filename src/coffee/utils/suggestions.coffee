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
    console.log 'filtering with', filterString
    filterByTerm = (entity) ->
      return entity.attributes.title.toLowerCase().indexOf(filterString.toLowerCase()) isnt -1
    view        = this
    edit        = view.ui.editDescription
    props       = view.domAttributes
    suggestions = view.ui.suggestions
    collection  = if filterString then Tyto.Boards.models.concat(Tyto.Tasks.models).filter(filterByTerm) else Tyto.Boards.models.concat(Tyto.Tasks.models)
    markup      = Tyto.TemplateStore.filterList
      models: collection
    $body       = $ 'body'
    $column     = $ '.tyto-column__tasks'

    handleBlurring = (e) ->
      el = e.target
      console.log el, el.nodeName
      if el.nodeName isnt 'LI' and el.nodeName isnt 'TEXTAREA'
        console.log 'CLOSE ME DOWN NOW'
        view.hideSuggestions()
        view.delegateEvents()
        edit.blur()
        $body.off 'click', handleBlurring
      else if el.nodeName is 'TEXTAREA'
        console.info 'Have I moved out of the selection zone???'

    scrollOff = (e) ->
      view.delegateEvents()
      edit.focus()
      $body.off   'click' , handleBlurring
      $column.off 'scroll', scrollOff
      view.hideSuggestions()

    view.$el.off 'blur'  , '.' + edit[0].className
    $body.on     'click' , handleBlurring
    $column.on   'scroll', scrollOff

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
    view                   = this
    props                  = view.domAttributes
    view.__EDIT_MODE       = false
    view.__SUGGESTION_TEXT = ''
    suggestions            = view.ui.suggestions
    suggestions.addClass props.HIDDEN_UTIL_CLASS

  Suggestions.filterItems = (e) ->
    view        = this
    suggestions = view.ui.suggestions
    props       = view.domAttributes
    edit        = view.ui.editDescription
    key   = e.which
    switch key
      when 35
        if view.__EDIT_MODE
          view.hideSuggestions()
        else
          before = edit[0].value.charAt(edit[0].selectionStart - 1).trim()
          after  = edit[0].value.charAt(edit[0].selectionStart).trim()
          if before is '' and after is ''
            view.renderSuggestions()
      when 32, 13
        if view.__EDIT_MODE
          view.hideSuggestions()
      when 8
        if view.__EDIT_MODE and ((edit[0].selectionEnd) is view.__EDIT_START)
          view.hideSuggestions()
        else if view.__EDIT_MODE
          view.renderSuggestions edit[0].value.substring(view.__EDIT_START + 1, edit[0].selectionEnd)
      when 38, 40
        if view.__EDIT_MODE
          e.preventDefault()
          console.info 'pressing up/down'
      else
        # Render filtered suggestions using filterString
        if view.__EDIT_MODE
          view.renderSuggestions edit[0].value.substring(view.__EDIT_START + 1, edit[0].selectionEnd)

  Suggestions.selectSuggestion = (e) ->
    view = this
    edit = view.ui.editDescription
    console.info 'SELECTING SUGGESTION', e.target
    entityType = e.target.getAttribute 'data-type'
    entityId   = e.target.getAttribute 'data-model-id'
    url = ''
    if entityType
      entity     = Tyto[entityType].get entityId
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
