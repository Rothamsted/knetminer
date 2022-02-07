var resetBtnEle = $("#resetknet")

// function gets all inputs in the search form and check if value is present
// if value is present it activates the reset button
function activateResetButton(){
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


function resetInputs(){
    resetBtnEle.click(function (event){
        event.preventDefault();
        $('form')[0].reset();
        $('#matchesResultDiv').empty();
        $('#suggestor_search').hide();
        resetBtnEle.hide();
    });

}



$(document).ready(function(){
    console.log("DOM content Loaded"); 

    // hide reset btn on page load
    resetBtnEle.hide(); 

    // adding a gonome region search row
    $('#addRow').click(function(){
        activateResetButton()
    });
    
    // removing gonome region search row
    $('#removeRow').click(function(){
        activateResetButton()
    })


     // on click event that reset all form input including the genenome icon and the suggestor text values
     




})