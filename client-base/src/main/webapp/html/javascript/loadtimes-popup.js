
getLongWaitMessage = function(){

    var getTimeOutId;
    var loadingPulse = '<div class="dot"></div>'; 

    // function to create overlay upon  
    function createUiItem(button,parentElement,loaderText){
        var uiContent = '<span style="display:flex;align-items:center;">'+ loaderText + loadingPulse +'</span>';
        var overlay = '<div class="overlay"></div>'
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
        createLoader:createUiItem
    }
}();