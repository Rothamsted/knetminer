
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
    //console.log("geneList_size= "+ geneList_size);

    // requestParams
    var requestParams = {};
    // setting the current Taxonomy ID
    var taxonomyID =  $('.navbar-select').children("option:selected").val(); 
    requestParams['taxId'] = taxonomyID; 
    requestParams['keyword'] = keyword;
    if (list.length > 0) {
        requestParams['list'] = list;
        requestParams['listMode'] = listMode;
    }

    // qtl regions provided
    var regions = document.getElementById('regions_table').rows.length - 2;
    var counter = 1;
    requestParams['qtl'] = [];

    for (i = 1; i <= regions; i++){
        var chr = $("#chr" + i + " option:selected").val();
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
    //console.log("api_url/request= "+ api_url + request);
    
    //console.log("knetSpaceHost: "+ knetspace_api_host);
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
        fetchData(requestParams,list,keyword,login_check_url,request,searchMode,geneList_size);
      }
}

//Function send form values to backend
function fetchData(requestParams,list,keyword,login_check_url,request,searchMode,geneList_size){
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
                $('#tabviewer').show(); // show Tab buttons and viewer
                // Show loading spinner on 'search' div
                activateSpinner("#search");
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
                        // Remove loading spinner from 'search' div
                        deactivateSpinner("#search");
                     })
                     .success(function(data){

                        var gviewer = data.gviewer
                        var querytime= performance.now() - this.startTime; // query response time
                        var queryseconds= querytime/1000;
                        queryseconds= queryseconds.toFixed(2); // rounded to 2 decimal places

                        $(".loadingDiv").replaceWith('<div class="loadingDiv"></div>');

                        genomicViewContent(data,keyword,geneList_size,searchMode,queryseconds,gviewer,list)
                     }

                     ).always(function(){
                        timeOutId =  setTimeout(getLongWaitMessage.init(),4000);
                     })
                     .complete(function(){
                        // Remove loading spinner from 'search' div
                        deactivateSpinner("#search");
                        $('.overlay').remove();
                        $('#tabviewer').show();
                        var timeOutId =  getLongWaitMessage.timeOutId(); 

                        // clear timeout from callstack
                        clearTimeout(timeOutId);
                     })
             }
             else {
                 $(".loadingDiv").replaceWith('<div class="loadingDiv"><b>The KnetMiner Free Plan is limited to '+freegenelist_limit+' genes. <a href="https://knetminer.com/pricing-plans" target="_blank">Upgrade to Pro plan</a> to search with unlimited genes</b></div>');
             }
        }
    });
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
             var longestChromosomeLength = "";
             if (typeof longest_chr != "undefined") {
                 if (longest_chr != null) {
                     longestChromosomeLength = "&longestChromosomeLength=" + longest_chr;
                 }
             }
             //Collapse Suggestor view
             $('#suggestor_search').attr('src', 'html/image/qs_expand.png');
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
         var candidateGenes = data.geneCount;
         var docSize = data.docSize; // for pGViewer_title_line display msg
         var totalDocSize = data.totalDocSize; // for pGViewer_title_line display msg
         var results = data.geneCount; // for pGViewer_title_line display msg

         var longestChromosomeLength = "";
         if (typeof longest_chr != "undefined") {
             if (longest_chr != null) {
                 longestChromosomeLength = "&longestChromosomeLength=" + longest_chr;
             }
         }

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
                messageNode = 'no linked genes were found. Showing keyword-centric results only. In total <b>' + results + ' unlinked genes were found. ('+queryseconds+' seconds).'
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
                 messsageNode = '<b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).'
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
         if (candidateGenes > 1000) { // for over 1000 results in any searchMode
             candidateGenes = 1000;
         }

         $("#pGSearch_title").show().html(genomicViewTitle);
         // Setup the mapview component
         var annotationsMap = data.gviewer;

         // create new basemap with bands for genes and pass it as well to the Map Viewer.
         multiSpeciesFeature.maps('drawRaw',annotationsMap);

         //Collapse Suggestor view
         $('#suggestor_search').attr('src', 'html/image/qs_expand.png');
         $('#suggestor_search_area').slideUp(500);


         createGenesTable(data.geneTable, keyword, candidateGenes);
         createEvidenceTable(data.evidenceTable, keyword);
         handleDelimintedCta.getData(data); 
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
 * Function
 *
 */
function findGenes(id, chr_name, start, end) {

    if (chr_name != "" && start != "" && end != "") {
        var searchMode = "countLoci";
        var taxonomyID =  $('.navbar-select').children("option:selected").val(); 
        var keyword = chr_name + "-" + start + "-" + end;
        var request = "/" + searchMode + "?keyword=" + keyword + "&taxId=" + taxonomyID;
        var url = api_url + request;
        $.get(url, '').done(function (data) {
            $("#" + id).val(data.geneCount);
        });
    }
}


/*
 * Function to get the number of matches
 *
 */
function matchCounter() {
    var keyword = $('#keywords').val();
    var taxonomyID =  $('.navbar-select').children("option:selected").val(); 

    $("#pGViewer_title").replaceWith('<div id="pGViewer_title"></div>'); // clear display msg
    if (keyword.length == 0) {
        $('#matchesResultDiv').html('Type a query to begin');
		// hide query suggestor icon
		$('#suggestor_search').css('display', 'none');
    } else {
        if ((keyword.length > 2) && ((keyword.split('"').length - 1) % 2 == 0) && bracketsAreBalanced(keyword) && (keyword.indexOf("()") < 0) && ((keyword.split('(').length) == (keyword.split(')').length)) && (keyword.charAt(keyword.length - 1) != ' ') && (keyword.charAt(keyword.length - 1) != '(') && (keyword.substr(keyword.length - 3) != 'AND') && (keyword.substr(keyword.length - 3) != 'NOT') && (keyword.substr(keyword.length - 2) != 'OR') && (keyword.substr(keyword.length - 2) != ' A') && (keyword.substr(keyword.length - 3) != ' AN') && (keyword.substr(keyword.length - 2) != ' O') && (keyword.substr(keyword.length - 2) != ' N') && (keyword.substr(keyword.length - 2) != ' NO')) {
            var searchMode = "countHits";
            var request = "/" + searchMode + "?keyword=" + keyword + "&taxId=" + taxonomyID;
            var url = api_url + request;

            $.get(url, '').done(function (data) {
                if (data.luceneLinkedCount != 0) {
                    $('#matchesResultDiv').html('<b>' + data.luceneLinkedCount + ' documents</b>  and <b>' + data.geneCount + ' genes</b> will be found with this query');
                    $('.keywordsSubmit').removeAttr("disabled");
					// show query suggestor icon
					$('#suggestor_search').css('display', 'inline-block');
                }
                else {
				  $('#matchesResultDiv').html('No documents or genes will be found with this query');
				  // hide query suggestor icon
				  $('#suggestor_search').css('display', 'none');
				}
            }).fail(function (xhr,status,errorlog) {
                errorComponent('#matchesResultDiv',xhr)
            });
        } else {
            $('#matchesResultDiv').html('');
        }
    }
}

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


// function to be triggered on changing the species dropdown option
function changeSpecies(selectElement){
    var selectedSpecie = $(selectElement).children("option:selected"),
    currentTaxData = multiSpeciesFeature.setTaxId(selectedSpecie.val());
    $('#speciename_container').empty();
    $('#chr1').empty();
    $('#tabviewer').hide(); 
    $('#pGSearch_title').hide(); 
    
    if(currentTaxData){
            var isChangeSuccessful  = multiSpeciesFeature.speciesEvents()
            if(isChangeSuccessful){
                setTimeout(function(){
                    findGenes('genes1', $('#chr1 option:selected').val(), $('#start1').val(), $('#end1').val())
                },100)
            }
    }
}

// function dynamically encodes Gene and evidence views delimited files to downloadable TSV files
handleDelimintedCta = function(){

    var evidenceData, resultViewData,currentData;  
    var utf8Bytes=''
    // gets gene  and evidence view data from genomicViewContent function (ln 155)
    function getData(data){
        resultViewData = data.geneTable; 
        evidenceData = data.evidenceTable
        setDemlimiterAttributes('resultsTable'); 
    }

    function getencodedFile (){
        
        utf8Bytes = encodeURIComponent(currentData).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    })
    }

    function setDemlimiterAttributes(position){
        currentData = position == 'resultsTable' ? resultViewData : evidenceData;
    $('.tabviewer-actions').toggle(position ==='resultsTable' || position === 'evidenceTable');
     getencodedFile(); 
    var TsvFileName = position == 'resultsTable' ? 'genes' : 'evidencetable'; 
    var delimiterAttr = 'data:application/octet-stream;base64,' + btoa(utf8Bytes)+''; 
    $('.delimited-cta').attr({
        'download': ''+TsvFileName+'.tsv',
        'href':delimiterAttr
    });
    }
    
    return {
        getData:getData,
        setData: setDemlimiterAttributes,
    }
}()


