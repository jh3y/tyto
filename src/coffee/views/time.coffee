TimeModal = Backbone.Marionette.ItemView.extend
  template : Tyto.TemplateStore.timeModal

  className: ->
    this.domAttributes.VIEW_CLASS

  domAttributes:
    VIEW_CLASS: 'tyto-time-modal'
    PLAY_ICON : 'play_arrow'
    PAUSE_ICON: 'pause'

  ui:
    timerBtn : '.tyto-time-modal__timer'
    timerIcon: '.tyto-time-modal__timer-icon'
    resetBtn : '.tyto-time-modal__timer-reset'
    closeBtn : '.tyto-time-modal__close'
    timeLbl  : '.tyto-time-modal__timer-lbl'
    hours    : '.tyto-time-modal__timer-lbl-hours'
    minutes  : '.tyto-time-modal__timer-lbl-minutes'
    seconds  : '.tyto-time-modal__timer-lbl-seconds'

  events:
    'click @ui.closeBtn': 'closeModal'
    'click @ui.timerBtn': 'toggleTimer'
    'click @ui.resetBtn': 'resetTimer'

  startTimer: ->
    view          = this
    view.isTiming = true
    view.ui.timerIcon.text view.domAttributes.PAUSE_ICON
    view.ui.resetBtn.attr 'disabled', true
    view.ui.resetBtn.removeClass 'mdl-button--accent'
    view.ui.closeBtn.attr 'disabled', true
    view.ui.closeBtn.removeClass 'mdl-button--accent'
    view.timingInterval = setInterval(->
      view.incrementTime()
      view.renderTime()
    , 1000)

  incrementTime: ->
    view = this
    time = view.model.get 'timeSpent'
    time.seconds++
    if time.seconds >= 60
        time.seconds = 0
        time.minutes++
        if time.minutes >= 60
            time.minutes = 0
            time.hours++


  renderTime: ->
    view    = this
    newTime = Tyto.Utils.getRenderFriendlyTime view.model.get 'timeSpent'
    for measure in ['hours', 'minutes', 'seconds']
      if view.ui[measure].text() isnt newTime[measure]
        view.ui[measure].text newTime[measure]

  onRender: ->
    view    = this
    view.renderTime()

  stopTimer: ->
    view          = this
    view.isTiming = false
    view.ui.timerIcon.text view.domAttributes.PLAY_ICON
    view.ui.resetBtn.removeAttr 'disabled'
    view.ui.resetBtn.addClass 'mdl-button--accent'
    view.ui.closeBtn.removeAttr 'disabled'
    view.ui.closeBtn.addClass 'mdl-button--accent'
    clearInterval view.timingInterval

  resetTimer: ->
    view = this
    view.model.set 'timeSpent',
      hours  : 0
      minutes: 0
      seconds: 0
    view.renderTime()


  toggleTimer: ->
    view = this
    if view.isTiming
      view.stopTimer()
    else
      view.startTimer()

  closeModal: ->
    view = this
    view.model.save
      timeSpent: view.model.get 'timeSpent'
    Tyto.RootView.getRegion('TimeModal').el.remove()
    Tyto.RootView.removeRegion 'TimeModal'
    Tyto.Utils.renderTime view.options.modelView
    view.destroy()

module.exports = TimeModal
