/**
 * Tells if the gene table or the evidence table should be sortable.
 * 
 * In May 2023 we disabled this, because it doesn't work together with infinite scrolling
 * and it's hard to fix it.
 * 
 * The tables come already sorted from the API and by sensible columns. 
 */
const KNET_TABLES_SORTING_ENABLED = false

//function shows the genome or qtl search box and chromosome viewer if there is a reference genome
function showReferenceGenome() {
  $("#genomeorqtlsearchbox").show();
  if (typeof gviewer != "undefined" && gviewer == false) {
    activateButton("resultsTable");
    $("#genemap-tab_button").hide();
    $("#genemap-tab").hide();
  }
}

// function runs when jquery document ready event triggers
function loadOnReady() {
  // particle js background config
  //particlesJS.load('particles-js','html/javascript/assets/particles.json'); This is getting commented out now. If we choose to readd this later, we can uncomment it again. Search Tags: Background, particles.js, particle, wallpaper

  activateResetButton();

  // hide reset btn on page load
  $("#resetknet").hide();
  $("#keywords").focus();
  $("#tabviewer").hide(); // hide by default
  // Tooltip
  showReferenceGenome();


}

// function reset all form input including the genenome icon and the suggestor text values
function initResetButton() {
  $("#resetknet").click(function (event) {
    event.preventDefault();
    $("form")[0].reset();
    $("#pGViewer_title").empty();
    $("#pGSearch_title").empty();
    $("#matchesResultDiv").html("Type a query to begin");
    $(".concept-selector").css("pointer-events","none").attr('src', 'html/image/concept.png')
    $("#suggestor_search_div").hide();
    $("#tabviewer").hide("");
    $("#resetknet").hide();
    $("#region_search_area").hide();

    $("#region_search").attr("src", "html/image/expand.gif");
    
    clearGeneListInput()
  });
}


// function stops matchCounter being called when the enter or arrow keys are used.
function keyWordEvent(event)
{
  var currentEventKey = event.key
  const keyEvents = ['Enter','ArrowLeft','ArrowUp','ArrowRight', 'ArrowDown']
  const checkKeyEvents = currentEventKey !== undefined ? keyEvents.some( keyEvent => currentEventKey.includes(keyEvent)) : true;

  if(!checkKeyEvents){
    matchCounter();
    if ($("#suggestor_search").css('events-pointer') == 'auto'){
      refreshQuerySuggester();
    }
  } 

}


// function handles Keyword search toggle button event
function  keywordInputHandler(targetElement, inputId) {
   
  handleGenomeSearch(targetElement,inputId)
    $("#keywords")
      .animate(
        {
          height: "toggle",
        },
        500
      ).css("display", "inline-block");

    if ($(targetElement).attr('src') === "html/image/collapse.gif") {
      // hide suggestor_search img icon and suggestor_search_area div
      $("#suggestor_search_area").css("display", "none");
    }
};

// function handles Query Suggestor input event
function querySuggestorHandler(suggestorSearchDiv) {
    if ($(suggestorSearchDiv).css("display") === "none") {
      suggestorSearchDiv.show();
  }

    $("#suggestor_search_area").animate(
      {
        height: "toggle",
      },
      500
    );

    refreshQuerySuggester();
}

/** 
 * @desc Toggles Keyword Search, Gene List, Gene Region and Query Suggestion Search Inputs 
 * 
 * @param targetElement: The element object that recieves the onclick event
 * 
 * @param inputId: The Id of corresponding input elements related to the Target Element
*/
function handleGenomeSearch(targetElement,inputId) {
  var src =
    $(targetElement).attr("src") === "html/image/expand.gif"
      ? "html/image/collapse.gif"
      : "html/image/expand.gif";
  $(targetElement).attr("src", src);
  $(inputId).animate(
    {
      height: "toggle",
    },
    500
  );
}

// function shows gene and evidence view helper modal element
function showGeneViewHelper(event) {
  $('#helperModal').show();
  $('.helper-modal-overlay').show();

}

// function closes gene and evidence view helper modal element
function closeGeneViewHelper(){
  $('#helperModal').hide();
  $('.helper-modal-overlay').hide();
}


// function detects taxID in url and set it as the current taxId
function getTaxIdFromUrl(){
  var taxIdFromURL = new URLSearchParams ( document.location.search ).get ( "taxId" );
  if ( taxIdFromURL ) speciesSelector.setTaxId ( taxIdFromURL );
}

/**
 * There is some hacky test code, which I enable and use with Node.JS, from the command line
 * TODO: needs to be turned into Jest (or other framework) tests and be invoked by Maven.
 * 
 * NEVER COMMIT IT WITH true!!!
 */
const TEST_MODE = false
