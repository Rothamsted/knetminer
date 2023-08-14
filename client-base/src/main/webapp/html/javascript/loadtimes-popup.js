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

    // adds loading purse animation to target button and appends overlay to target element parent. 
    animate(){
        var uiContent = '<span style="display:flex;align-items:center;justify-content:center">'+this.#loaderText+this.#loadingPulse+'</span>';
        $(this.#parentId).append(this.#overlay);
        $(this.#buttonId).html(uiContent)
    }

}
