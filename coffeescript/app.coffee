mytyto = `undefined`
define 'app', ['tyto'], (tyto) ->
	initialize = ->
		mytyto = new tyto()
	{initialize: initialize}