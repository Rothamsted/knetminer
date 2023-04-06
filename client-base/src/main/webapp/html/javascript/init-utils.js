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
    $("#geneResultDiv").hide();
    $("#region_search_area").hide();
    $("#region_search").attr("src", "html/image/expand.gif");
  });
}

// function Calculates the amount of documents to be displayed with the current query
function inputHandlers() {
  $("#keywords").keyup(function (e) {
    // this stops matchCounter being called when the enter or arrow keys are used.
    // TODO: 
    // - what the hell are these numbers?! e.which is deprecated, at some point, we should 
    // migrate to the more modern interface for this (see https://stackoverflow.com/questions/35394937,
    // https://www.toptal.com/developers/keycode)
    // - Apart from that, this code style is awful, and it should be turned into something like:  
    //   e not in [13, 37, 38...] (Js has functions to search values into arrays)
    if (
      e.which !== 13 &&
      e.which !== 37 &&
      e.which !== 38 &&
      e.which !== 39 &&
      e.which !== 40
    ) {
      matchCounter();
    }
    // this stops refreshQuerySuggester being called when the enter or arrow keys are used.
    if (
      e.which !== 13 &&
      e.which !== 37 &&
      e.which !== 38 &&
      e.which !== 39 &&
      e.which !== 40
    ) {
      // Refresh the query suggester table as well, if it's already open.
      if ($("#suggestor_search").css('events-pointer') == 'auto'){
        refreshQuerySuggester();
      }
      
    }

  });

  $("#list_of_genes").keyup(function () {
    geneCounter();
  });
}

// function add and remove QTL region
// TODO: code quality, to be addressed when there is time:
// - is there any reason why this is named unconventionally, with the capitalised format?
// - all these names like *region* are too generic and don't convey what they are about, we
// should make them more homogeneous and mention either of chr, chromosome, chromosomeRegion or alike
// - we also need to review the files they belong, eg, there seem to be much stuff in this init-utils
// that isn't mainly about initialisation
// 
function qtlRegionHandlers() {
  $("#addRow").click(function () {
    var curMaxInput = $("#region_search_area table tr").length - 1;
    $("#region_search_area tr:nth-child(2)")
      .clone()
      .insertAfter($("#region_search_area tr:last").prev())
      .attr('data-index', curMaxInput)
      .find("td:eq(0)")
      .find("select:eq(0)")
      .attr({
        id: "chr" + curMaxInput,
        name: "chr" + curMaxInput,
        onChange:"findChromosomeGenes(event,null)",
      })
      .parent()
      .parent()
      .find("td:eq(1)")
      .find("input:text:eq(0)")
      .attr({
        id: "start" + curMaxInput,
        name: "start" + curMaxInput,
        onKeyup:"findChromosomeGenes(event,null)",
      })
      .parent()
      .parent()
      .find("td:eq(2)")
      .find("input:text:eq(0)")
      .attr({
        id: "end" + curMaxInput,
        name: "end" + curMaxInput,
        onKeyup:"findChromosomeGenes(event,null)",
        oninput: "toggleRegionDeleteIcon(" + curMaxInput + ")",
      })
      .parent()
      .parent()
      .find("td:eq(3)")
      .find("input:text:eq(0)")
      .attr({
        id: "label" + curMaxInput,
        name: "label" + curMaxInput,
        oninput: "toggleRegionDeleteIcon(" + curMaxInput + ")",
      })
      .parent()
      .parent()
      .find("td:eq(4)")
      .find("input:text:eq(0)")
      .attr({
        class: "gene_count",
        id: "genes" + curMaxInput,
        name: "label" + curMaxInput,
        onFocus:"findChromosomeGenes(event,null)",
      })
      .parent()
      .parent()
      .find("td:eq(5)")
      .find("span:eq(0)")
      .attr({
        id: "delete" + curMaxInput,
      });
    emptyRegionInputs(curMaxInput);
    activateResetButton();
    if ($("#region_search_area tr").length >= 7) {
      $("#addRow").attr("disabled", true);
    }
  });
}


// function removes and empty gene regions
async function removeRegionRow(event) {
  activateResetButton();
  var currentElement = event.currentTarget;
  var regionRow = $(currentElement).parents("tr");
  var regionNumber = getChromosomeRegionIndex(currentElement)

    if ($("#region_search_area tr").length > 3) {
      // find current row and remove from DOM
    await regionRow.remove();
      // renumber the remaining rows
      resetRegion();
    } else {
      emptyRegionInputs(regionNumber);
    }

    if ($("#rows tr").length < 7) {
      $("#addRow").removeAttr("disabled");
    }
    return false;
}

// util function extracts number from genome region inputs Ids
// TODO: see comments in findGenes()
function getChromosomeRegionIndex(currentElement){
  // retrieves index from row data-index attribute
  const chr = currentElement.closest('tr').getAttribute("data-index");
  var regionNumber = chr.replace(/\D/g, '');
  return regionNumber
}

// function renumbers genome regions inputs when a row is removed
function resetRegion(){
  var regionInputs = getGenomeRegionRows(); 

  for (var genomeRegionIndex = 0; genomeRegionIndex < regionInputs.length; genomeRegionIndex++) {
      var regionElementArray = $(regionInputs[genomeRegionIndex]).children();
      var newOrder = genomeRegionIndex+1
      var [chromosome,start,end,label,Genes, cancel] = regionElementArray

      $(chromosome).children().attr('id',`chr${newOrder}`);
      $(start).children().attr('id',`start${newOrder}`);
      $(end).children().attr('id',`end${newOrder}`);
      $(label).children().attr('id',`label${newOrder}`);
      $(Genes).children().attr('id',`genes${newOrder}`);
      $(cancel).children().attr('id',`delete${newOrder}`);
  }
}

// util function returns all genome region rows
function getGenomeRegionRows(){
  var regionInputs = $('#regions_table > tbody').children();
  regionInputs = regionInputs.slice(1,-1); 
  return regionInputs
}

// util function take rowNumber of gene regions and reset all input fields
function emptyRegionInputs(rowNumber) {
  $("#chr" + rowNumber).attr("selectedIndex", 0);
  $("#start" + rowNumber).val("");
  $("#end" + rowNumber).val("");
  $("#label" + rowNumber).val("");
  $("#genes" + rowNumber).val("");
  if (rowNumber == 1) {
    $("#delete1").hide();
  }else{
    resetRegion();
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

// util function removes genome region input row from the DOM
function removeGeneRow() {
  var geneRegions = $("#regions_table").find("tr");
  var removeableRegions = geneRegions.splice(2, geneRegions.length - 3);
  for (var i = 0; i < removeableRegions.length; i++) {
    removeableRegions[i].remove();
  }
}

// function toggles region delete icon triggered by oninput events and accepts region position value
function toggleRegionDeleteIcon(regionID) {
  var startInput = $("#start" + regionID).val(),
    endInput = $("#end" + regionID).val(),
    labelInput = $("#label" + regionID).val();
  if (startInput || endInput || labelInput !== "") {
    $("#delete" + regionID).show();
  } else if (startInput == '' && endInput == '' && labelInput == "") {
    $("#genes" + regionID).val('');
    if (regionID == 1) {
      $("#delete" + regionID).hide();
    }
  }
}

// function detects taxID in url and set it as the current taxId
function getTaxIdFromUrl(){          	
  var taxIdFromURL = new URLSearchParams ( document.location.search ).get ( "taxId" );
  if ( taxIdFromURL ) multiSpeciesFeature.setTaxId ( taxIdFromURL );

}
