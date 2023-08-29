// Function sends a post request to genome Api endpoint and returns an object data
async function genomeApi (request, requestParams) 
{
    const startTime = performance.now(); 

    const genomeData =  await fetch(api_url + request, {
        method:'POST',
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(requestParams),
        timeout: 1000000,
      }).then(async (response) => {
        let data = await response.json(); 
        let querytime = performance.now() - startTime; 
        // query response time        

		// TODO: this is bad practice. Rounding should be a UI concern,
		// it should be done by a UI component or some other closely
		// related component. Values should not be rounded so early,
		// cause that's too messy and some other code might need their
		// original value.
		// Plus, this is a kindergarten way to do it, there are dedicated
		// rond() functions for that
		//
        let queryseconds = (querytime / 1000).toFixed(2);
        data["queryseconds"] = queryseconds; 
  
        return data; 
      })
      return genomeData
}


/*
 * Function to search KnetMiner & update Map View, Gene View and Evidence View
 */
async function searchKeyword() {
 
  //var searchMode = getRadioValue(document.gviewerForm.search_mode);
  var searchMode = "genome"; // default

  var listMode = 'GL'; // getRadioValue(document.gviewerForm.list_mode);

  // search keyword provided
  var keyword = trim($("#keywords").val());

  // gene list provided
  var list = $("#list_of_genes").val().split('\n');
  list = cleanGeneList(list)

  var geneList_size = list.length;

  // requestParams
  var requestParams = {};
  // setting the current Taxonomy ID
  var taxonomyID = $('.navbar-select').children("option:selected").val();
  requestParams['taxId'] = taxonomyID;
  requestParams['keyword'] = keyword;
  requestParams['isSortedEvidenceTable'] = true;

  if (list.length > 0) {
    requestParams['list'] = list;
    requestParams['listMode'] = listMode;
  }


  // qtl regions provided
  var regions = document.getElementById('regions_table').rows.length - 2;
  var counter = 1;
  requestParams['qtl'] = [];

  for (i = 1; i <= regions; i++) {
    var chr = $("#chr" + i).find(":selected").val();
    var start = trim($("#start" + i).val());
    var end = trim($("#end" + i).val());
    var label = trim($("#label" + i).val());

    if (chr.length > 0 && start.length > 0 && end.length > 0 && parseInt(start) < parseInt(end)) {
      requestParams['qtl'].push("&qtl" + counter + "=" + chr + ":" + start + ":" + end + ":" + label);
      counter++;
    }
  }

  // if a region is provided, set searchMode to "qtl" (to focus only on that region)
  if (counter > 1) { searchMode = "qtl"; }
  // if a gene list is provided, use "genome" searchMode
  if (geneList_size > 0) { searchMode = "genome"; }

  // api request
  var request = "/" + searchMode;

  // TODO: possibly related to #768
  //if(geneList_size > freegenelist_limit) {
  // check if user logged in and if yes, get user_id

  //if inputs are empty client get an error saying input is empty 
  //  else if inputs are not empty, function fecthData is called and it sends from data to backend server
  if (keyword == '' && list.length == 0 && requestParams.qtl.length == 0) {
    var searchErrorTitle = '<span class="pGViewer_title_line">Please input at least one search parameter.</span>';
    $("#pGViewer_title").html(searchErrorTitle);
    $('.pGViewer_title_line').css("color", "red");
    $('#tabviewer').hide();
  } else if (keyword !== '' || list.length !== 0 || requestParams.qtl.length !== 0) {
    // starts initialise and starts animation while waiting for response from API endpoint
    const searchButtonAnimation = new WaitPopUp('#searchBtn','#search','Searching'); 
    searchButtonAnimation.start(); 

    // clears data saved for genes and evidence views
    $('#evidenceTable').data({ keys: [] });
    $('#resultsTable').data({ keys: [] });

    // removes network tags 
    $("#NetworkCanvas_button").removeClass('network-created');
    $('#evidenceTable_button').removeClass('created');

    // calls GenomeAPI endpoint and when request resolves genomicViewContent function is called to show geneview table
   await genomeApi(request, requestParams).then((data)=> {
    genomicViewContent(data, keyword, geneList_size, searchMode, list)

    googleAnalytics.trackEvent(
      request, // It already has a leading '/'
      {
        // WARNING: keep these fields consistent with the API tracking in 
        // KnetminerServer.java
        'keywords': keyword,
        'genesListSize': geneList_size,
        'genesListMode': requestParams?.qtl?.listMode || "",
        'chrSize': requestParams?.qtl?.length || 0,
        'taxId': requestParams?.taxId || ""
      }
    )
    data.docSize == 0 ? $('#tabviewer').hide() : $('#tabviewer').show();
        
    }).finally(()=> {
      $('.overlay').remove();
      $('#searchBtn').html('<i class="fa fa-search" aria-hidden="true"></i> Search')
      document.getElementById('resultsTable_button').click();
      searchButtonAnimation.stop(); 
      document.getElementById('pGSearch_title').scrollIntoView();
    }).catch(err => console.log(err));
  }
}



/**
 * checks user login status and, in case of success, calls the API specified in searchMode and
 * requestParams. 
 * 
 * TODO: (when we have time, don't remove this commnt until completed, possubly move it to a GH issue)
 * This is a callback hell (google for it), checkUserPlan() receives
 * parameters it shouldn't deal with at all, just to pass them along. 
 * 
 * The modern, cleaner way to do the same is to use promises, althogh in this case, checkUserPlan()
 * needs to do some wrapping around the call back to be chained after success. So, it needs to become
 * like:
 * 
 * function checkUserPlan ( onComplete ) // pass the callback, not its details or parameters
 * {
 *   $.ajax({
 *     ...
 *     complete: function () {
 *       ... // the same current pre-processing
 *       onComplete() // in place of the current requestGenomeData()
 *       ... // the same current post-procesding
 *     }
 *   })
 * } 
 * 
 * // This would be the invocation in searchKeyword() above
 * // don't give the requestGenomeData() params to checkUserPlan(), it doesn't really need
 * // to know them.
 * checkUserPlan( () => requestGenomeData(...) ) 
 * 
 */
function setupGenesSearch() 
{   			
    userAccessMgr.setUserPlan(); 
    const geneListLimit = userAccessMgr.getGeneSearchLimit()
    $('genesCount').html(`0/${geneListLimit}`)	

    geneCounter()
}

// sends search queries as a POST request to genome API endpoint, called in checkUserPlan() above
// async function requestGenomeData(requestParams, keyword, request, searchMode, geneList_size, list) {  


  
//   $.post({

    


//   })
//     .fail(function (xhr, status, errorlog) {
//       $("#pGViewer_title").html(''); // clear display msg
//       var server_error = JSON.parse(xhr.responseText); // full error json from server
//       var errorMsg = "Search failed...\t" + server_error.statusReasonPhrase + " (" + server_error.type + "),\t" + server_error.title + "\nPlease use valid keywords, gene IDs or QTLs.";
//       console.log(server_error.detail);
//       alert(errorMsg);
//       $('.overlay').remove();
//     })
//     .success(function (data) {
//        // rounded to 2 decimal places
//       // $(".loadingDiv").replaceWith('<div class="loadingDiv"></div>');
  
//     }
//     ).complete(function () {
//       // Remove loading spinner from 'search' div
        
//     })
// }

// function runs inside fetch data to show client features like: numbers of linked/unlinked genes;
function genomicViewContent(data, keyword, geneList_size, searchMode,list) {
  let messageNode;
  let genomicViewTitle;
  let status;
  
  let { geneCount, geneTable, evidenceTable, gviewer, queryseconds } = data;

  if (geneCount == 0) {
    status = true;
    if (keyword.length > 0) { // msg for keyword search error
      messageNode = `<b>${keyword}</b> had no matches. Check for typos and try different or more general keywords.`;
      genomicViewTitle = createGenomicViewTitle(messageNode, status);

      if (geneList_size > 0) {
        // msg for keyword + genelist search error
        messageNode = 'had no matches. Try different or more general keywords. Make sure that only one gene per line is entered.'
        genomicViewTitle = createGenomicViewTitle(messageNode, status);
      }
    }

    if (keyword.length < 2 && geneList_size > 0) {
      // msg for "gene list only" search error
      messageNode = 'had no matches. Make sure that only one accession is entered per line. Try some Example Queries for formatting help.';
      genomicViewTitle = createGenomicViewTitle(messageNode, status);
    }

    if (searchMode === "qtl") {
      // msg for QTL search error
      messageNode = 'had no matches. Please check your search formatting and provide valid QTLs. Try some Example Queries for formatting help.';
      genomicViewTitle = createGenomicViewTitle(messageNode, status)
    }

    if (typeof gviewer != "undefined" && gviewer != false) {

      $('#suggestor_search_area').slideUp(500);
      //$('#suggestor_search').dialog('close');
    }

    $("#pGViewer_title").html(genomicViewTitle);
    $("#pGSearch_title").html('');
    $('#tabviewer').hide();
    //  activateButton('resultsTable');
    document.getElementById('resultsTable').innerHTML = "";
    document.getElementById('evidenceTable').innerHTML = "";
    document.getElementById('NetworkCanvas').innerHTML = "";

  }

  // TODO: There are repition of geneCount (formerly results) when rendering messageNodes for searches = 
  // Will be improved in coming days.
  status = false
  // default search display msg.
  messageNode = '<b>' + geneCount + ' genes</b> were found (' + queryseconds + ' seconds).'
  genomicViewTitle = createGenomicViewTitle(messageNode, status);

  if (keyword.length > 0) { // msg for keyword search
    messageNode = 'In total <b>' + geneCount + ' genes</b> were found (' + queryseconds + ' seconds).'
    genomicViewTitle = createGenomicViewTitle(messageNode, status)

    if (geneList_size > 0) { // msg for keyword + genelist search
      var count_linked = countLinkedUserGenes(geneTable);
      var count_unlinked = geneCount - count_linked;
      var count_notfound = geneList_size - count_linked - count_unlinked;
      // for wildcard in genelist when all matches will be found
      if (geneCount === (count_linked + count_unlinked)) { count_notfound = 0; }

      if (count_notfound === 0) {
        messageNode = '<b>' + count_linked + ' linked genes</b> and ' + count_unlinked + ' unlinked genes were found (' + queryseconds + ' seconds).'
        genomicViewTitle = createGenomicViewTitle(messageNode, status);
      } else if (count_notfound > 0) {
        messageNode = '<b>' + count_linked + ' linked genes</b> and ' + count_unlinked + ' unlinked genes were found. ' + count_notfound + ' user genes not found. (' + queryseconds + ' seconds).'
        genomicViewTitle = createGenomicViewTitle(messageNode, status);
      }
      // for rare edge cases when no genes in list are found in search, then search is keyword-centric only.
      if ((count_linked === 0) && (count_unlinked > geneList_size) && (!list.toString().includes("*"))) {
        messageNode = 'no linked genes were found. <span style="color: orange;">Showing keyword-centric results only.</span> In total <b>' + results + ' unlinked genes were found. (' + queryseconds + ' seconds).'

        genomicViewTitle = createGenomicViewTitle(messageNode, status)
      }
    }
  }

  if (keyword.length < 2 && geneList_size > 0) {
    var count_linked = countLinkedUserGenes(geneTable);
    var count_unlinked = geneCount - count_linked;
    var count_notfound = geneList_size - count_linked - count_unlinked;
    // for wildcard in genelist when all matches will be found
    if (geneCount === (count_linked + count_unlinked)) { count_notfound = 0; }
    if (count_notfound === 0) {
      messageNode = '<b>' + count_linked + ' linked genes</b> and ' + count_unlinked + ' unlinked genes were found (' + queryseconds + ' seconds).'
      genomicViewTitle = createGenomicViewTitle(messageNode, status)
    }
    else if (count_notfound > 0) {
      messageNode = '<b>' + count_linked + ' linked genes</b> and ' + count_unlinked + ' unlinked genes were found. ' + count_notfound + ' user genes not found. (' + queryseconds + ' seconds).'
      genomicViewTitle = createGenomicViewTitle(messageNode, status);
    }
    // for rare edge cases when no genes in list are found in search, then search is empty.
    if ((count_linked === 0) && (count_unlinked > geneList_size) && (!list.toString().includes("*"))) {
      var noGenesFound = '<span class="pGViewer_title_line">No user genes found. Please provide valid gene ID</span>';
      $('#pGViewer_title').html(noGenesFound);
    }
  }

  if (searchMode === "qtl") {
    // msg for QTL search
    messageNode = '<b>' + geneCount + ' genes</b> were found (' + queryseconds + ' seconds).'
    genomicViewTitle = createGenomicViewTitle(messageNode, status);
    var count_linked = countLinkedUserGenes(geneTable);
    var count_unlinked = geneCount - count_linked;
    var count_notfound = geneList_size - count_linked - count_unlinked;
    // for wildcard in genelist when all matches will be found
    if (geneCount === (count_linked + count_unlinked)) { count_notfound = 0; }

    if (keyword.length < 2) {  // msg for qtl region only search

      if (count_notfound === 0) {
        messageNode = '<b>' + count_linked + ' linked genes</b> and ' + count_unlinked + ' unlinked genes were found (' + queryseconds + ' seconds).'
        genomicViewTitle = createGenomicViewTitle(messageNode, status);
      }
      else if (count_notfound > 0) {
        messageNode = '<b>' + count_linked + ' linked genes</b> and ' + count_unlinked + ' unlinked genes were found. ' + count_notfound + ' user genes not found. (' + queryseconds + ' seconds).';
        genomicViewTitle = createGenomicViewTitle(messageNode, status);
      }
    }
    if (keyword.length > 2) {  // msg for qtl region + keyword search
      if (count_notfound === 0) {
        messageNode = '<b>' + count_linked + ' linked genes</b> and ' + count_unlinked + ' unlinked genes were found (' + queryseconds + ' seconds).'
        genomicViewTitle = createGenomicViewTitle(messageNode, status);
      }
      else if (count_notfound > 0) {
        messageNode = '<b>' + count_linked + ' linked genes</b> and ' + count_unlinked + ' unlinked genes were found. ' + count_notfound + ' user genes not found. (' + queryseconds + ' seconds).'
        genomicViewTitle = createGenomicViewTitle(messageNode, status);
      }
    }

    if (geneList_size > 0) { // msg for qtl + genelist search
      if (count_notfound === 0) {
        messageNode = '<b>' + count_linked + ' linked genes</b> and ' + count_unlinked + ' unlinked genes were found (' + queryseconds + ' seconds).'
        genomicViewTitle = createGenomicViewTitle(messageNode, status);
      }
      else if (count_notfound > 0) {
        messageNode = '<b>' + count_linked + ' linked genes</b> and ' + count_unlinked + ' unlinked genes were found. ' + count_notfound + ' user genes not found. (' + queryseconds + ' seconds).'
        genomicViewTitle = createGenomicViewTitle(messageNode, status);
      }
      // for rare edge cases when no genes in list are found in search, then search is QTL-centric only.
      if ((count_linked === 0) && (count_unlinked > geneList_size) && (!list.toString().includes("*"))) {
        genomicViewTitle = '<span class="pGViewer_title_line">No user genes found. Showing keyword/QTL related results. In total <b>' + geneCount + ' were found. (' + queryseconds + ' seconds).</span>';
      }
    }
  }

  $("#pGSearch_title").show().html(genomicViewTitle);

  //Collapse Suggestor view
  $('#suggestor_search_area').slideUp(500);
  //  activateButton('resultsTable')

  createGenesTable(geneTable, keyword);

  handleDelimintedCta.setApiData(data);

  knetWidgets.drawMap('drawRaw', data.gviewer);
  $("body").data("data", { evidenceTable: evidenceTable, keyword: keyword, resultsTable: geneTable });

  //  using css toggle 
  $('#selectUser').toggleClass('show', geneList_size > 0)

}

// function creates Genomic title
function createGenomicViewTitle(message, status) {
  var genomicTemplate = `<span class="pGViewer_title_line"> ${status ? 'Your search' : 'In total'} ${message}</span>`;
  return genomicTemplate;
}


/*
 * Function
 * Generates the number of user genes with evidence links in gene view .tab results
 * @author: Ajit Singh.
 */

function countLinkedUserGenes(geneViewData) {
  let linkedcount = 0;

  geneViewData.forEach((genes) => {
    const { isUserGene, conceptEvidences } = genes
    if (isUserGene && conceptEvidences) linkedcount += 1;

  })

  return linkedcount;
}


/*
 * Function to get the number of genes user inputs
 *
 */
function geneCounter() {

  var geneListValues = $("#list_of_genes").val().split('\n');
  var geneInput = $('#geneResultDiv');

  geneListValues = geneListValues.filter(gene => gene && gene.trim() != '')


  geneInput.html('<span>  <b>' + geneListValues.length + '</b>  Genes </span>')
  var listLength = geneListValues.length;

  var geneListCounter = new GenesListManager(listLength);
  geneListCounter.detectLimit();
}

/**
 * Function to get the number of matches in the keywords text box.
 *
 */
function matchCounter() {
  var keyword = $('#keywords').val();

  var isKeywordValidated;

  $("#pGViewer_title").replaceWith('<div id="pGViewer_title"></div>'); // clear display msg

  keyword.length ? isKeywordValidated = validateKeywords(keyword) : renderMatchCounterHtml('Type a query to begin.');

  if (isKeywordValidated) { countHitsApiCall(keyword) }

  if (isKeywordValidated == false) renderMatchCounterHtml('No documents or genes will be found with this query')


  // if ( keyword )
} // matchCounter()

// calls count hits REST endpoint
function countHitsApiCall(keyword) {
  var taxonomyID = $('.navbar-select').children("option:selected").val();
  var request = `/countHits?keyword=${keyword}&taxId=${taxonomyID}`;
  var url = api_url + request;

  $.get(url, '').done(function (data) {
    var documentLength = data.luceneLinkedCount;

    if (documentLength > 0) {
      $('#matchesResultDiv').html('<b>' + data.luceneLinkedCount + ' documents</b>  and <b>' + data.geneCount + ' genes</b> will be found with this query');
      $('.keywordsSubmit').removeAttr("disabled");
      // show query suggestor icon
      $(".concept-selector").css("pointer-events", "auto").attr('src', 'html/image/concept_active.png')
    }

    googleAnalytics.trackEvent(
      "/countHits",
      {
        'keywords': keyword,
        'taxId': taxonomyID
      })


  }) // done()
    .fail(function (xhr, status, errorlog) {
      var server_error = JSON.parse(xhr.responseText); // full error json from server
      var errorMsg = server_error.title.replace('(start >= end) ', '')
      renderMatchCounterHtml('No documents or genes will be found with this query')(`<span class="redText">${errorMsg}</span>`);
    });
}

// renders matchCounter HTML messages 
function renderMatchCounterHtml(counterMessage) {
  $('#matchesResultDiv').html(counterMessage);
  $(".concept-selector").css("pointer-events", "none").attr('src', 'html/image/concept.png');
  $("#suggestor_search_area").slideUp(500)
}

/*
 * Function to create,get and showcase gene name synonyms with a dropdown onclick event
 */
function createGeneNameSynonyms(element, data) {

  var geneNameSynonyms = $(element).next('.gene_name_synonyms');

  if (!geneNameSynonyms.hasClass("synonym_created")) {
    // First time, let's get the synonyms from the API and render them.
    // gene synonym body element houses synonym gene names span element
    var geneNameSynBody = document.createElement('div');
    $(geneNameSynBody).addClass('synonyms_body');
    // synonym are fetched one at a time, and kept in memory until the next search, reload or alike
    var synonymNameRequest = `/graphinfo/concept-info?filterAccessionsFromNames=true&ids=${data}`;
    var synonymNameUrl = api_url + synonymNameRequest
    $.get(synonymNameUrl, '').done(function (data) {
      var currentDataSet = data[0].names;
      for (var i = 0; i < currentDataSet.length; i++) {
        var SynonymsGene = document.createElement('span');
        $(SynonymsGene).addClass('synonyms_gene');
        SynonymsGene.textContent = currentDataSet[i].name;
        geneNameSynBody.append(SynonymsGene);
      }
    }).fail(function (xhr, status, errorlog) {
      errorComponent('.synonyms_body', xhr, status, errorlog);
    });

    geneNameSynonyms.addClass('synonym_created');
    geneNameSynonyms.append(geneNameSynBody);
    geneNameSynonyms.show();
  }
  else
    // If already created, just toggle visibility
    geneNameSynonyms.toggle();

  // Finally, show the right angle based on current visibility
  var newAngleClass = geneNameSynonyms.is(":visible") ? "fa-angle-up" : "fa-angle-down";
  $(element).find('[data-fa-i2svg]').toggleClass(newAngleClass);
}


// function create error message for failed get request for function matchCounter and createGeneSynonyms
function errorComponent(elementInfo, xhr) {
  var server_error = JSON.parse(xhr.responseText); // full error json from server
  var errorMsg = server_error.statusReasonPhrase + " (" + server_error.title + ")";
  $(elementInfo).html('<span class="redText">' + errorMsg + '</span>');
  console.log(server_error.detail); // detailed stacktrace
}



// function dynamically encodes Gene and evidence views delimited files to downloadable TSV files

/* TODO: not urgent, as usually, it requires separation between gene and evidence table, stop
   using this messed-up if/elseif approach.
   
   Also, its design is a bit of a convoluted mess.
   
   Namely, this could be re-factored like:

function setGenesTableDelimitedCta () // What is Cta?
{
  _setDelimitedCta ( 'resultsTable', data.geneTable )
}

function setEvidenceTableDelimitedCta () 
{
  _setDelimitedCta ( 'evidenceTable', data.evidenceTable )
}

function _setDelimitedCta ( tableId, tableData )
{
  let encodedStr = encodeData ( data )
  _setDemlimiterAttributes ( tableId, encodedStr )	
}

// Same, but without being in an object or class
function _setDemlimiterAttributes ( fileName, uft8String )
{
  ....
}

// Same, but without being in an object or class, without '_' prefix, cause it might 
// not be so local
// Rename it to something more meaningful, eg, csvEscape()
// Also, probably there is a more standar way, not this ad-hoc string mangling
function encodeData ( data )
{
	
}

*/
handleDelimintedCta = function () {

  var delimitedData = {}

  //  sets delimiter attributes for TSV and JSON data available to be downloaded in geneView
  function setGeneTable() {

    // geneview data without evidence column 
    setDemlimiterAttributes('genesNoEvidence.tsv', '.delimited-cta-noevidence')

    // // geneview data in JSON format
    setDemlimiterAttributes('genes.json', '.delimited-json');
  }

  // gets data using from delimited data Object using filename key. 
  function getData(fileName) {
    return delimitedData[fileName]
  }


  // sets delimiter attributes for evidenceView
  function setEvidenceTable() {

    // evidenceview data in TSV format 
    setDemlimiterAttributes('evidence.tsv', '.delimited-cta')

    // evidence data in JSON format 
    setDemlimiterAttributes('evidence.json', '.delimited-json');
  }

  // gets gene  and evidence view data from genomicViewContent function (ln 155)
  function setApiData(data) {

    // JSON data
    delimitedData.genesJson = data.geneTable;
    delimitedData.evidenceJson = data.evidenceTable;

    // TSV data 
    delimitedData.genesNoEvidenceTsv = geneTableToTsv(data.geneTable);
    delimitedData.evidenceTsv = evidenceTableToTsv(data.evidenceTable);

    setGeneTable();

  }

  // sets delimiter attributes for gene and evidence table
  function setDemlimiterAttributes(fileName, location) {
    $('.tabviewer-actions').show();
    $(location).attr('onclick', `downloadFile('${fileName}')`)
  }

  return {
    setApiData: setApiData,
    setGeneTable: setGeneTable,
    setEvidenceTable: setEvidenceTable,
    getData: getData
  }

}()

/**
 * External util function called on clicking delimiter data exporters
 * Use ends with instead
 */
function downloadFile(fileName){

  var spiltStr = fileName.split('.')

  var fileStr = spiltStr[0] + spiltStr[1].charAt(0).toUpperCase() + spiltStr[1].slice(1); 

  var fileType = handleDelimintedCta.getData(fileStr)

  if (fileName.endsWith('json')) {
    fileType = JSON.stringify(fileType, null, "\t")
  }

  // downloads files 
  triggerFileDownload(fileName, fileType)
}


/**
 * function creates evidenceView
 */
function createEvidenceView() {
  $('#evidenceTable_button').addClass('created');
  var data = $('body').data().data

  // Finally, render the table. 
  // Testing with doSortTable = false and sorting coming from the server
  createEvidenceTable(data.evidenceTable, false);
}



/**
 * @desc function validates search keywords and returns a boolean to confirm if check is valid or not. 
 * @returns 
 */
function validateKeywords(keyword) {
  return (keyword.length > 2)
    && ((keyword.split('"').length - 1) % 2 == 0)
    && bracketsAreBalanced(keyword)
    && (keyword.indexOf("()") < 0)
    && ((keyword.split('(').length) == (keyword.split(')').length))
    && (keyword.charAt(keyword.length - 1) != ' ')
    && checkSubStrings(keyword);
}

// util function check for the substring in keyword search terms
//
// TODO: Looks like you're reinventing the wheel: 
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
// 
// Probably you don't need this function of yours at all
// 
// Update: OK, the len has gone, yet this function doesn't seem needed, since it does the same as
// the existing endsWith() (see link above)

function checkSubStrings(searchKeyword) {
  var searchTerms = ['AND', 'OR', 'A', ' AN', 'NOT', ' O', ' N', 'NO'];

  searchTerms.map(searchTerm => {
    var isSearchTermKeyword = searchKeyword.endsWith(searchTerm);
    if (isSearchTermKeyword) return false
  })

  return true;

}



/**
 * Can be used with a jQuery table sorter element, to manually mark a column as sorted,
 * when the table was sorted from the outside and the table sorter component is invoked
 * without asking it for re-sorting.
 * 
 * Details: https://stackoverflow.com/questions/75778264/is-there-a-way-to-tell-jquery-tablesorter-that-the-table-is-already-sorted
 */
function setTableSorterHeaderTick(tableId, columnIndex, isAscending = true) {
  // When the col is already in ascending order, headerAsc is the down arrow, to tell you can
  // revert the order. This reproduces the same behaviour that the table sorter
  var sortingDirection = isAscending ? 'tablesorter-headerAsc' : 'tablesorter-headerDesc';
  $(`#${tableId} thead tr:nth-child(1) th:nth-child(${columnIndex})`).addClass(`${sortingDirection} tablesorter-headerSorted`);
}

// An helper class to manage GeneList Limit
class GenesListManager {

  // System defined geneslist limit, 20 for guest users, 100 for logged in users 
  // unlimited for pro users
  #listLimit = null

  // Geneslist input length
  #listLength = null;

  // System defined boolean value to check if genelist input limit is enforced
  #isLimitEnforced = null


  constructor(listLength) {
    this.#listLength = listLength;
    this.#listLimit = userAccessMgr.getGeneSearchLimit(); 
    this.#isLimitEnforced = userAccessMgr.isLimitEnforced();
  }


  // Detects geneslist limit by checking genelist inputs against system defined limit, while updating input progress bar.
  detectLimit() {
    this.#setLimitStatus()
    this.#updateProgressBar()
  }

  // Internal method creates progress bar to track user input against defined limit
  #updateProgressBar() {

    const progresUIContainer = document.querySelector('.progress-container');

    // removes progress bar if user is on unlimited plan
    // TODO: as other access control cases, this is bad, see #768
    // 
    if (!this.#isLimitEnforced) {
      progresUIContainer.style.display = 'none'
      return
    }

    const progressBar = progresUIContainer.firstElementChild
    const progressText = progresUIContainer.lastElementChild



    // convert list to percentage using the user limit
    const listInPercentage = this.#getListPercentage(this.#listLength);

    const progressColor = this.#listLength > this.#listLimit ? 'red' : `conic-gradient( #51CE7B ${listInPercentage * 3.6}deg, grey 0deg)`;
    progressBar.style.background = progressColor;
    progressText.innerHTML = `${this.#listLength}/${this.#listLimit}`;

  }

  // Internal util method that converts genelist input length to a percentage value
  // called in updateProgressBar()
  #getListPercentage() {
    return (this.#listLength / this.#listLimit) * 100;
  }

  // Method checks if genelist limit is reached and passes resulting boolean as a state value to toggle HTML Elements and to triggers type of message shown on UI.
  #setLimitStatus() {

    const isLimitReached = (this.#listLength <= this.#listLimit || !this.#isLimitEnforced )

    const searchButton = $('#searchBtn');

    $(".genecount-container").toggleClass('show', isLimitReached)
    $(".limit-message").toggleClass('show', !isLimitReached);
    $(".border").toggleClass('limit-border', !isLimitReached);
    $('.genesCount').toggleClass('genes-limit', !isLimitReached);

    // checks if restriction is already based on search button
    if(!searchButton.hasClass('button-disabled'))
    {
      searchButton.toggleClass('button-disabled', !isLimitReached);
    }

    if (!isLimitReached) this.#showStatusMessage(isLimitReached);

  }

  // Internal method to show messages and call to action depending on geneslist limit
  #showStatusMessage() {

    if (this.#listLimit == 20) {
      this.#setFreePlanMessage()
    } else {
      this.#setPaidPlanMessage()
    }

  }

  // Returns message shown to users who exceeds geneslist limit as guest users 
  #setFreePlanMessage() {
    this.#setLimitMessage('Please <a class="warning-link" onclick="loginModalInit()">Login/Register</a> to search with up to 100 genes.', ' Upgrade to remove limit.');
  }

  // Returns the message shown to users who exceeds genelist as free users
  #setPaidPlanMessage() {
    this.#setLimitMessage('You have exceeded your free user limit. Please', ' Upgrade',);
  }

  // Util method takes limit specific parameters that are shown on UI, when users reach geneslist Limit
  #setLimitMessage(message, actionText) {
    const limitCta = document.querySelector('.warning-link');
    limitCta.setAttribute('href', 'https://knetminer.com/pricing-plans')
    limitCta.innerHTML = actionText;
    $('.warning-text').html(message);
  }

}

/**
 * Converts genetable JSON format data to TSV format removing conceptEvidences and qtlEvidence properties.
 */
function geneTableToTsv(data) {
	

	const genesArrayExclEvidences = data.map ( geneTableRow => {
		const { conceptEvidences, qtlEvidences, ...filteredFields} = geneTableRow
		return filteredFields
	})

  const tsvFormat = formatJsonToTsv(genesArrayExclEvidences);
  return tsvFormat;
}

/**
 * Converts evidenceTable JSON format data to TSV format.
 */
function evidenceTableToTsv(data) {
  const tsvData = formatJsonToTsv(data)
  return tsvData;
}

/**
 * Helper function converst JSON format data to TSV format data.
 * called in geneTableTsv and evidenceTableToTsv above.
 */
function formatJsonToTsv(data) {

  // There some cases where evidenceTable is empty
  // checks if the first item of the data object is undefined or null,
  if (!data.length) return null
  const headers = Object.keys(data[0]).join('\t');

  const rows = data.map(obj => Object.values(obj).join('\t')).join('\n');
  return headers + '\n' + rows;

}

// function replace gene and evidence genome data ondexId key with nodeId 
function replaceOndexId(tableData) {

  const refinedTableData = tableData.map(({
    ondexId: nodeId,
    ...data
  }) => ({
    nodeId,
    ...data
  }))

  return refinedTableData
}


/* 
 * TODO: see init-utils.js 
 * Keep this test/provisional code ad the end of files.
 */
if (TEST_MODE) {
	
	/* TODO: remove, don't work anymore. Write tests that are compatible with the new JSON. */
  function testGeneTable2OldString() {
    let testTableJs = [
      {
        "accession": "ZM00001EB307230",
        "chromosome": "7",
        "conceptEvidences": {
          "Publication": {
            "conceptLabels": [
              "PMID:28121385"
            ],
            "reportedSize": 1
          }
        },
        "geneBeginBP": 50783674,
        "geneEndBP": 50785615,
        "isUserGene": true,
        "name": "RPS4",
        "ondexId": 6639989,
        "qtlEvidences": [],
        "score": 2.75531940846045,
        "taxID": "4577"
      },
      {
        "accession": "ZM00001EB307232",
        "chromosome": "6",
        "conceptEvidences": {
          "Publication": {
            "conceptLabels": [
              "PMID:28121387"
            ],
            "reportedSize": 1
          }
        },
        "geneBeginBP": 50783674,
        "geneEndBP": 50785620,
        "isUserGene": true,
        "name": "RPS4Foo",
        "ondexId": 6639990,
        "qtlEvidences": [
          { "regionLabel": "QTL1", "regionTrait": "The Foo QTL 1" },
          { "regionLabel": "QTL2", "regionTrait": "The Foo QTL 2" }
        ],
        "score": 3.1459,
        "taxID": "4577"
      }
    ] // testTableJs

    let table = geneTable2OldString(testTableJs)
    console.assert(table, "geneTable2OldString() didn't work!")

    // console.log ( "THE TABLE:", table )

    table = table.split("\n")

    console.assert(table.length == 4, "geneTable2OldString(), wrong result size!")
    console.assert(table[0].includes("ONDEX-ID\tACCESSION"), "geneTable2OldString() no headers!")
    console.assert(table[1].includes("6639989\tZM00001EB307230"), "geneTable2OldString() no 1st accession!")

    const row = table[2].split("\t")
    console.assert(row[row.length - 4] == 3.15, "geneTable2OldString() bad score!")

    qtlStr = row[row.length - 2]
    console.assert(
      qtlStr.includes("QTL1//The Foo QTL 1")
      && qtlStr.includes("QTL2//The Foo QTL 2")
      && qtlStr.includes("||")
      && !(qtlStr.startsWith("||") || qtlStr.endsWith("||"))
      , "geneTable2OldString() bad QTL!"
    )

  } // testGeneTable2OldString


  function testEvidenceTable2OldString() {
    testTableJs = [
      {
        "ondexId": 6649576,
        "conceptType": "Trait",
        "name": "seed weight",
        "score": 7.334310054779053,
        "pvalue": -1.0,
        "totalGenesSize": 1,
        "userGeneAccessions": [],
        "qtlsSize": 0,
        "userGenesSize": 0
      },
      {
        "ondexId": 6639684,
        "conceptType": "Path",
        "name": "Regulation of seed size",
        "score": 7.334310054779053,
        "pvalue": 0.01,
        "totalGenesSize": 2,
        "userGeneAccessions": ["FOO-1", "FOO-2"],
        "qtlsSize": 2,
        "userGenesSize": 3
      },
      {
        "ondexId": 6643264,
        "conceptType": "Trait",
        "name": "seed maturation",
        "score": 8.66998291015625,
        "pvalue": -1.0,
        "totalGenesSize": 3,
        "userGeneAccessions": [],
        "qtlsSize": 0,
        "userGenesSize": 0
      }
    ] // testTableJs

    table = evidenceTable2OldString(testTableJs)
    console.assert(table, "evidenceTable2OldString() didn't work!")

    console.log("THE EV TABLE:", table)

    table = table.split("\n")

    console.assert(table.length == 5, "evidenceTable2OldString(), wrong result size!")
    console.assert(table[0].includes("TYPE\tNAME\tSCORE\tP-VALUE"), "evidenceTable2OldString() no headers!")
    console.assert(table[1].includes("Trait\tseed weight"), "evidenceTable2OldString() 1st row is wrong!")

    const row = table[2].split("\t")
    console.log("THE EV ROW:", row)

    console.assert(row[row.length - 2] == 6639684, "evidenceTable2OldString() bad ondexId!")

    let score = row[2]
    console.assert(score > 7.32 && score < 7.34, "evidenceTable2OldString() bad score!")

    let pvalue = row[3]
    console.assert(pvalue == 0.01, "evidenceTable2OldString() bad pvalue!")

    let userGenes = row[5].split(",")
    console.assert(userGenes && userGenes.length == 2, "evidenceTable2OldString() bad user genes")
    console.assert(
      userGenes.includes('FOO-1') && userGenes.includes('FOO-2'),
      "evidenceTable2OldString() bad user genes"
    )
  } // testEvidenceTable2OldString

  testGeneTable2OldString()
  testEvidenceTable2OldString()

} // if TEST_MODE
