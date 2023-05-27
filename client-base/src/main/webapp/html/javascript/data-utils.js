/*
 * Function to search KnetMiner & update Map View, Gene View and Evidence View
 */
function searchKeyword(){
    //var searchMode = getRadioValue(document.gviewerForm.search_mode);
    var searchMode="genome"; // default

    var listMode = 'GL'; // getRadioValue(document.gviewerForm.list_mode);

    // search keyword provided
    var keyword = trim($("#keywords").val());

    // gene list provided
    var list = $("#list_of_genes").val().split('\n');
    list = cleanGeneList ( list )
    
    var geneList_size= list.length;

    // requestParams
    var requestParams = {};
    // setting the current Taxonomy ID
    var taxonomyID =  $('.navbar-select').children("option:selected").val(); 
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

    for (i = 1; i <= regions; i++){
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
    if(counter > 1) { searchMode="qtl"; }
    // if a gene list is provided, use "genome" searchMode
    if(geneList_size > 0) { searchMode="genome"; }
    
    // api request
    var request = "/" + searchMode;
    var login_check_url= knetspace_api_host + "/api/v1/me";

    //if(geneList_size > freegenelist_limit) {
      // check if user logged in and if yes, get user_id

     //if inputs are empty client get an error saying input is empty 
    //  else if inputs are not empty, function fecthData is called and it sends from data to backend server
      if(keyword == '' && list.length == 0 && requestParams.qtl.length == 0 ){
        var searchErrorTitle = '<span class="pGViewer_title_line">Please input at least one search parameter.</span>'; 
        $("#pGViewer_title").html(searchErrorTitle);
        $('.pGViewer_title_line').css("color","red");
        $('#tabviewer').hide();
      }else if(keyword !== '' || list.length !== 0 || requestParams.qtl.length !== 0 ){
        $('#evidenceTable').data({keys:[]}); 
        $('#resultsTable').data({keys:[]}); 
        $("#NetworkCanvas_button").removeClass('network-created');
        $('#evidenceTable_button').removeClass('created');

        checkUserPlan(requestParams,list,keyword,login_check_url,request,searchMode,geneList_size)
      }
}

/**
 * checks user login status and, in case of success, calls the API specified in searchMode and
 * requestParams. 
 * 
 * TODO: (when we have time) this is a callback hell (google for it), checkUserPlan() receives
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
function checkUserPlan(requestParams,list,keyword,login_check_url,request,searchMode,geneList_size){
    $.ajax({
        type: 'GET', url: login_check_url, xhrFields: { withCredentials: true }, dataType: "json", 
        timeout: 1000000, cache: false,
        headers: { "Accept": "application/json; charset=utf-8", "Content-Type": "application/json; charset=utf-8" }, 
        success: function (data) {
            //if logged out, keep default restrictions.
            if((typeof data.id === "undefined") || (data.id === null)) {
               enforce_genelist_limit= true; // back to default
               knetview_limit= 10; // back to default
              }
            else { // check logged in (valid) user's plan
                console.log("knetspace user_id= "+ data.id +", plan= "+ data.plan.name);
                if(data.plan.name === "Pro") {
                    enforce_genelist_limit= false; // let user search with unlimited genelist
                    knetview_limit= 200; // let user select upto 200 IDs to visualize knetwork
                   }
                else if(data.plan.name === "Free") {
                    enforce_genelist_limit= true; // back to default
                    knetview_limit= 10; // back to default
                   }
            }
        },
        complete: function () {

            if (list.length <= freegenelist_limit || enforce_genelist_limit === false) {
                requestGenomeData(requestParams,keyword,request,searchMode,geneList_size,list)
                getLongWaitMessage.init()
             }
             else {
                 $(".loadingDiv").replaceWith('<div class="loadingDiv"><b>The KnetMiner Free Plan is limited to '+freegenelist_limit+' genes. <a href="https://knetminer.com/pricing-plans" target="_blank">Upgrade to Pro plan</a> to search with unlimited genes</b></div>');
             }
        }
    });
}

// sends search queries as a POST request to genome API endpoint, called in checkUserPlan() above
function requestGenomeData(requestParams,keyword,request,searchMode,geneList_size,list){
    var firstTimeout; 
    $.post({
        url: api_url + request,
        timeout: 1000000,
        startTime: performance.now(),
        headers: {
            "Accept": "application/json; charset=utf-8",
            "Content-Type": "application/json; charset=utf-8"
        },
        datatype: "json",
        data: JSON.stringify(requestParams)
        })
        .fail(function (xhr,status,errorlog) {
            $("#pGViewer_title").html(''); // clear display msg
            var server_error= JSON.parse(xhr.responseText); // full error json from server
            var errorMsg= "Search failed...\t"+ server_error.statusReasonPhrase +" ("+ server_error.type +"),\t"+ server_error.title +"\nPlease use valid keywords, gene IDs or QTLs.";
            console.log(server_error.detail);
            alert(errorMsg);
            $('.overlay').remove();
        })
        .success( function(data){
           var gviewer = data.gviewer
           var querytime= performance.now() - this.startTime; // query response time
           var queryseconds= querytime/1000;
           queryseconds= queryseconds.toFixed(2); // rounded to 2 decimal places
           // $(".loadingDiv").replaceWith('<div class="loadingDiv"></div>');
           genomicViewContent(data,keyword,geneList_size,searchMode,queryseconds,gviewer,list)
           
           googleAnalytics.trackEvent (
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
       }
       ).complete(function(){
           // Remove loading spinner from 'search' div
           $('.overlay').remove();
           $('#searchBtn').html('<i class="fa fa-search" aria-hidden="true"></i> Search')
           document.getElementById('resultsTable_button').click(); 
           var secondTimeOut =  getLongWaitMessage.timeOutId();

           // clear timeout from callstack
           clearTimeout(firstTimeout);
           clearTimeout(secondTimeOut);
           document.getElementById('pGSearch_title').scrollIntoView();
        })
}

// function runs inside fetch data to show client features like: numbers of linked/unlinked genes;
function genomicViewContent(data,keyword, geneList_size,searchMode,queryseconds,gviewer,list){
     let messageNode;
     let genomicViewTitle; 
     let status; 

    if (data.geneCount === 0) { 
          status = true; 
         if(keyword.length > 0) { // msg for keyword search error
            messageNode =`<b>${keyword}</b> did not match any genes or documents. Check for typos and try different or more general keywords.`; 
            genomicViewTitle = createGenomicViewTitle(messageNode,status);
           
            if(geneList_size > 0) {
                // msg for keyword + genelist search error
                messageNode = 'did not match any genes. Try different or more general keywords. Make sure that only one gene per line is entered. Try gene names (eg. TPS1)'
               genomicViewTitle = createGenomicViewTitle(messageNode,status);
              }
          }

         if(keyword.length < 2 && geneList_size > 0) {
              // msg for "gene list only" search error
            messageNode = 'did not match any genes. Make sure that only one gene per line is entered. Try gene names (eg. TPS1).';
            genomicViewTitle = createGenomicViewTitle(messageNode,status); 
        }

         if(searchMode === "qtl") { 
             // msg for QTL search error
             messageNode = 'did not match any genes. Make sure that only one gene per line is entered. Try gene names (eg. TPS1). Provide valid QTLs'; 
            genomicViewTitle = createGenomicViewTitle(messageNode,status)
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
    else {
       status = false
         // For a valid response, i.e., search output.
         var results = data.geneCount; // for pGViewer_title_line display msg


         // default search display msg.
            messageNode = '<b>' + results + ' genes</b> were found ('+queryseconds+' seconds).'
          genomicViewTitle = createGenomicViewTitle(messageNode,status);

         if(keyword.length > 0) { // msg for keyword search
            messageNode= 'In total <b>' + results + ' genes</b> were found ('+queryseconds+' seconds).'
            genomicViewTitle = createGenomicViewTitle(messageNode,status)

            if(geneList_size > 0) { // msg for keyword + genelist search
                var count_linked= countLinkedUserGenes(data.geneTable);
                var count_unlinked = results - count_linked;
                var count_notfound = geneList_size - count_linked - count_unlinked;
            // for wildcard in genelist when all matches will be found
                if(results === (count_linked+count_unlinked)) { count_notfound=0; }

                if(count_notfound === 0) {
                    messageNode ='<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).' 
                    genomicViewTitle = createGenomicViewTitle(messageNode,status); 
                }else if(count_notfound > 0) {
                messageNode= '<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).'
                    genomicViewTitle = createGenomicViewTitle(messageNode,status);
                }
            // for rare edge cases when no genes in list are found in search, then search is keyword-centric only.
            if((count_linked === 0) && (count_unlinked > geneList_size) && (!list.toString().includes("*"))) {
                messageNode = 'no linked genes were found. <span style="color: orange;">Showing keyword-centric results only.</span> In total <b>' + results + ' unlinked genes were found. ('+queryseconds+' seconds).'

                genomicViewTitle = createGenomicViewTitle(messageNode,status)
                 }
              }
            }

         if(keyword.length < 2 && geneList_size > 0) { 
            var count_linked= countLinkedUserGenes(data.geneTable);
            var count_unlinked= results - count_linked;
            var count_notfound= geneList_size - count_linked - count_unlinked;
            // for wildcard in genelist when all matches will be found
            if(results === (count_linked+count_unlinked)) { count_notfound=0; }
            if(count_notfound === 0) {
              messageNode = '<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).'
              genomicViewTitle = createGenomicViewTitle(messageNode,status)
              }
            else if(count_notfound > 0) {
              messageNode = '<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).'
              genomicViewTitle = createGenomicViewTitle(messageNode,status); 
             }
            // for rare edge cases when no genes in list are found in search, then search is empty.
            if((count_linked === 0) && (count_unlinked > geneList_size) && (!list.toString().includes("*"))) {
               var noGenesFound = '<span class="pGViewer_title_line">No user genes found. Please provide valid gene ID</span>';
                $('#pGViewer_title').html(noGenesFound);
              }
        }
         if(searchMode === "qtl") { 
             // msg for QTL search
            messageNode = '<b>' + results + ' genes</b> were found ('+queryseconds+' seconds).'
            genomicViewTitle = createGenomicViewTitle(messageNode,status); 
            var count_linked= countLinkedUserGenes(data.geneTable);
            var count_unlinked= results - count_linked;
            var count_notfound= geneList_size - count_linked - count_unlinked;
            // for wildcard in genelist when all matches will be found
            if(results === (count_linked+count_unlinked)) { count_notfound=0; }
            if(keyword.length < 2) {  // msg for qtl region only search

               if(count_notfound === 0) {
                 messageNode = '<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).'
                  genomicViewTitle = createGenomicViewTitle(messageNode,status); 
                 }
               else if(count_notfound > 0) {
                messageNode = '<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).';
                genomicViewTitle = createGenomicViewTitle(messageNode,status); 
                }
              }
            if(keyword.length > 2) {  // msg for qtl region + keyword search
               if(count_notfound === 0) {
                 messageNode = '<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).'
                 genomicViewTitle = createGenomicViewTitle(messageNode,status); 
                 }
               else if(count_notfound > 0) {
                 messageNode = '<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).'
                 genomicViewTitle = createGenomicViewTitle(messageNode,status); 
                }
              }
            if(geneList_size > 0) { // msg for qtl + genelist search
               if(count_notfound === 0) {
                 messageNode = '<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).'
                  genomicViewTitle = createGenomicViewTitle(messageNode,status); 
                 }
               else if(count_notfound > 0) {
                 messageNode= '<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).'
                 genomicViewTitle = createGenomicViewTitle(messageNode,status);
                }
               // for rare edge cases when no genes in list are found in search, then search is QTL-centric only.
               if((count_linked === 0) && (count_unlinked > geneList_size) && (!list.toString().includes("*"))) {
                  genomicViewTitle = '<span class="pGViewer_title_line">No user genes found. Showing keyword/QTL related results. In total <b>' + results + ' were found. ('+queryseconds+' seconds).</span>';
                 }
              }
           }

         $("#pGSearch_title").show().html(genomicViewTitle);

         //Collapse Suggestor view
         $('#suggestor_search_area').slideUp(500);
        //  activateButton('resultsTable')

        var resultsTable = postProcessTableData ( data.geneTable );
        var evidenceTable = postProcessTableData ( data.evidenceTable );

         createGenesTable(resultsTable,keyword);
         handleDelimintedCta.getData(data);

         knetWidgets.drawMap('drawRaw',data.gviewer);
         $("body").data("data",{evidenceTable:evidenceTable,keyword:keyword,resultsTable:resultsTable});

         if(geneList_size > 0) {
            $('#selectUser').show();
           }
           else { $('#selectUser').hide(); }
    }
}

// function creates Genomic title
function createGenomicViewTitle(message,status){
    var genomicTemplate = `<span class="pGViewer_title_line"> ${status ? 'Your search': 'In total'} ${message}</span>`; 
    return genomicTemplate; 
}


/*
 * Function
 * Generates the number of user genes with evidence links in gene view .tab results
 * @author: Ajit Singh.
 */

function countLinkedUserGenes(gv_table) {
  var geneview_table = gv_table.split("\n");
  var numResults= geneview_table.length - 2;
  var linkedcount=0;
  for(var i = 1; i <= numResults; i++) {
      var values = geneview_table[i].split("\t");
      if (values[7] === "yes") {
          if (values[9].length > 0) { // counting known targets, i.e., user=yes and evidence present
              linkedcount= linkedcount + 1;
             }
          }
      }
    return linkedcount;
}


/*
 * Function to get the number of genes user inputs
 *
 */
function geneCounter(){
    var geneListValue = $("#list_of_genes").val().split('\n');
    var geneInput = $('#geneResultDiv');
    var notemptygenes = []; 

    if(geneListValue[0] === ''){
        geneInput.hide()
    }else{
        for(var i =0; i < geneListValue.length; i++ ){
            if(geneListValue[i] !==  ''){
                notemptygenes.push(geneListValue[i]); 
                geneInput.show()
                geneInput.html('<span>  <b>'+ notemptygenes.length +'</b>  inputed genes </span>')
            }
        }
       
    }

}

/*
 * Finds genes present in a chromosome region,
 * using the corresponding API.
 *
 */
function findChromosomeGenes(event) {
        var currentRowNumber = getChromosomeRegionIndex(event.currentTarget);
        var chromosome = $('#chr' + currentRowNumber).find(':selected').val();
        var start = $('#start' + currentRowNumber).val()
        var end = $('#end' + currentRowNumber).val()
        var genes = 'genes' + currentRowNumber
    
        if (chromosome != "" && start != "" && end != "") {
            var taxonomyID =  $('.navbar-select').children("option:selected").val(); 
            var keyword = chromosome + "-" + start + "-" + end;
            var request = '/countLoci?keyword='+keyword+'&taxId='+taxonomyID;
            var url = api_url + request;
            $.get(url, '').done(function (data) {
                $("#" + genes).val(data.geneCount);
            });
        } 
}

/*
 * Function to get the number of matches in the keywords text box.
 *
 */

function matchCounter() 
{
  var keyword = $('#keywords').val();
  var taxonomyID =  $('.navbar-select').children("option:selected").val();
  $("#pGViewer_title").replaceWith('<div id="pGViewer_title"></div>'); // clear display msg
  if (keyword == '')
  {
    $('#matchesResultDiv').html('Type a query to begin');

    $("#suggestor_search_area").slideUp(500)
    // hide query suggestor icon
    $(".concept-selector").css("pointer-events","none").attr('src', 'html/image/concept.png')
  } 
  else
  {
    var isKeywordValidated = validateKeywords(keyword);
    if (isKeywordValidated)
    {
      var request = `/countHits?keyword=${keyword}&taxId=${taxonomyID}`;

      var url = api_url + request;
      $.get(url, '').done(function (data)
      {
        if (data.luceneLinkedCount != 0) 
        {
          $('#matchesResultDiv').html('<b>' + data.luceneLinkedCount + ' documents</b>  and <b>' + data.geneCount + ' genes</b> will be found with this query');
          $('.keywordsSubmit').removeAttr("disabled");
          // show query suggestor icon
          $(".concept-selector").css("pointer-events","auto").attr('src', 'html/image/concept_active.png')
        }
        else
        {
          $('#matchesResultDiv').html('No documents or genes will be found with this query');
          // hide query suggestor icon 
          $(".concept-selector").css("pointer-events","none").attr('src', 'html/image/concept.png')
          $("#suggestor_search_area").slideUp(500)
        }
                
        googleAnalytics.trackEvent (
          "/countHits", 
          {
            'keywords': keyword,
            'taxId': taxonomyID
        })
                
        
      }) // done()
      .fail(function (xhr,status,errorlog)
      {
        var server_error= JSON.parse(xhr.responseText); // full error json from server
        var errorMsg= server_error.title.replace('(start >= end) ', '')
        $('#matchesResultDiv').html(`<span class="redText">${errorMsg}</span>`);
      });
    } // if keywordValidated 
    else 
    {
      $('#matchesResultDiv').html('');
      $(".concept-selector").css("pointer-events","none").attr('src', 'html/image/concept.png')
    } // else keywordValidated 
  } // if ( keyword )
} // matchCounter()

/*
 * Function to create,get and showcase gene name synonyms with a dropdown onclick event
 * 
 */
function createGeneNameSynonyms(element,data){

	var geneNameSynonyms = $(element).next('.gene_name_synonyms');
 
	if(!geneNameSynonyms.hasClass("synonym_created"))
	{
		// First time, let's get the synonyms from the API and render them.
		// gene synonym body element houses synonym gene names span element
	  var geneNameSynBody = document.createElement('div');
	  $(geneNameSynBody).addClass('synonyms_body'); 
	  // synonym are fetched one at a time, and kept in memory until the next search, reload or alike
	  var synonymNameRequest = `/graphinfo/concept-info?filterAccessionsFromNames=true&ids=${data}`;
	  var synonymNameUrl = api_url + synonymNameRequest
	  $.get(synonymNameUrl,'').done( function(data)
		{ 
	    var currentDataSet = data[0].names; 
	    for (var i=0; i < currentDataSet.length; i++)
			{
	        var SynonymsGene = document.createElement('span'); 
	        $(SynonymsGene).addClass('synonyms_gene');
	        SynonymsGene.textContent = currentDataSet[i].name;
	        geneNameSynBody.append(SynonymsGene); 
	    }
	  }).fail(function (xhr,status,errorlog) {
	      errorComponent('.synonyms_body',xhr,status,errorlog);
	  });
	
	  geneNameSynonyms.addClass('synonym_created'); 
	  geneNameSynonyms.append(geneNameSynBody);
	  geneNameSynonyms.show();
	}
	else	
		// If already created, just toggle visibility
		geneNameSynonyms.toggle ();

	// Finally, show the right angle based on current visibility
	var newAngleClass = geneNameSynonyms.is( ":visible" ) ? "fa-angle-up" : "fa-angle-down";
	$(element).find( '[data-fa-i2svg]' ).toggleClass ( newAngleClass );
}
 

// function create error message for failed get request for function matchCounter and createGeneSynonyms
function errorComponent(elementInfo,xhr){
    var server_error= JSON.parse(xhr.responseText); // full error json from server
    var errorMsg= server_error.statusReasonPhrase +" ("+ server_error.title +")";
    $(elementInfo).html('<span class="redText">'+errorMsg+'</span>');
    console.log(server_error.detail); // detailed stacktrace
}



// function dynamically encodes Gene and evidence views delimited files to downloadable TSV files
// TODO: not urgent, as usually, it requires separation between gene and evidence table, stop
// using this messed-up if/elseif approach.
//
handleDelimintedCta = function(){

    var evidenceData, resultViewData ;

    //  sets delimiter attributes for geneView
    function setGeneTable(){
        var encodedString = encodeData(resultViewData);
        setDemlimiterAttributes('resultsTable',encodedString)
    }

    // sets delimiter attributes for evidenceView
    function setEvidenceTable(){
        var encodedString = encodeData(evidenceData);
        setDemlimiterAttributes('evidenceTable',encodedString)
    }

    // gets gene  and evidence view data from genomicViewContent function (ln 155)
    function getData(data){
        resultViewData = data.geneTable; 
        evidenceData = data.evidenceTable
        setGeneTable()

    }
    // encodes gene and evidence table data to TSV format
    function encodeData(data){
        return encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1))
    }
    // sets delimiter attributes for gene and evidence table
    function setDemlimiterAttributes(fileName,uft8String){
        $('.tabviewer-actions').show(); 
        var delimiterAttr = 'data:application/octet-stream;base64,' + btoa(uft8String)+''; 
        $('.delimited-cta').attr({
            'download': ''+ fileName +'.tsv',
            'href':delimiterAttr
        });
    }
    
    return {
        getData:getData,
        setGeneTable: setGeneTable,
        setEvidenceTable:setEvidenceTable
    }
}()


/**
 * function creates evidenceView
 */
function createEvidenceView()
{
    $('#evidenceTable_button').addClass('created');
    var data = $('body').data().data

    // removes loading spinner
    $('.overlay').remove();
    
			
    // Finally, render the table. 
    // Testing with doSortTable = false and sorting coming from the server
    createEvidenceTable ( data.evidenceTable,false);
}


/**
 * @desc Post-process the genes/evidence table data string that comes from the API, doing things
 * like string-to-array conversion, removing unused headers, and alike.
 */
function postProcessTableData ( data )
{
	// The format is a TSV string
  var tableData = data.split('\n'); 
  tableData.pop(); // Last one is always an empty trailer
  tableData.shift(); // First one is about headers and we don't use them (unfortunately)

  tableData = tableData?.map ( rowStr => rowStr.split ( "\t" ) ); 

  return tableData;
}


/**
 * @desc function validates search keywords and returns a boolean to confirm if check is valid or not. 
 * @returns 
 */
function validateKeywords(keyword)
{
 return (keyword.length > 2) 
   && ((keyword.split('"').length - 1) % 2 == 0) 
   && bracketsAreBalanced(keyword) 
   && (keyword.indexOf("()") < 0) 
   && ((keyword.split('(').length) == (keyword.split(')').length)) 
   && (keyword.charAt(keyword.length - 1) != ' ' ) 
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

function checkSubStrings(searchKeyword){
    var searchTerms = ['AND', 'OR', 'A',' AN','NOT', ' O', ' N','NO']; 

    searchTerms.map(searchTerm => {
        var isSearchTermKeyword = searchKeyword.endsWith(searchTerm);
        if(isSearchTermKeyword) return false
    })

    return true;
    
}

// object literal manages caching for API request
// currently only works for GET calls in (openGeneListPopup() in evidence-table.js)
/** 
 * TODO:
 * - This name is misleading. This is not to cache any object, but to cache web requests/data only,
 *   based on browser facilities. Choose a better name, eg, webCacheWrapper.
 * 
 * - (not urgent). Having it as a singleton is dirty, cause it doesn't allow fo reusing the same 
 *   code for multiple caches, should the need arise (of which I'm not sure, but still...). A better
 *   approach would be that the methods before are class methods (eg, WebCacheManager) and 
 *   this variable here is an instance of it. WebCacheManager would be initialised with the
 *   cache name, eg, const cacheManager = new WebCacheManager ( "my-cache" )
 * 
 * - (not urgent, can remain like this) This design is named cache-aside, see 
 *   https://hazelcast.com/blog/a-hitchhikers-guide-to-caching-patterns/
 *   I'm not a great fan of it, the read-through approach (see the same link) is usually cleaner when 
 *   used with functional programming (to set the function that fetch new cache entries).
 * 
 *   In this case, it seems that the cache fetch/update handler would vary too much, so it might be
 *   difficult to define a new entry handler.  Maybe, a mix between the two approaches would 
 *   be an improvement:
 *    
 *   // invocation, more readable than data = cache.get(), if ( data ) else ()
 *   let data = cacheMgr.get ( request, r => await $.get (...) )
 *   ...
 *   
 *   get() would be in place of getCachedData() and would be like (in pseudo-code):
 * 
 *   // implementation
 *   function cacheManager.get ( request, newEntryFetcher )
 *   {
 *     if request is already cached => return cached value
 *     value = newEntryFetcher ( request )
 *     save value in the cache
 *     return value
 *   }
 */
const cacheManager = function(){

    // function checks request url to determine if it's cached from previous API call.
    async function getCachedData(request){

        // checks if request url is available in browser API
        var response = await caches.match(request); 

        // Request url is not cached
        // TODO: meh! the invoker is expecting a cache object and you're returning a boolean
        // see if null works better. 
        if(!response) return false

        // if request is cached, cached data is returned
        var data = await response.json(); 
        return data;
    }

    // function puts cached data in browser API
    function cacheRequest(url,data){
        caches.open('my-cache').then((cache) => {
            // We need to clone the request since a request can only be used once
            cache.put(url, new Response(JSON.stringify(data), {
                headers: {'Content-Type': 'application/json'}
            }));

        });
    }

    return {
        getCachedData:getCachedData,
        cacheRequest:cacheRequest
    }
}()
