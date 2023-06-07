
// TODO: getXXX are very bad name for anything that isn't a getter
// Also, this is not a message, but more someting like waitPopUp or waitPopUpManager
getLongWaitMessage = function(){

		// TODO: as above, this is a very bad name for anything that is not a getter
    var getTimeOutId;
    
    // TODO: why is it here, if it's just a simple constant, used in createUiItem() only?!
    var loadingPulse = '<div class="dot"></div>'; 

    // function to create overlay upon  
    function createUiItem(button,parentElement,loaderText){
        var uiContent = '<span style="display:flex;align-items:center;justify-content:center">'+loaderText +loadingPulse+'</span>';
        var overlay = '<div class="overlay"></div>'
        $(parentElement).append(overlay);
        $(button).html(uiContent)
    }

		/* 
		 * TODO: this is a bad design: the invoker shouldn't be forced to know that it has to  
		 * disable a timeout in order to hide the wait pop-up. You're mixing two abstraction levels
		 * and that's why it's bad, the invoker should be able to just say: stop() or hide() and then
		 * such method should take care of disabling the timeout. 
		 * 
		 * If that's not possible because there is more than one timeout at the same time, then 
		 * you much convert this to a class and have as many instances as needed. But, for what I
		 * understand, it's more likely that you just need to manage the timeout internally only and
		 * you always have one instance of this wait-pop up all the time.
		 * 
		 */
    // function returns timeout Id    
    function returnTimeOut(){
        return getTimeOutId;
    }

    // function to set message and animation
    function setMessage(){
        createUiItem('#searchBtn','#search','Searching');
        

       getTimeOutId = setTimeout(function(){
            $('.overlay').html('')
            createUiItem('#searchBtn','#search','Loading Result');     
        },116000)

    }

		// TODO: what's the need to name exposed methods differently than internal
		// functions?
    return{
        // TODO: is this needed to the outside?! Why isn't createLoader() enough?
        init:setMessage,
        // TODO: remove this is not needed, as above 
        timeOutId:returnTimeOut,
        // TODO: why both this and init() are needed. Isn't start ( message = 'Searching' ) a better
        // name for both the exposed method and the function (with the default, it could be invoked 
        // as start() and init() shouldn't be needed)
        createLoader:createUiItem
    }
}();