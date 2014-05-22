###
tyto - http://jh3y.github.io/tyto
Licensed under the MIT license

Jhey Tompkins (c) 2014.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
###
tyto = () ->
  return new tyto() unless this instanceof tyto
  this.config = if window.localStorage.tyto isnt `undefined` then JSON.parse window.localStorage.tyto else tyto_config
  this.modals = {}
  this.undo = {}
  this._autoSave = this.config.autoSave
  this._bindPageEvents()
  this._loadTemplates()
  this
tyto::_init = () ->
  tyto = this
  if tyto.config.showIntroModalOnLoad and tyto.config.introModalId
    tyto.modals.introModal = $ '#' + tyto.config.introModalId
    tyto._bindIntroModalEvents()
    tyto.modals.introModal.modal backdrop: 'static'
  else
    tyto._createBarn(tyto.config)
  tyto
tyto::_loadTemplates = ->
  tyto = this
  $.when(
      $.get("templates/column.html"),
      $.get("templates/item.html"),
      $.get("templates/actions.html"),
      $.get("templates/email.html")
    ).done (t1, t2, t3, t4) ->
      tyto.columnHtml = t1[0]
      tyto.itemHtml = t2[0]
      tyto.actionsHtml = t3[0]
      tyto.emailsHtml = t4[0]
      # console.log t1[0], t2[0], t3[0], t4[0]
      tyto._init()
tyto::_bindIntroModalEvents = ->
  tyto = this
  tyto.modals.introModal.find('.loadtytodefaultconfig').on 'click', (e) ->
    tyto._createBarn tyto.config
  tyto.modals.introModal.find('.loadtytocolumns').on 'click', (e) ->
    columns = []
    numberOfCols = parseInt(tyto.modals.introModal.find('.tytonumberofcols').val())
    i = 0
    while i < numberOfCols
      columns.push
        title: "column"
        tasks: []
      i++
    tyto.config.columns = columns
    tyto._createBarn tyto.config
  tyto.modals.introModal.find('.tytoloadconfig').on 'click', (e) ->
    tyto.loadBarn()
tyto::_createBarn = (config) ->
  tyto = this
  tyto._buildDOM config
  tyto.element.find('[data-action="addcolumn"]').on 'click', (e) ->
      tyto.addColumn()
  tyto._bindActions();
  if tyto.modals.introModal isnt `undefined`
    tyto.modals.introModal.modal 'hide'
  tyto.undo = {}
  $('[data-action="undolast"]').removeClass('btn-info').addClass('btn-disabled').attr 'disabled', true
  tyto.element.sortable
    connectWith: '.column',
    handle: '.column-mover'
    placeholder: 'column-placeholder'
    axis: "x"
    containment: "#barn"
    opacity: 0.8
    start: (event, ui) ->
      tyto._movedItem = $ ui.item
      tyto._movedItemOrigin = $ event.currentTarget
      columnList = Array.prototype.slice.call tyto.element.children '.column'
      tyto._movedItemIndex = columnList.indexOf $(ui.item)[0]
    stop: (event, ui) ->
      tyto.element.trigger {type: 'tyto:action', name: 'move-column', DOMcolumn: tyto._movedItem, itemIndex: tyto._movedItemIndex}
      tyto.notify 'column moved', 2000
tyto::_buildDOM = (config) ->
  tyto = this
  if tyto._autoSave is false or tyto._autoSave is undefined
    $('.actions [data-action="toggleautosave"] i').toggleClass 'fa-check-square-o fa-square-o'
  if config.DOMElementSelector isnt `undefined` or config.DOMId isnt `undefined`
    tyto.element = if config.DOMId isnt `undefined` then $ '#' + config.DOMId else $ config.DOMElementSelector
    tyto.element.attr 'data-tyto', 'true'
    if config.columns isnt `undefined` and config.columns.length > 0
      tyto.element.find('.column').remove()
      i = 0
      while i < config.columns.length
        tyto._createColumn config.columns[i]
        i++
      tyto._resizeColumns()
      if tyto.element.find('.tyto-item').length > 0
        $.each tyto.element.find('.tyto-item'), (index, item) ->
          tyto._binditemEvents $ item
tyto::_createColumn = (columnData) ->
  tyto = this
  template = Handlebars.compile tyto.columnHtml
  Handlebars.registerPartial "item", tyto.itemHtml
  $newColumn = $ template columnData
  this._bindColumnEvents $newColumn
  this.element.append $newColumn
  tyto.element.trigger {type: 'tyto:action', name: 'add-column', DOMcolumn: $newColumn, DOMitem: undefined}
tyto::_bindPageEvents = ->
  tyto = this
  inThrottle = undefined
  throttle = (func, delay) ->
    if inThrottle
      clearTimeout inThrottle
    inThrottle = setTimeout(->
      func.apply()
      tyto
    , delay)
  setUpLS = () ->
    $('body').on 'tyto:action', (event)->
      if tyto._autoSave
        throttle(->
          tyto.saveBarn()
        , 5000)
  if window.localStorage and window.localStorage.tyto
    setUpLS()
  else if window.localStorage
    $('#cookie-banner').removeClass('hide').find('[data-action="cookie-close"]').on 'click', (e)->
      setUpLS()
      $('.cookie-banner').remove()
      $('#forkongithub').removeClass 'hide'
      tyto.saveBarn()
  $('body').on 'tyto:action', (event) ->
    tyto.undo.action = event.name
    tyto.undo.column = event.DOMcolumn
    tyto.undo.item = event.DOMitem
    tyto.undo.columnIndex = event.columnIndex
    tyto.undo.itemIndex = event.itemIndex
    tyto.undo.editContent = event.content
    $('[data-action="undolast"]').removeAttr('disabled').removeClass('btn-disabled').addClass 'btn-default'
tyto::_bindColumnEvents = ($column) ->
  tyto = this
  $column.find('.column-title').on 'keydown', (event) ->
    columnTitle = this
    if event.keyCode is 13 or event.charCode is 13 or event.keyCode is 27 or event.charCode is 27
      columnTitle.blur()
  $column.find('.column-title').on 'click', (event) ->
    tyto._preEditItemContent = this.innerHTML.toString().trim();
  $column.find('.column-title').on 'blur', (e) ->
    tyto.element.trigger {type: 'tyto:action', name: 'edit-column-title', DOMcolumn: $column, content: tyto._preEditItemContent}
  $column.find('.items').sortable
    connectWith: ".items"
    handle: ".item-mover"
    placeholder: "item-placeholder"
    containment: "#barn"
    opacity: 0.8
    revert: true
    start: (event, ui) ->
      tyto._movedItem = $ ui.item
      tyto._movedItemOrigin = $ event.currentTarget
      itemList = Array.prototype.slice.call $column.find('.items').children('.tyto-item')
      tyto._movedItemIndex = itemList.indexOf $(ui.item)[0]
    stop: (event, ui) ->
      tyto.element.trigger {type: 'tyto:action', name: 'move-item', DOMcolumn: tyto._movedItemOrigin, DOMitem: tyto._movedItem, itemIndex: tyto._movedItemIndex}
      tyto.notify 'item moved', 2000
  $column.find('[data-action="removecolumn"]').on 'click', (e) ->
    tyto.removeColumn $column
  $column.find('[data-action="additem"]').on 'click', (e) ->
    tyto.addItem $column
  tyto
tyto::undoLast = ->
  tyto = this
  if tyto.undo
    switch tyto.undo.action
      when 'add-column'
        tyto.undo.column.remove()
        tyto._resizeColumns()
      when 'add-item'
        tyto.undo.item.remove()
      when 'remove-column'
        if tyto.undo.columnIndex > tyto.element.find('.column').length - 1
          tyto.element.append tyto.undo.column
        else
          $(tyto.element.find('.column')[tyto.undo.columnIndex]).before tyto.undo.column
        tyto._bindColumnEvents tyto.undo.column
        $.each tyto.undo.column.find('[data-tyto-item]'), () ->
          tyto._binditemEvents $ this
        tyto._resizeColumns()
      when 'remove-item'
        if tyto.undo.itemIndex > tyto.undo.column.find('[data-tyto-item]').length - 1
          tyto.undo.column.find('.items').append tyto.undo.item
        else
          $(tyto.element.find(tyto.undo.column).find('[data-tyto-item]')[tyto.undo.itemIndex]).before tyto.undo.item
        tyto._binditemEvents tyto.undo.item
      when 'move-item'
        if tyto.undo.itemIndex is 0 or tyto.undo.itemIndex is tyto.undo.column.children('.tyto-item').length
          tyto.undo.column.append tyto.undo.item
        else
          $(tyto.undo.column.children('.tyto-item')[tyto.undo.itemIndex]).before tyto.undo.item
      when 'move-column'
        $(tyto.element.children('.column')[tyto.undo.itemIndex]).before tyto.undo.column
      when 'edit-item-title'
        tyto.undo.item.find('.tyto-item-title')[0].innerHTML = tyto.undo.editContent
      when 'edit-item-content'
        tyto.undo.item.find('.tyto-item-content')[0].innerHTML = tyto.undo.editContent
      when 'edit-column-title'
        tyto.undo.column.find('.column-title')[0].innerHTML = tyto.undo.editContent
      when 'wipe-board'
        tyto.element.append tyto.undo.item
        $.each tyto.element.find('.tyto-item'), (key, $item) ->
          tyto._binditemEvents $ $item
        $.each tyto.element.find('.column'), (key, $column) ->
          tyto._bindColumnEvents $ $column
      else
        console.log "tyto: no luck, you don't seem to be able to undo that"
    $('[data-action="undolast"]').removeClass('btn-info').addClass('btn-disabled').attr 'disabled', true
    tyto.notify 'undone', 2000
tyto::addColumn = ->
  tyto = this
  if tyto.element.find('.column').length < tyto.config.maxColumns
    tyto._createColumn()
    tyto._resizeColumns()
    tyto.notify 'column added', 2000
  else
    alert "whoah, it's getting busy and you've reached the maximum amount of columns. You can however increase the amount of maximum columns via the config."
tyto::removeColumn = ($column = this.element.find('.column').last()) ->
  tyto = this
  calculateIndex = ->
    colIndex = undefined
    $.each $(".column"), (key, value) ->
      if $column[0] is value
        colIndex = key
        return false
    colIndex
  removeColumn = ->
    columnList = Array.prototype.slice.call $column.parent('[data-tyto]').children('.column')
    tyto.element.trigger {type: 'tyto:action', name: 'remove-column', DOMitem: undefined, DOMcolumn: $column, columnIndex: columnList.indexOf $column[0]}
    $column.remove()
    tyto._resizeColumns()
  if $column.find('.tyto-item').length > 0
    if confirm 'are you sure you want to remove this column? doing so will lose all items within it.'
      removeColumn()
      tyto.notify 'column removed', 2000
  else
    removeColumn()
    tyto.notify 'column removed', 2000
  tyto
tyto::addItem = ($column = this.element.find('.column').first(), content) ->
  this._createItem $column, content
  this.notify 'item added', 2000
tyto::_createItem = ($column, content) ->
  tyto = this
  template = Handlebars.compile tyto.itemHtml
  $newitem = $ template {}
  tyto._binditemEvents $newitem
  $column.find('.tyto-item-holder .items').append $newitem
  tyto.element.trigger {type: 'tyto:action', name: 'add-item', DOMitem: $newitem, DOMcolumn: $column}
tyto::_binditemEvents = ($item) ->
  tyto = this
  $item.find('.close').on 'click', (event) ->
    if confirm 'are you sure you want to remove this item?'
      itemList = Array.prototype.slice.call $item.parent('.items').children()
      tyto.element.trigger {type: 'tyto:action', name: 'remove-item', DOMitem: $item, DOMcolumn: $item.parents('.column'), columnIndex: undefined, itemIndex: itemList.indexOf $item[0]}
      $item.remove()
      tyto.notify 'item removed', 2000
  $item.find('i.collapser').on 'click', (e) ->
    icon = $ this
    icon.toggleClass 'fa-minus fa-plus'
    icon.closest('.tyto-item').find('.tyto-item-content').toggle()
  $item.find('.tyto-item-title, .tyto-item-content').on 'keydown', (event) ->
    item = this
    if event.keyCode is 27 or event.charCode is 27
      item.blur()
  $item.find('.tyto-item-title').on 'click', (event) ->
    tyto._preEditItemContent = this.innerHTML.toString().trim();
  $item.find('.tyto-item-title').on 'blur', (e) ->
    tyto.element.trigger {type: 'tyto:action', name: 'edit-item-title', DOMitem: $item, content: tyto._preEditItemContent}
    tyto.notify 'item title edited', 2000
  $item.find('.tyto-item-content').on 'click', (event) ->
    tyto._preEditItemContent = this.innerHTML.toString().trim();
  $item.find('.tyto-item-content').on 'blur', (e) ->
    tyto.element.trigger {type: 'tyto:action', name: 'edit-item-content', DOMitem: $item, content: tyto._preEditItemContent}
    tyto.notify 'item content edited', 2000
tyto::saveBarn = ->
  window.localStorage.setItem 'tyto', JSON.stringify tyto._createBarnJSON()
  this.notify 'board saved', 2000
tyto::deleteSave = ->
  window.localStorage.removeItem 'tyto'
  this.notify 'save deleted', 2000
tyto::_bindActions = ->
  tyto = this
  actionMap =
    additem: 'addItem'
    addcolumn: 'addColumn'
    exportbarn: 'exportBarn'
    loadbarn: 'loadBarn'
    emailbarn: 'emailBarn'
    helpbarn: 'showHelp'
    infobarn: 'showInfo'
    undolast: 'undoLast'
    savebarn: 'saveBarn'
    deletesave: 'deleteSave'
    wipeboard: 'wipeBoard'
    toggleautosave: 'toggleAutoSave'

  action = ""

  $('.actions').on 'click', '[data-action]', (e) ->
    action = e.target.dataset.action
    tyto[actionMap[action]]()
tyto::wipeBoard = ->
  if confirm 'are you really sure you wish to wipe your entire board?'
    boardContent = tyto.element[0].innerHTML
    tyto.element[0].innerHTML = '';
    tyto.element.trigger {type: 'tyto:action', name: 'wipe-board', DOMitem: $ boardContent}
    tyto.notify 'board wiped', 2000
tyto::toggleAutoSave = ->
  $('[data-action="toggleautosave"] i').toggleClass 'fa-check-square-o fa-square-o'
  tyto._autoSave = !tyto._autoSave
  if tyto._autoSave
    tyto.notify 'auto-save: ON', 2000
  else
    tyto.notify 'auto-save: OFF', 2000
  window.localStorage.setItem 'tyto', JSON.stringify tyto._createBarnJSON()
tyto::_resizeColumns = ->
  tyto = this
  if tyto.element.find('.column').length > 0
    correctWidth = 100 / tyto.element.find('.column').length
    tyto.element.find('.column').css({'width': correctWidth + '%'})
tyto::_createBarnJSON = ->
  tyto = this
  itemboardJSON =
    autoSave: tyto._autoSave
    showIntroModalOnLoad: tyto.config.showIntroModalOnLoad
    introModalId: tyto.config.introModalId
    helpModalId: tyto.config.helpModalId
    infoModalId: tyto.config.infoModalId
    emailSubject: tyto.config.emailSubject
    emailRecipient: tyto.config.emailRecipient
    DOMId: tyto.config.DOMId
    DOMElementSelector: tyto.config.DOMElementSelector
    saveFilename: tyto.config.saveFilename
    maxColumns: tyto.config.maxColumns
    columns: []
  columns = tyto.element.find '.column'
  $.each columns, (index, column) ->
    columnTitle = $(column).find('.column-title')[0].innerHTML.toString().trim()
    items = []
    columnitems = $(column).find('.tyto-item')
    $.each columnitems, (index, item) ->
      isCollapsed = if item.querySelector('.action-icons .collapser').className.indexOf('plus') isnt -1 then true else false
      items.push
        content: item.querySelector('.tyto-item-content').innerHTML.toString().trim()
        title: item.querySelector('.tyto-item-title').innerHTML.toString().trim()
        collapsed: isCollapsed
    itemboardJSON.columns.push title: columnTitle, items: items
  itemboardJSON
tyto::_loadBarnJSON = (json) ->
  tyto._buildDOM json
tyto::exportBarn = ->
  tyto = this
  saveAnchor = $ '#savetyto'
  filename = if tyto.config.saveFilename isnt `undefined` then tyto.config.saveFilename + '.json' else 'itemboard.json'
  content = 'data:text/plain,' + JSON.stringify tyto._createBarnJSON()
  saveAnchor[0].setAttribute 'download', filename
  saveAnchor[0].setAttribute 'href', content
  saveAnchor[0].click()
tyto::loadBarn = ->
  tyto = this
  $files = $ '#tytofiles'
  if window.File and window.FileReader and window.FileList and window.Blob
    $files[0].click()
  else
    alert 'tyto: the file APIs are not fully supported in your browser'
  $files.on 'change', (event) ->
    f = event.target.files[0]
    if (f.type.match 'application/json') or (f.name.indexOf '.json' isnt -1)
      reader = new FileReader()
      reader.onloadend = (event) ->
        result = JSON.parse this.result
        if result.columns isnt `undefined` and (result.DOMId isnt `undefined` or result.DOMElementSelector isnt `undefined`)
          tyto._loadBarnJSON result
        else
          alert 'tyto: incorrect json'
      reader.readAsText f
    else
      alert 'tyto: only load a valid itemboard json file'
tyto::_getEmailContent = ->
  tyto = this;
  contentString = ''
  itemboardJSON = tyto._createBarnJSON()
  template = Handlebars.compile emailHtml
  $email = $ template itemboardJSON
  regex = new RegExp '&lt;br&gt;', 'gi'
  if $email.html().trim() is "Here are your current items." then "You have no items on your plate so go grab a glass and fill up a drink! :)" else $email.html().replace(regex, '').trim()
tyto::emailBarn = ->
  tyto = this
  mailto = 'mailto:'
  recipient = if tyto.config.emailRecipient then tyto.config.emailRecipient else 'someone@somewhere.com'
  d = new Date()
  subject = if tyto.config.emailSubject then tyto.config.emailSubject else 'items as of ' + d.toString()
  content = tyto._getEmailContent()
  content = encodeURIComponent content
  mailtoString = mailto + recipient + '?subject=' + encodeURIComponent(subject.trim()) + '&body=' + content;
  $('#tytoemail').attr 'href', mailtoString
  $('#tytoemail')[0].click()
tyto::notify = (message, duration) ->
  $message = $ '<div class= "tyto-notification notify" data-tyto-notify=" ' + (duration / 1000) + ' ">' + message + '</div>'
  $('body').prepend $message
  setTimeout(->
    $message.remove()
  , duration)
tyto::showHelp = ->
  tyto = this
  if tyto.config.helpModalId
    tyto.modals.helpModal = $ '#' + tyto.config.helpModalId
    tyto.modals.helpModal.modal()
tyto::showInfo = ->
  tyto = this
  if tyto.config.infoModalId
    tyto.modals.infoModal = $ '#' + tyto.config.infoModalId
    tyto.modals.infoModal.modal()
tyto
new tyto()
