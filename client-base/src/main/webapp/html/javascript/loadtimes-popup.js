
getLongWaitMessage = function(){

    var getTimeOutId;
    var loadingPulse = '<div class="dot"></div>'; 
    var overlay = '<div class="overlay"></div>'

    // function to create overlay with fontawesome spinners
    function createOverlayLoader(parentElement){
        const loaderContainer = `<div style="font-size:2rem;color:#51CE7B;" class="overlay"><i class="fas fa-dna fa-spin fa-lg"></i></div>`   
        $(parentElement).append(loaderContainer)
    }

    // function to create overlay upon  
    function createUiItem(button,parentElement,loaderText){
        var uiContent = '<span style="display:flex;align-items:center;justify-content:center">'+loaderText +loadingPulse+'</span>';
        $(parentElement).append(overlay);
        $(button).html(uiContent)
    }

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

    return{
        init:setMessage,
        timeOutId:returnTimeOut,
        createLoader:createUiItem,
        uiLoader:createOverlayLoader
    }
}();