
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
    
    $('.result_viewer:visible').fadeOut(0, function () {
        $('.button_off').addClass('button_on').removeClass('button_off');
        // change svg color 
        $('#' + option).fadeIn();
        $('#' + option + '_button').addClass('button_off').removeClass('button_on')
        //Collapse Suggestor view
        $('#suggestor_search_area').slideUp(500);
    });

    var isEvidenceViewCreated = $('#'+option+'_button').hasClass('created');
    if( !isEvidenceViewCreated && option == 'evidenceTable'){
        getLongWaitMessage.uiLoader('#tabviewer_content')
        createEvidenceView()
    }
    
    const delimiterOptions = ['resultsTable','evidenceTable']
    const isDelimiterOptionPresent  = delimiterOptions.some( delimiterOption => delimiterOption == option);

    if(isDelimiterOptionPresent)
    {
        option == 'resultsTable' ? 
        handleDelimintedCta.setGeneTable() : 
        handleDelimintedCta.setEvidenceTable(); 
    }else{$('.tabviewer-actions').hide();}

    
    changeButtonOnSvg()
    changeButtonOffSvg(option + '_button')
    
    googleAnalytics.trackViewSelection ( option );
}

/*
Functions for Add, Remove or Replace terms from the query search box
*/
function addKeyword(keyword,targetId) {
    var query = $('#keywords').val();
    var newQuery;
    if (query.includes(' NOT ' + keyword)){
       newQuery = query.replace(' NOT '+ keyword, ' OR ' + keyword);
    }else if(query.includes(' OR ' + keyword)){
        newQuery = query;  
    }
    else{
         newQuery = query + ' OR ' + keyword;
    }
    $('#keywords').val(newQuery);
    $('#' + targetId).toggleClass('addKeywordUndo addKeyword');
    document.getElementById('search').scrollIntoView();

    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function addKeywordUndo(keyword, from, target) {
    query = $('#' + target).val();
    var newQuery; 
    if (query.includes(' OR ' + keyword)){
        newQuery = query.replace(' OR ' + keyword, '');
     }else if(query.includes( ' NOT ' + keyword)){
         newQuery = query.replace(' NOT '+ keyword, ' OR ' + keyword);
     }else{
        newQuery = query;
     }
    $('#' + target).val(newQuery);
    $('#' + from).toggleClass('addKeywordUndo addKeyword');

    document.getElementById('search').scrollIntoView();
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function excludeKeyword(keyword, from, target) {
    query = $('#' + target).val();
    var newQuery; 

  if(query.includes(' OR ' + keyword)){
        newQuery = query.replace(' OR '+ keyword ,' NOT '+ keyword)
    }else{
       newQuery = query + ' NOT ' + keyword
    }

    $('#' + target).val(newQuery);
    $('#' + from).toggleClass('excludeKeywordUndo excludeKeyword');
    document.getElementById('search').scrollIntoView();
    
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function excludeKeywordUndo(keyword, from, target) {
    query = $('#' + target).val();
    newQuery = query.replace(' NOT ' + keyword, '');
    $('#' + target).val(newQuery);
    $('#' + from).toggleClass('excludeKeywordUndo excludeKeyword');
    document.getElementById('search').scrollIntoView();
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function replaceKeyword(oldkeyword, newkeyword, from, target) {
    query = $('#' + target).val();
   newQuery = query.replace(oldkeyword, newkeyword);
    $('#' + target).val(newQuery);
    $('#' + from).toggleClass('replaceKeywordUndo replaceKeyword');
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function replaceKeywordUndo(oldkeyword, newkeyword, from, target) {
    query = $('#' + target).val();
   newQuery = query.replace(newkeyword, oldkeyword);
    $('#' + target).val(newQuery);
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


/** 
 * Used after API initialisation (typically in the $(document).ready() handler), to setup the UI in case
 * of successful initialisation, or to show an error page and logs in case of API failure.
 * 
 */
function showApiInitResult ( error = null )
{
	if ( !error ) {
		$("#search").show();
		return;		
	}
	
	var details;
	if ( error.status ) {
		details = "HTTP code/message: " + error.status + "/" + error.statusText;
		if ( error.responseText ) details += ". Response: " + error.responseText;
	}
	else details = error
		
  logError ( "Error while doing API initialisation.", details );
  
  $("#search").hide();
  $('#error_page').css('display', 'flex');
}


//  function creates an hidden element and takes a file type to be donwloaded to user system 
function downloadFunction(filename,filetype){

    var utf8Bytes = "";
    utf8Bytes = encodeURIComponent(filetype).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
       });
    //<a download="knetmaps_genes.tsv" href="data:application/octet-stream;base64,' + btoa(utf8Bytes) + '" target="_blank">Download as TAB delimited file</a>
    var hiddenElement= document.createElement('a');
    hiddenElement.href= 'data:application/octet-stream;base64,' + btoa(utf8Bytes);
    hiddenElement.target= '_blank';
    hiddenElement.download= filename;
    hiddenElement.click();
    return true;

  }

// function to handle network export: show and hide events
$(function(){

    // show on hover download button 
    $('#exportBtns').hover(function(e){
        $('#export-menu').css('display','flex'); 
    });

    // hide popup on mouse leave 
    $('#export-menu').mouseleave(function(){
       $('#export-menu').css('display','');
    }); 

    // close when clicked outside 
    $(document).click(function(e){
        if($(e.target).closest('#export-menu').length !== 0)return false;
        $('#export-menu').css('display','');
    }); 

    // 
})

/** 
 * Small helper to log an error within the jQuery functions like $.get().fail( jqXHR, textStatus, errorThrown )
*/
function logErrorFromRemoteCall ( msgPrefix, jqXHR, textStatus, errorThrown )
{	
	var details = jqXHR.responseJSON ? jqXHR.responseJSON : jqXHR.responseText;
	logError ( msgPrefix, details );
}

function logError ( msgPrefix, details = null ){
	if ( details !== null )
		console.error ( msgPrefix, details );
	else
		console.error ( msgPrefix )
}

// function change active button and network view svg color
function changeButtonOffSvg(elementId){
    var svgParent = document.getElementById(elementId)
    changeSvgColor(svgParent)
}
// function change non-active tabview buttons svg color
function changeButtonOnSvg(){
    var buttonOnElements = document.getElementsByClassName("button_on");
    for (var i = 0; i < buttonOnElements.length; i++){
        changeSvgColor(buttonOnElements[i])
    }
}
// util functions get button text span color and apply to svg element 
function changeSvgColor(svgParent){
    var svg = svgParent.firstElementChild.contentDocument;
    var elements = svg.getElementsByClassName("currentColor");
    var spanElement = svgParent.lastElementChild; 
    var getSpanColor = getComputedStyle(spanElement).color
    var spanHexColor = rgbToHex(getSpanColor)
    for (var i = 0; i < elements.length; i++) {
        if(elements[i].hasAttribute('stroke')){
            elements[i].style.stroke = spanHexColor;
        }else{
            elements[i].style.fill = spanHexColor;
        }
       
    }
}
// function converts rgb to hex color code 
function rgbToHex(rgb) {
    // Choose correct separator
    var sep = rgb.indexOf(",") > -1 ? "," : " ";
    // Turn "rgb(r,g,b)" into [r,g,b]
    rgb = rgb.substr(4).split(")")[0].split(sep);
  
    var r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);
  
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
}
  

// functional prepends Feedback Cta banner to navigation bar if the ui.betafeedback banner value from /dataset-info/custom-options endpoint is true
function intialiseFeedbackCtaConfig(){
	
		// TODO: /dataset-info/custom-options in general, might return an object with several elements, which
		// might cover different custom options. Hence, it would be better that at some point, we load this
		// into a global Js variable (ie, customOptions) and that we do it in a function like initCustomOptions(),
		// to be invoked in utils.js:$(document).ready(), in the setupApiUrl().then()
		
    $.get(api_url + '/dataset-info/custom-options','').done( function(data){
				// By default, this isn't defined at all, so we use the optional chaining
				// (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
				//
        var isFeedbackEnabled = data.ui?.betaFeedbackBannerEnabled;

        var FeedbackContent = `<div id="feedbackNav" class="top-nav">
        <div class="nav-padding" style="display:flex;align-items:center;margin:0 auto;">
            <span style="color:#FFFFFF;">You're one of very few using KnetMiner Beta. Providing feedback helps us improve.</span> 
            <a href="https://knetminer.com/beta-feedback-form" target="_blank" class="feedback-button" title="Submit Feedback">Share your Feedback</a> 
        </div>
        <span onclick="feedbackCloseBtn()" class="nav-padding"><i class="fa fa-times" aria-hidden="true"></i></span>
    </div> `;

    if(isFeedbackEnabled){
        $('#navbar').prepend(FeedbackContent);
    }else{
        console.log('Feedback banner not enabled')
    }

    }).fail(function(xhr,status,errolog){
        errorComponent('#pGViewer_title',xhr);
        console.log(errolog);
    });
}

// function removes feedback CTA from dom
function feedbackCloseBtn(){
  $("#feedbackNav").remove();
}

// function handles tooltips event for knetminer tabview
function showToolTips() 
{
    $("body").on("mouseenter", "span.hint", function (event) {
    var target = $(this)[0].id;
    var toolTips = getToolTipsData(); 
      var currentTooltip = toolTips[target];
      var message = currentTooltip[0];
      var addClass = currentTooltip.length > 1 ? currentTooltip[1] : "";
                  
      $("div.tooltip").remove();
  
      $('<div class="tooltip ' + addClass + '">' + message + "</div>").appendTo(
        "body"
      );
  
      tooltipY = $(this).offset()["top"] - 12;
      tooltipX = $(this).offset()["left"] - 4;
      winWidth = $(window).width();
      if (tooltipX + 300 > winWidth) {
        tooltipX = winWidth - 300;
      }
  
      $("div.tooltip.tooltip-static").css({ top: tooltipY, left: tooltipX }); //for sample queries tooltip
    });
  
    $("body").on("mousemove", "span.hint:not(#hintEgKeywords)", function (event) {
      target = $(this)[0].id;
  
      var tooltipX = event.pageX - 8;
      var tooltipY = event.pageY + 8;
  
      winWidth = $(window).width();
      if (tooltipX + 300 > winWidth) {
        tooltipX = winWidth - 300;
      }
  
      $("div.tooltip").css({ top: tooltipY, left: tooltipX });
    });
  
    $("body").on("mouseleave", "span.hint", function (event) {
      if (
        $(event.relatedTarget).hasClass("tooltip-static") ||
        $(event.relatedTarget).parent().hasClass("tooltip-static")
      ) {
        return;
      }
      $("div.tooltip").remove();
    });
  
    $("body").on("mouseleave", "div.tooltip-static", function (event) {
      $("div.tooltip").remove();
    });
}


/**
 * Can be used with a jQuery table sorter element, to manually mark a column as sorted,
 * when the table was sorted from the outside and the table sorter component is invoked
 * without asking it for re-sorting.
 */
function setTableSorterHeaderTick ( tableId, columnIndex, isAscending = true )
{
	// When the col is already in ascending order, headerAsc is the down arrow, to tell you can
	// revert the order. This reproduces the same behaviour that the table sorter
  var sortingDirection = isAscending ?  'tablesorter-headerAsc' : 'tablesorter-headerDesc'; 
  $(`#${tableId} thead tr:nth-child(1) th:nth-child(${columnIndex})`).addClass(`${sortingDirection} tablesorter-headerSorted`);
}

// function clears genelist input values
function clearGeneListInput(){
    $("#list_of_genes").val("");
    geneCounter()
  
  }
  
/**
 * 
 * function converts length of non-empty genelist inputs to percentage against the system assigned genelist limit
 */
/* TODO: Come on!!! This function occurs zillion times and IT CAN'T DEPEND on nothing but
   value and total: function percent ( value, total ).
   
   If you really want one that is specific to freegenelist_limit (but do you?!), 
   FIRST define the generic one above and then invoke it from something like: 
   
   function availableUserGenesAsPercent ( currentListLen )
   
   Also, this is super-ultra-fast, does it need to be be async?
*/
// async function convertLengthToPercent(listLength){
// 	// TODO try this instead return Math.min ( 100, listLength / freegenelist_limit )
//   return listLength >= freegenelist_limit ? 100 : (listLength / freegenelist_limit) * 100 ; 
// }
