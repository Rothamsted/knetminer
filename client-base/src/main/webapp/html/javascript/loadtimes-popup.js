
getLongWaitMessage = function(){

    var getTimeOut;

    var loadingPulse = '<div class="dot"></div>'; 

    
    // static files
    var loadTimeUiItems = [
        {
            message: 'Connecting the dots',
            animation: '<iframe src="https://embed.lottiefiles.com/animation/109382"></iframe>'
        },
        {
            message: 'Traversing millions of edges', 
            animation:'<iframe src="https://embed.lottiefiles.com/animation/109382"></iframe>'
        }, 
    ]


    // function to create overlay upon  
    function createUiItem(position,element){
        var itemPosition = loadTimeUiItems[position]
        var uiContent = '<div class="overlay"><div style="margin-bottom:1rem">'+ itemPosition.animation +'</div>'
        uiContent += '<span>'+ itemPosition.message + loadingPulse +'</span> </div>';
        $(element).append(uiContent);

    }

    // function returns timeout Id
    function returnTimeOut(){
        return getTimeOut;
    }

    // function to set message and animation
    function setMessage(){
        createUiItem(1,'#search');
        $('#tabviewer').hide();
        $('#pGSearch_title').html('');
        
       getTimeOut = setTimeout(function(){
            $('.overlay').html('')
            var longerWaitContent = {
                message: 'This is taking longer than usual. Please wait a bit longer.',
                animation:'<iframe src="https://embed.lottiefiles.com/animation/77634"></iframe>'
            }
            createUiItem(longerWaitContent);     
        },116000)

    }

    return{
        init:setMessage,
        timeOutId:returnTimeOut,
        createLoader:createUiItem
    }
}();