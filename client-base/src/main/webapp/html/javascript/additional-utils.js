
// function gets all inputs in the search form and check if value is present
// if value is present it activates the reset button
function activateResetButton(){
    var resetBtnEle = $("#resetknet"); 
    var knetInputs = $(':input').filter('input,select,textarea'); 

    knetInputs.each(function(index,element){

        $(element).keyup(function(){
            if(element.value !== ''){
                resetBtnEle.show();
            }else{
                resetBtnEle.hide();
            }
        })
    })
}


// function toggle the close button so users have the choice to show the their example queries or hide it 
function queryToggle(){
    var queryButton = $('.close');
    var queryStatus = true;

    $(queryButton).click(function(){

        // example queries block
        var examplequeries = $("#eg_queries");
        var exampletitle = $(".details> h3")

        // example queries block close button image
        var queryImage = queryButton.children();

        if(queryStatus){
            examplequeries.hide(); 
            queryImage.attr('src','html/image/drop-down.png');
            exampletitle.css('margin-bottom','0');
            queryStatus = false; 
        }else{
            queryImage.attr('src','html/image/close_button.png');
            examplequeries.show();
            exampletitle.css('margin-bottom','1rem');
            queryStatus = true; 
        }

    }); 

}


$(document).ready(function(){
    
    activateResetButton()

    // hide reset btn on page load
    $("#resetknet").hide(); 

    // adding a gonome region search row
    $('#addRow').click(function(){
        activateResetButton()
    });
    
    // removing gonome region search row
    $('#removeRow').click(function(){
        activateResetButton()
    })

    // on click event that reset all form input including the genenome icon and the suggestor text values
    $("#resetknet").click(function(event){
        event.preventDefault();
        $('form')[0].reset();
        $("#pGViewer_title").empty();
        $('#matchesResultDiv').empty();
        $('#suggestor_search').hide();
        $('#tabviewer').hide(); 
        $("#resetknet").hide();
        $('#geneResultDiv').hide();
        $('#suggestor_search_div').hide();
        $('#region_search_area').hide(); 
        $('#region_search').attr('src','html/image/expand.gif')
    });


    queryToggle(); 
})
