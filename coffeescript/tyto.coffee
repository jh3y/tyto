define ['jquery', 'bootstrap', 'config', 'handlebars', 'tab', 'text!templates/tyto/column.html', 'text!templates/tyto/item.html', 'text!templates/tyto/actions.html', 'text!templates/tyto/email.html'], ($, bootstrap, config, Handlebars, tab, columnHtml, itemHtml, actionsHtml, emailHtml) ->
	tyto = (options) ->
		return new tyto() unless this instanceof tyto
		config = if options isnt `undefined` then options else config
		this.config = config
		this.modals = {}
		this._bindPageEvents()
		if config.showIntroModalOnLoad and config.introModalId
			this.modals.introModal = $ '#' + config.introModalId
			this._bindIntroModalEvents()
			this.modals.introModal.modal backdrop: 'static'
		else
			this._createBarn(config)
		this
	tyto::_bindIntroModalEvents = ->
		tyto = this
		tyto.modals.introModal.find('.loadtytodefaultconfig').on 'click', (e) ->
			tyto._createBarn tyto.config
			tyto.element.trigger 'tyto:action'
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
			tyto.element.trigger 'tyto:action'
		tyto.modals.introModal.find('.tytoloadconfig').on 'click', (e) ->
			tyto.loadBarn()
	tyto::_createBarn = (config) ->
		tyto = this
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
			if config.theme isnt `undefined` and typeof config.theme is 'string' and config.themePath isnt `undefined` and typeof config.themePath is 'string'
				try
					$('head').append $ '<link type="text/css" rel="stylesheet" href="' + config.themePath + '"></link>'
					tyto.element.addClass config.theme
				catch e
					return throw Error 'tyto: could not load theme.'
			if config.actionsTab and $('[data-tab]').length is 0
				tyto._createActionsTab()
				tyto._bindTabActions()
		if tyto.modals.introModal isnt `undefined`
			tyto.modals.introModal.modal 'hide'
	tyto::_createColumn = (columnData) ->
		template = Handlebars.compile columnHtml
		Handlebars.registerPartial "item", itemHtml
		$newColumn = $ template columnData
		this._bindColumnEvents $newColumn
		this.element.append $newColumn
	tyto::_bindPageEvents = ->
		tyto = this
		$('body').on 'click', (event) ->
			$clicked = $ event.target
			$clickeditem = if $clicked.hasClass 'item' then $clicked else if $clicked.parents('.tyto-item').length > 0 then $clicked.parents '.tyto-item'
			$.each $('.tyto-item'), (index, item) ->
				if !$(item).is $clickeditem
					$(item).find('.tyto-item-content').removeClass('edit').removeAttr 'contenteditable'
					$(item).attr 'draggable', true
			if tyto.config.actionsTab		
				isSidebar = ($clicked.attr 'data-tab') or ($clicked.parents('[data-tab]').length > 0)
				if not isSidebar and tyto.tab isnt `undefined`
					tyto.tab.open = false
					true
		if $('html').hasClass 'csstransforms'
			tytoFlap = ->
				$('.tyto-header').find('.tyto-logo').addClass 'flap'
				setTimeout (-> $('.tyto-header').find('.tyto-logo').removeClass 'flap'), 1000
			$('body').on 'tyto:action', (e) ->
				tytoFlap()
		else 
			$('.tyto-logo-image').attr 'src', 'images/tyto.png'
		# silly little function for flap on hover of fork link.
		$('#forkongithub').on 'hover', (e) ->
			$(this).trigger 'tyto:action'
	tyto::_bindColumnEvents = ($column) ->
		tyto = this
		$column.find('.column-title').on 'keydown', (event) ->
			columnTitle = this
			if event.keyCode is 13 or event.charCode is 13
				columnTitle.blur()
		$column[0].addEventListener "dragenter", ((event) ->
			$column.find('.tyto-item-holder').addClass "over"
		), false
		$column[0].addEventListener "dragover", ((event) ->
			event.preventDefault()  if event.preventDefault
			event.dataTransfer.dropEffect = "move"
			false
		), false
		$column[0].addEventListener "dragleave", ((event) ->
			$column.find('.tyto-item-holder').removeClass "over"
		), false
		$column[0].addEventListener "drop", ((event) ->
			if event.stopPropagation and event.preventDefault
				event.stopPropagation()
				event.preventDefault()
			if tyto._dragitem and tyto._dragitem isnt null
				$column.find('.tyto-item-holder')[0].appendChild tyto._dragitem
			$column.find('.tyto-item-holder').removeClass "over"
			false
		), false
		$column.children('.close').on 'click', (e) ->
			tyto.removeColumn $column
		$column.children('.additem').on 'click', (e) ->
			tyto.addItem $column
	tyto::addColumn = ->
		tyto = this
		tyto._createColumn()
		tyto._resizeColumns()
		tyto.element.trigger 'tyto:action'
	tyto::removeColumn = ($column = this.element.find('.column').last()) ->
		tyto = this
		removeColumn = ->
			$column.remove()
			tyto._resizeColumns()
		if $column.find('.tyto-item').length > 0
			if confirm 'are you sure you want to remove this column? doing so will lose all items within it.'
				removeColumn()
		else
			removeColumn()
		tyto.element.trigger 'tyto:action'
	tyto::addItem = ($column = this.element.find('.column').first(), content) ->
		this._createItem $column, content
		tyto.element.trigger 'tyto:action'
	tyto::_createItem = ($column, content) ->
		template = Handlebars.compile itemHtml
		$newitem = $ template {}
		this._binditemEvents $newitem
		$newitem.css({'max-width': $column[0].offsetWidth * 0.9 + 'px'})
		$column.find('.tyto-item-holder').append $newitem
		tyto.element.trigger 'tyto:action'
	tyto::_binditemEvents = ($item) ->
		tyto = this
		enableEdit = (content) ->
			content.contentEditable = true
			$(content).addClass 'edit'
			$item.attr 'draggable', false
		disableEdit = (content) ->
			content.contentEditable = false
			$(content).removeAttr 'contenteditable'
			$(content).removeClass 'edit'
			$(content).blur()
			$item.attr 'draggable', true
		toggleEdit = (content) ->
			if content.contentEditable isnt 'true'
				enableEdit(content)
			else
				disableEdit(content)
		$item.find('.close').on 'click', (event) ->
			if confirm 'are you sure you want to remove this item?'
				$item.remove()
				tyto.element.trigger 'tyto:action'
		$item.find('.tyto-item-content').on 'dblclick', -> toggleEdit(this)
		$item.find('.tyto-item-content').on 'mousedown', ->
			$($(this)[0]._parent).on 'mousemove', ->
				$(this).blur()
		$item.find('.tyto-item-content').on 'blur', ->
			this.contentEditable = false
			$(this).removeAttr 'contenteditable'
			$(this).removeClass 'edit'
			$item.attr 'draggable', true
		$item[0].addEventListener "dragstart", ((event) ->
			$item.find('-item-content').blur()
			@style.opacity = "0.4"
			event.dataTransfer.effectAllowed = "move"
			event.dataTransfer.setData "text/html", this
			tyto._dragitem = this
		), false
		$item[0].addEventListener "dragend", ((event) ->
			@style.opacity = "1"
			tyto.element.trigger 'tyto:action'
		), false
	tyto::_createActionsTab = ->
		tyto = this
		tyto.tab = new tab title: 'menu', attachTo: tyto.element[0], content: actionsHtml
	tyto::_bindTabActions = ->
		tyto = this
		$('button.additem').on 'click', (event) ->
			tyto.addItem()
		$('button.addcolumn').on 'click', (event) ->
			tyto.addColumn()
		$('button.savebarn').on 'click', (event) ->
			tyto.saveBarn()
		$('button.loadbarn').on 'click', (event) ->
			tyto.loadBarn()
		$('button.emailbarn').on 'click', (event) ->
			tyto.emailBarn()
		$('button.helpbarn').on 'click', (event) ->
			tyto.showHelp()
		$('button.infobarn').on 'click', (event) ->
			tyto.showInfo()
	tyto::_resizeColumns = ->
		tyto = this
		if tyto.element.find('.column').length > 0
			correctWidth = 100 / tyto.element.find('.column').length
			tyto.element.find('.column').css({'width': correctWidth + '%'})
			tyto.element.find('.tyto-item').css({'max-width': tyto.element.find('.column').first()[0].offsetWidth * 0.9 + 'px'})
	tyto::_createBarnJSON = -> 
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
		columns = tyto.element.find '.column'
		$.each columns, (index, column) ->
			columnTitle = $(column).find('.column-title')[0].innerHTML.toString().trim()
			items = []
			columnitems = $(column).find('.tyto-item')
			$.each columnitems, (index, item) ->
				items.push content: item.querySelector('.tyto-item-content').innerHTML.toString().trim()
			itemboardJSON.columns.push title: columnTitle, items: items
		itemboardJSON
	tyto::_loadBarnJSON = (json) ->
		tyto._createBarn json
		tyto.tab.open = false
		tyto.element.trigger 'tyto:action'
	tyto::saveBarn = ->
		tyto = this
		saveAnchor = $ '#savetyto'
		filename = if tyto.config.saveFilename isnt `undefined` then tyto.config.saveFilename + '.json' else 'itemboard.json'
		content = 'data:text/plain,' + JSON.stringify tyto._createBarnJSON()
		saveAnchor[0].setAttribute 'download', filename
		saveAnchor[0].setAttribute 'href', content
		saveAnchor[0].click()
		tyto.tab.open = false
		tyto.element.trigger 'tyto:action'
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
					if result.columns isnt `undefined` and result.theme isnt `undefined` and (result.DOMId isnt `undefined` or result.DOMElementSelector isnt `undefined`)
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
		tyto.tab.open = false
		tyto.element.trigger 'tyto:action'
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