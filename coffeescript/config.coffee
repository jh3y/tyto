define [], ->
	config =
		theme: 'default'
		DOMId: 'barn'
		DOMElementSelector: '.barn'
		emailSubject: 'my current items'
		emailRecipient: 'you@me.com'
		actionsTab: true
		saveFilename: 'barn'
		columns: [
			title: 'To do'
			items: [
				content: 'finish implementing tyto'
			]
		,
			title: 'In progress'
			items: []
		,
			title: 'Awaiting merge'
			items: []
		,
			title: 'Done'
			items: []
		]