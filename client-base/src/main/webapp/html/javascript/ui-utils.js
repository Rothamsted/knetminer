
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

function activateButton(option){
    
    $('.resultViewer:visible').fadeOut(0, function () {
        $('.button_off').attr('class', 'button_on');
        $('#' + option).fadeIn();
        $('#' + option + '_button').attr('class', 'button_off');

        //Collapse Suggestor view
        $('#suggestor_search').attr('src', 'html/image/qs_expand.png');
        $('#suggestor_search_area').slideUp(500);
		//$('#suggestor_search').dialog('close');
    });
}

/*
Functions for Add, Remove or Replace terms from the query search box
*/
function addKeyword(keyword, from, target) {
    query = $('#' + target).val();
    newquery = query + ' OR ' + keyword;
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('addKeywordUndo addKeyword');

    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function addKeywordUndo(keyword, from, target) {
    query = $('#' + target).val();
    newquery = query.replace(' OR ' + keyword, "");
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('addKeywordUndo addKeyword');

    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function excludeKeyword(keyword, from, target) {
    query = $('#' + target).val();
    newquery = query + ' NOT ' + keyword;
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('excludeKeywordUndo excludeKeyword');
    
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function excludeKeywordUndo(keyword, from, target) {
    query = $('#' + target).val();
    newquery = query.replace(' NOT ' + keyword, "");
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('excludeKeywordUndo excludeKeyword');
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function replaceKeyword(oldkeyword, newkeyword, from, target) {
    query = $('#' + target).val();
    newquery = query.replace(oldkeyword, newkeyword);
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('replaceKeywordUndo replaceKeyword');
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function replaceKeywordUndo(oldkeyword, newkeyword, from, target) {
    query = $('#' + target).val();
    newquery = query.replace(newkeyword, oldkeyword);
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('replaceKeywordUndo replaceKeyword');
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

// function toggle the close button so users have the choice to show the their example queries and species or hide it 
function queryToggle(example,title,element){
            example.toggle('slow',function(){
                title.css('margin-bottom','1rem');
                $(element).find('img').toggle();
            });    
}

/*
 * Function
 *
 */
function contactWindow() {
    window.open("html/contact.html", "KnetMiner-Contact", "status=0, toolbar=0, location=0, menubar=0, height=200, width=400, resizable=0");
}


function activateSpinner(target) {
	// maskloader animation
	  $(target).maskLoader({
      // fade effect
      'fade': true,
      'z-index': '999',
      'background': '#F4F5F7',
      'opacity': '0.6',
      // position property
      'position': 'absolute',
      // custom loading spinner
      'imgLoader': false,
      // If false, you will have to run the "create" function.
      //  Ex: $('body').maskLoader().create(); 
      'autoCreate':true,
      // displayes text alert
      'textAlert':false
	  });
}

/*
 * Function
 *
 */
function getRadioValue(radio) {
    var radioValue;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked) {
            radioValue = radio[i].value;
        }
    }
    return radioValue;
}



function deactivateSpinner(target) {
  $(target).maskLoader().destroy();
 }
