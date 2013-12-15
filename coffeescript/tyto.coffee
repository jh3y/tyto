define ["jquery", "bootstrap", "config", "handlebars", "tab", "utils", "text!templates/tyto/column.html", "text!templates/tyto/item.html", "text!templates/tyto/actions.html", "text!templates/tyto/email.html"], ($, bootstrap, config, Handlebars, Tab, utils, columnHtml, itemHtml, actionsHtml, emailHtml) ->
  Tyto = (options) ->
    new Tyto()  unless this instanceof Tyto
    config = options or config
    @config = config
    @modals = {}
    @_bindPageEvents()
    if config.showIntroModalOnLoad and config.introModalId
      @modals.introModal = $("#" + config.introModalId)
      @$introModal = @modals.introModal
      @$introModal.modal backdrop: "static"
      @_bindIntroModalEvents()
    else
      @_createBarn config
    this
  Tyto::_bindIntroModalEvents = ->
    tyto = this
    tyto.$introModal.find(".loadtytodefaultconfig").on "click", (e) ->
      tyto._createBarn tyto.config
      tyto.$element.trigger "tyto:action"

    tyto.$introModal.find(".loadtytocolumns").on "click", (e) ->
      columns = []
      i = 0
      numberOfCols = parseInt(tyto.$introModal.find(".tytonumberofcols").val())
      while i < numberOfCols
        columns.push
          title: "column"
          tasks: []
        i++
      tyto.config.columns = columns
      tyto._createBarn tyto.config
      tyto.$element.trigger "tyto:action"
    tyto.$introModal.find(".tytoloadconfig").on "click", (e) ->
      tyto.loadBarn()
  Tyto::_createBarn = (config) ->
    tyto = this
    e = undefined
    i = undefined
    if config.DOMElementSelector isnt `undefined` or config.DOMId isnt `undefined`
      tyto.$element = (if config.DOMId isnt `undefined` then $("#" + config.DOMId) else $(config.DOMElementSelector))
      tyto.$element.attr "data-tyto", "true"
      if config.columns isnt `undefined` and config.columns.length > 0
        tyto.$element.find(".column").remove()
        i = 0
        while i < config.columns.length
          tyto._createColumn config.columns[i]
          i++
        tyto._resizeColumns()
        tyto.$tyto_item = tyto.$element.find(".tyto-item")
        if tyto.$tyto_item.length
          $.each tyto.$tyto_item, ->
            tyto._binditemEvents this
      if config.theme isnt `undefined` and typeof config.theme is "string" and config.themePath isnt `undefined` and typeof config.themePath is "string"
        try
          $("head").append $("<link type=\"text/css\" rel=\"stylesheet\" href=\"" + config.themePath + "\"></link>")
          tyto.$element.addClass config.theme
        catch _error
          e = _error
          throw new Error("tyto: could not load theme.")
      if config.actionsTab and $("[data-tab]").length is 0
        tyto._createActionsTab()
        tyto._bindTabActions()
    tyto.$introModal.modal "hide"  if tyto.$introModal isnt `undefined`
  Tyto::_createColumn = (columnData) ->
    tyto = this
    template = Handlebars.compile(columnHtml)
    $newColumn = undefined
    Handlebars.registerPartial "item", itemHtml
    $newColumn = $(template(columnData))
    tyto._bindColumnEvents $newColumn[0]
    tyto.$element.append $newColumn
  Tyto::_bindPageEvents = ->
    tyto = this
    tytoFlap = undefined
    $("body").on "click", (event) ->
      $clicked = undefined
      $clickeditem = undefined
      isSidebar = undefined
      $clicked = $(event.target)
      $clickeditem = (if $clicked.hasClass("item") then $clicked else (if $clicked.parents(".tyto-item").length > 0 then $clicked.parents(".tyto-item") else undefined))
      $.each $(".tyto-item"), (index, item) ->
        unless $(item).is($clickeditem)
          $(item).find(".tyto-item-content").removeClass("edit").removeAttr "contenteditable"
          $(item).attr "draggable", true
      if tyto.config.actionsTab
        isSidebar = ($clicked.attr("data-tab")) or ($clicked.parents("[data-tab]").length > 0)
        if not isSidebar and tyto.tab isnt `undefined`
          tyto.tab.open = false
          true
    if $("html").hasClass("csstransforms")
      tytoFlap = ->
        $(".tyto-header").find(".tyto-logo").addClass "flap"
        setTimeout (->
          $(".tyto-header").find(".tyto-logo").removeClass "flap"
        ), 1000

      $("body").on "tyto:action", (e) ->
        tytoFlap()
    else
      $(".tyto-logo-image").attr "src", "images/tyto.png"
    $("#forkongithub").on "hover", (e) ->
      $(this).trigger "tyto:action"
  Tyto::_bindColumnEvents = (column) ->
    tyto = this
    $column = $(column)
    $tytoItemHolder = $column.find(".tyto-item-holder")
    columnTitle = undefined
    evt = undefined
    evtMap = {}
    $column.on("keydown", ".column-title", (e) ->
      columnTitle = this
      columnTitle.blur()  if e.keyCode is 13 or e.charCode is 13
    ).on "click", ".actions", (e) ->
      fn = e.target.dataset.fn
      tyto[fn] $column
    utils.addMultipleListeners column, "dragleave dragenter dragover drop", (e) ->
      evt = e.type
      evtMap =
        dragleave: "removeClass"
        dragenter: "addClass"
      if evt is "dragover"
        e.preventDefault and e.preventDefault()
        e.dataTransfer.dropEffect = "move"
      else if evt is "drop"
        if e.stopPropagation and e.preventDefault
          e.stopPropagation()
          e.preventDefault()
        $tytoItemHolder[0].appendChild tyto._dragitem  if tyto._dragitem and tyto._dragitem isnt null
        $tytoItemHolder.removeClass "over"
      else $tytoItemHolder[evtMap[evt]] "over"  if evtMap[evt]
  Tyto::addColumn = ->
    tyto = this
    tyto._createColumn()
    tyto._resizeColumns()
    tyto.$element.trigger "tyto:action"
  Tyto::removeColumn = ($column) ->
    tyto = this
    removeColumn = undefined
    $column = @element.find(".column").last()  if $column is null
    removeColumn = ->
      $column.remove()
      tyto._resizeColumns()
    if $column.find(".tyto-item").length > 0
      removeColumn()  if confirm("are you sure you want to remove this column? doing so will lose all items within it.")
    else
      removeColumn()
    tyto.$element.trigger "tyto:action"
  Tyto::addItem = ($column, content) ->
    tyto = this
    $column = @$element.find(".column").first()  if $column is null
    tyto._createItem $column, content
    tyto.$element.trigger "tyto:action"
  Tyto::_createItem = ($column, content) ->
    $newitem = undefined
    template = undefined
    template = Handlebars.compile(itemHtml)
    $newitem = $(template({}))
    @_binditemEvents $newitem[0]
    $newitem.css "max-width": $column[0].offsetWidth * 0.9 + "px"
    $column.find(".tyto-item-holder").append $newitem
    tyto.$element.trigger "tyto:action"
  Tyto::_binditemEvents = (item) ->
    tyto = this
    toggleEdit = undefined
    $item = $(item)
    toggleEdit = (content) ->
      content.contentEditable = not content.isContentEditable
      $(content).toggleClass "edit"
      $item.attr "draggable", ->
        not $(this).prop("draggable")
    $item.on("dblclick mousedown", ".tyto-item-content", (e) ->
      evt = e.type
      if evt is "dblclick"
        toggleEdit this
      else if evt is "mousedown"
        $($(this)[0]._parent).on "mousemove", ->
          $(this).blur()
    ).on "click", ".close", (e) ->
      if confirm("are you sure you want to remove this item?")
        $item.remove()
        tyto.$element.trigger "tyto:action"
    utils.addMultipleListeners item, "dragstart dragend", (e) ->
      evt = e.type
      if evt is "dragstart"
        $item.find("-item-content").blur()
        @style.opacity = "0.4"
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData "text/html", this
        tyto._dragitem = this
      else if evt is "dragend"
        @style.opacity = "1"
        tyto.$element.trigger "tyto:action"
  Tyto::_createActionsTab = ->
    tyto = this
    tyto.tab = new Tab(
      title: "menu"
      attachTo: tyto.$element[0]
      content: actionsHtml
    )
  Tyto::_bindTabActions = ->
    tyto = this
    actionMap =
      additem: "addItem"
      addcolumn: "addColumn"
      savebarn: "saveBarn"
      loadbarn: "loadBarn"
      emailbarn: "emailBarn"
      helpbarn: "showHelp"
      infobarn: "showInfo"
    action = undefined
    $(".actions").on "click", "button", (e) ->
      action = e.target.dataset.action
      tyto[actionMap[action]]()
  Tyto::_resizeColumns = ->
    tyto = this
    correctWidth = undefined
    $column = tyto.$element.find(".column")
    $item = tyto.$element.find(".tyto-item")
    if $column.length
      correctWidth = 100 / $column.length
      $column.css width: correctWidth + "%"
      $item.css "max-width": $column.first()[0].offsetWidth * 0.9 + "px"
  Tyto::_createBarnJSON = ->
    tyto = this
    itemboardJSON =
      showIntroModalOnLoad: tyto.config.showIntroModalOnLoad
      introModalId: tyto.config.introModalId
      theme: tyto.config.theme
      themePath: tyto.config.themePath
      actionsTab: tyto.config.actionsTab
      emailSubject: tyto.config.emailSubject
      emailRecipient: tyto.config.emailRecipient
      DOMId: tyto.config.DOMId
      DOMElementSelector: tyto.config.DOMElementSelector
      columns: []
    $columns = tyto.$element.find(".column")
    $.each $columns, (index, column) ->
      columnTitle = $(column).find(".column-title")[0].innerHTML.toString().trim()
      items = []
      $columnitems = $(column).find(".tyto-item")
      $.each $columnitems, (index, item) ->
        items.push content: item.querySelector(".tyto-item-content").innerHTML.toString().trim()
      itemboardJSON.columns.push
        title: columnTitle
        items: items
    itemboardJSON
  Tyto::_loadBarnJSON = (json) ->
    tyto._createBarn json
    tyto.tab.open = false
    tyto.$element.trigger "tyto:action"
  Tyto::saveBarn = ->
    tyto = this
    saveAnchor = document.getElementById("savetyto")
    filename = (tyto.config.saveFilename or "itemboard") + ".json"
    content = "data:text/plain," + JSON.stringify(tyto._createBarnJSON())
    saveAnchor.setAttribute "download", filename
    saveAnchor.setAttribute "href", content
    saveAnchor.click()
    tyto.tab.open = false
    tyto.$element.trigger "tyto:action"
  Tyto::loadBarn = ->
    tyto = this
    files = document.getElementById("tytofiles")
    $files = $(files)
    f = undefined
    reader = undefined
    result = undefined
    if window.File and window.FileReader and window.FileList and window.Blob
      files.click()
    else
      alert "tyto: the file APIs are not fully supported in your browser"
    $files.on "change", (event) ->
      f = event.target.files[0]
      if (f.type.match("application/json")) or (f.name.indexOf(".json" isnt -1))
        reader = new FileReader()
        reader.onloadend = (event) ->
          result = JSON.parse(@result)
          if result.columns isnt `undefined` and result.theme isnt `undefined` and (result.DOMId isnt `undefined` or result.DOMElementSelector isnt `undefined`)
            tyto._loadBarnJSON result
          else
            alert "tyto: incorrect json"
        reader.readAsText f
      else
        alert "tyto: only load a valid itemboard json file"
  Tyto::_getEmailContent = ->
    tyto = this
    itemboardJSON = tyto._createBarnJSON()
    template = Handlebars.compile(emailHtml)
    $email = $(template(itemboardJSON))
    regex = new RegExp("&lt;br&gt;", "gi")
    if $email.html().trim() is "Here are your current items."
      "You have no items on your plate so go grab a glass and fill up a drink! :)"
    else
      $email.html().replace(regex, "").trim()
  Tyto::emailBarn = ->
    tyto = this
    mailto = "mailto:"
    recipient = tyto.config.emailRecipient or "someone@somewhere.com"
    subject = tyto.config.emailSubject or "items as of " + (new Date()).toString()
    content = encodeURIComponent(tyto._getEmailContent())
    mailtoString = mailto + recipient + "?subject=" + encodeURIComponent(subject.trim()) + "&body=" + content
    $tytoemail = $("#tytoemail")
    $tytoemail.attr "href", mailtoString
    $tytoemail[0].click()
    tyto.tab.open = false
    tyto.$element.trigger "tyto:action"
  Tyto::showHelp = ->
    tyto = this
    if tyto.config.helpModalId
      tyto.modals.helpModal = $("#" + tyto.config.helpModalId)
      tyto.modals.helpModal.modal()
  Tyto::showInfo = ->
    tyto = this
    if tyto.config.infoModalId
      tyto.modals.infoModal = $("#" + tyto.config.infoModalId)
      tyto.modals.infoModal.modal()
  Tyto