var resetBtnEle = $("#resetKnet")

// function gets all inputs in the search form and check if value is present
// if value is present it activates the reset button
function ActivateResetButton(){
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





$(document).ready(function(){
    console.log("DOM content Loaded"); 

    // hide reset btn on page load
    $(".resetKnet").hide(); 


    $(body).click(function(){
        resetBtnEle.show(); 
    })

    $('#addRow').click(function(){
        ActivateResetButton()
    });

    $('#removeRow').click(function(){
        ActivateResetButton()
    })


     // on click event that reset all form input including the genenome icon and the suggestor text values
     resetBtnEle.click(function (event){
        event.preventDefault();
        $('form')[0].reset();
        $('#matchesResultDiv').empty();
        $('#suggestor_search').hide();
        $("#resetKnet").hide();
    });




})