define ['jquery', 'config', 'handlebars', 'tab', 'text!templates/workflow/column.html', 'text!templates/workflow/task.html', 'text!templates/workflow/actions.html', 'text!templates/workflow/email.html'], ($, config, Handlebars, tab, columnHtml, taskHtml, actionsHtml, emailHtml) ->
	workflow = (options) ->
		return new workflow() unless this instanceof workflow
		config = if options isnt `undefined` then options else config
		this._createTaskboard(config)
		this._bindPageEvents()
		this
	workflow::_createTaskboard = (config) ->
		workflow = this
		workflow.config = config
		if config.DOMElementSelector isnt `undefined` or config.DOMId isnt `undefined`
			workflow.element = if config.DOMId isnt `undefined` then $ '#' + config.DOMId else $ config.DOMElementSelector
			if config.columns isnt `undefined` and config.columns.length > 0
				workflow.element.find('.column').remove()
				i = 0
				while i < config.columns.length
					workflow._createColumn config.columns[i]
					i++
				workflow._resizeColumns()
				if workflow.element.find('.task').length > 0
					$.each workflow.element.find('.task'), (index, task) ->
						workflow._bindTaskEvents $ task
			if config.theme isnt `undefined` and typeof config.theme is 'string'
				workflow.element.addClass config.theme
			if config.actionsTab and $('[data-tab]').length is 0
				workflow._createActionsTab()
				workflow._bindTabActions()
	workflow::_createColumn = (columnData) ->
		template = Handlebars.compile columnHtml
		Handlebars.registerPartial "task", taskHtml
		$newColumn = $ template columnData
		this._bindColumnEvents $newColumn
		this.element.append $newColumn
	workflow::_bindPageEvents = ->
		$('body').on 'click', (event) ->
			$clicked = $ event.target
			$clickedTask = if $clicked.hasClass 'task' then $clicked else if $clicked.parents('.task').length > 0 then $clicked.parents '.task'
			$.each $('.task'), (index, task) ->
				if !$(task).is $clickedTask
					$(task).find('.task-content').removeClass('edit').removeAttr 'contenteditable'
					$(task).attr 'draggable', true
			if workflow.config.actionsTab		
				isSidebar = ($clicked.attr 'data-tab') or ($clicked.parents('[data-tab]').length > 0)
				if not isSidebar
					workflow.tab.open = false
	workflow::_bindColumnEvents =  ($column) ->
		workflow = this
		$column.find('.column-title').on 'keydown', (event) ->
			columnTitle = this
			if event.keyCode is 13 or event.charCode is 13
				columnTitle.blur()
		$column[0].addEventListener "dragenter", ((event) ->
			$column.find('.task-holder').addClass "over"
		), false
		$column[0].addEventListener "dragover", ((event) ->
			event.preventDefault()  if event.preventDefault
			event.dataTransfer.dropEffect = "move"
			false
		), false
		$column[0].addEventListener "dragleave", ((event) ->
			$column.find('.task-holder').removeClass "over"
		), false
		$column[0].addEventListener "drop", ((event) ->
			if event.stopPropagation and event.preventDefault
				event.stopPropagation()
				event.preventDefault()
			if workflow._dragTask and workflow._dragTask isnt null
				$column.find('.task-holder')[0].appendChild workflow._dragTask
				workflow._dragTask.style.opacity = 1
			$column.find('.task-holder').removeClass "over"
			false
		), false

	workflow::addColumn = ->
		this._createColumn()
		this._resizeColumns()
	workflow::removeColumn = ->
		workflow = this
		removeLast = ->
			workflow.element.find('.column').last().remove()
			workflow._resizeColumns()
		if workflow.element.find('.column').last().find('.task').length > 0
			if confirm 'are you sure you want to remove the last column? doing so will lose any tasks within that column'
				removeLast()
		else
			removeLast()
	workflow::addTask = (column = $('.column').first(), content) ->
		this._createTask $(column), content
	workflow::_createTask = ($column, content) ->
		template = Handlebars.compile taskHtml
		$newTask = $ template {}
		this._bindTaskEvents $newTask
		$newTask.css({'max-width': $column[0].offsetWidth * 0.9 + 'px'})
		$column.find('.task-holder').append $newTask
	workflow::_bindTaskEvents = ($task) ->
		workflow = this
		enableEdit = (content) ->
			content.contentEditable = true
			$(content).addClass 'edit'
			$task.attr 'draggable', false
		disableEdit = (content) ->
			content.contentEditable = false
			$(content).removeAttr 'contenteditable'
			$(content).removeClass 'edit'
			$(content).blur()
			$task.attr 'draggable', true
		toggleEdit = (content) ->
			if content.contentEditable isnt 'true'
				enableEdit(content)
			else
				disableEdit(content)
		$task.find('.close').on 'click', (event) -> 
			$task.remove()
		$task.find('.task-content').on 'dblclick', -> toggleEdit(this)
		$task.find('.task-content').on 'mousedown', ->
			$($(this)[0]._parent).on 'mousemove', ->
				$(this).blur()
		$task.find('.task-content').on 'blur', ->
			this.contentEditable = false
			$(this).removeAttr 'contenteditable'
			$(this).removeClass 'edit'
			$task.attr 'draggable', true
		$task[0].addEventListener "dragstart", ((event) ->
			$task.find('-task-content').blur()
			@style.opacity = "0.4"
			event.dataTransfer.effectAllowed = "move"
			event.dataTransfer.setData "text/html", this
			workflow._dragTask = this
		), false
	workflow::_createActionsTab = ->
		workflow = this
		workflow.tab = new tab title: 'actions', attachTo: workflow.element[0], content: actionsHtml
	workflow::_bindTabActions = ->
		workflow = this
		$('button.addtask').on 'click', (event) ->
			workflow.addTask()
		$('button.addcolumn').on 'click', (event) ->
			workflow.addColumn()
		$('button.removecolumn').on 'click', (event) ->
			workflow.removeColumn()
		$('button.savetaskboard').on 'click', (event) ->
			workflow.saveTaskboard()
		$('button.loadtaskboard').on 'click', (event) ->
			workflow.loadTaskboard()
		$('button.emailtaskboard').on 'click', (event) ->
			workflow.emailTaskboard()
	workflow::_resizeColumns = ->
		correctWidth = 100 / $('.column').length
		$('.column').css({'width': correctWidth + '%'})
		$('.task').css({'max-width': $('.column').first()[0].offsetWidth * 0.9 + 'px'})
	workflow::_createTaskboardJSON = -> 
		workflow = this
		taskboardJSON =
			theme: workflow.config.theme
			actionsTab: workflow.config.actionsTab
			emailSubject: workflow.config.emailSubject
			emailRecipient: workflow.config.emailRecipient
			DOMId: workflow.config.DOMId
			DOMElementSelector: workflow.config.DOMElementSelector
			columns: []
		columns = workflow.element.find '.column'
		$.each columns, (index, column) ->
			columnTitle = $(column).find('.column-title')[0].innerHTML.toString().trim()
			tasks = []
			columnTasks = $(column).find('.task')
			$.each columnTasks, (index, task) ->
				tasks.push content: task.querySelector('.task-content').innerHTML.toString().trim()
			taskboardJSON.columns.push title: columnTitle, tasks: tasks
		taskboardJSON
	workflow::_loadTaskboardJSON = (json) ->
		workflow._createTaskboard json
		workflow.tab.open = false
	workflow::saveTaskboard = ->
		workflow = this
		saveAnchor = $ '#saveworkflow'
		filename = if workflow.config.saveFilename isnt `undefined` then workflow.config.saveFilename + '.json' else 'taskboard.json'
		content = 'data:text/plain,' + JSON.stringify workflow._createTaskboardJSON()
		saveAnchor[0].setAttribute 'download', filename
		saveAnchor[0].setAttribute 'href', content
		saveAnchor[0].click()
		workflow.tab.open = false
	workflow::loadTaskboard = ->
		workflow = this
		$files = $ '#workflowfiles'
		if window.File and window.FileReader and window.FileList and window.Blob
			$files[0].click()
		else
			alert 'workflow: the file APIs are not fully supported in your browser'
		$files.on 'change', (event) ->
			f = event.target.files[0]
			if (f.type.match 'application/json') or (f.name.indexOf '.json' isnt -1)
				reader = new FileReader()
				reader.onloadend = (event) ->
					result = JSON.parse this.result
					if result.columns isnt `undefined` and result.theme isnt `undefined` and (result.DOMId isnt `undefined` or result.DOMElementSelector isnt `undefined`)
						workflow._loadTaskboardJSON result
					else 
						alert 'workflow: incorrect json'
				reader.readAsText f
			else
				alert 'workflow: only load a valid taskboard json file'
	workflow::_getEmailContent = ->
		workflow = this;
		contentString = ''
		taskboardJSON = workflow._createTaskboardJSON()
		template = Handlebars.compile emailHtml
		$email = $ template taskboardJSON
		regex = new RegExp '&lt;br&gt;', 'gi'
		if $email.html().trim() is "Here are your current tasks." then "You have no tasks on your plate so go grab a glass and fill up a drink! :)" else $email.html().replace(regex, '').trim()
	workflow::emailTaskboard = ->
		workflow = this
		mailto = 'mailto:'
		recipient = if workflow.config.emailRecipient then workflow.config.emailRecipient else 'someone@somewhere.com'
		d = new Date()
		subject = if workflow.config.emailSubject then workflow.config.emailSubject else 'Tasks as of ' + d.toString()	
		content = workflow._getEmailContent()
		content = encodeURIComponent content
		mailtoString = mailto + recipient + '?subject=' + encodeURIComponent(subject.trim()) + '&body=' + content;
		$('#workflowemail').attr 'href', mailtoString
		$('#workflowemail')[0].click()
	workflow