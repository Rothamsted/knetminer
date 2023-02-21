
getLongWaitMessage = function(){

    var getTimeOut;

    var loadingPulse = '<div class="dot"></div>'; 

    
    // static files
    var loadTimeUiItems = [
        {
            message: 'Connecting the dots',
            animation: '<img src="html/image/bulb.png" alt="export menu" width="300"/>'
        },
        {
            message: 'Traversing millions of edges', 
            animation:'<img src="html/image/DNA.png" alt="export menu" width="300"/>'
        }, 
        {
           message:'Mining the knowledge graph.', 
           animation:'<img src="html/image/Metrics.png" alt="export menu" width="300"/>'
        }
    ]

    // function return random position from static files 
    function getRandomUiItem(){
        var generateRandomInteger = Math.floor(Math.random() * loadTimeUiItems.length);
        return loadTimeUiItems[generateRandomInteger];
    }

    // function to create overlay upon  
    function createUiItem(uiItem){
        var uIContent = '<div class="overlay"><div style="margin-bottom:1rem">'+ uiItem.animation +'</div>'
        uIContent += '<span>'+ uiItem.message + loadingPulse +'</span> </div>';
        $('#search').append(uIContent);

    }

    // function returns timeout Id
    function returnTimeOut(){
        return getTimeOut;
    }

    // function to set message and animation
    function setMessage(){

        deactivateSpinner("#search");
        var getUiItem = getRandomUiItem();
        createUiItem(getUiItem);
        $('#tabviewer').hide();

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
        timeOutId:returnTimeOut
    }
}();