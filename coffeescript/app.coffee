myWorkflow = `undefined`
define 'app', ['workflow'], (workflow) ->
	initialize = ->
		myWorkflow = new workflow()
	{initialize: initialize}