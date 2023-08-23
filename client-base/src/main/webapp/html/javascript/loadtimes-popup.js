class WaitPopUp {

    #buttonId = null; 
    #parentId = null; 
    #loaderText = null; 
    #loaderTimer = null 

    #overlay = '<div class="overlay"></div>'   
    #loadingPulse = '<div class="dot"></div>';

    constructor(buttonId,parentId,loaderText){
        this.#buttonId = buttonId; 
        this.#parentId  = parentId
        this.#loaderText = loaderText; 
        // check if the button is an input type of button
        if(typeof buttonId !== 'string'){
            throw new Error('Target element Id must be a string');
        }
    }

    //Clear timeout Id from callstack
    stop(){
        clearTimeout(this.#loaderTimer)    
    }

    // Starts loader animation on target element Ids and removes loader animation after 116 secs
    start(){
        this.animate();
        // 
        this.#loaderTimer = setTimeout(function(){
            $('.overlay').html('')
            $(this.#buttonId).html('Search')
        },116000)

    }

		/* 
		 * TODO: Why sometimes animate() is used and other times start()/stop() are used?
		 * 
		 * Can't we expose either animate() only, or start()/stop()? Or vice-versa?
		 * If all of the three have to be public, please explain why in the comments. 
		 *
		 */ 

    // adds loading pulse animation to target button and appends overlay to target element parent. 
    animate(){
        var uiContent = '<span style="display:flex;align-items:center;justify-content:center">'+this.#loaderText+this.#loadingPulse+'</span>';
        
        // TODO: maybe it makes sense to have this HTML as a constant variable, instead of putting it
        // straight in .append(). 
        // But even so, why is it a class field and not a local constant, if it's used here only?
        //
        // The same for #loadingPulse above
        // 
        $(this.#parentId).append(this.#overlay);
        $(this.#buttonId).html(uiContent)
    }

}
