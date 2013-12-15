define([], function(){
    return {
        addMultipleListeners: function (element, evts, handlerFn) {
            var evts = evts.split(' ');
            for (var i = 0; i < evts.length; i++){
                element.addEventListener(evts[i], handlerFn, false);
            }
        }
    }
});