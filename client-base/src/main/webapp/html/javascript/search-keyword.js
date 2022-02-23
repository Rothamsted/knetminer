/*
 * Function to search KnetMiner & update Map View, Gene View and Evidence View
 */
function searchKeyword() {
    //var searchMode = getRadioValue(document.gviewerForm.search_mode);
    var searchMode="genome"; // default

    /*var withoutKeywordMode = $('#without').prop('checked');
    if (withoutKeywordMode) {
        $('#keywords').val('');  // to make sure we don't accidentally include any
    }*/
    var listMode = 'GL'; // getRadioValue(document.gviewerForm.list_mode);

    // search keyword provided
    var keyword = trim($("#keywords").val());

    // gene list provided
    var list = $("#list_of_genes").val().split('\n');
    for (var i = 0; i < list.length; i++) { // remove empty lines
        if (!list[i].trim()) {
            list.splice(i, 1);
            i--;
        }
    }
    
    // remove spaces in each geneList entry
    list= list.map(s => s.trim());
    
    var geneList_size= list.length;
    //console.log("geneList_size= "+ geneList_size);

    // requestParams
    var requestParams = {};
    requestParams['keyword'] = keyword;
    if (list.length > 0) {
        requestParams['list'] = list;
        requestParams['listMode'] = listMode;
    }

    // qtl regions provided
    var regions = document.getElementById('regions_table').rows.length - 2;
    var counter = 1;
    requestParams['qtl'] = [];
    for (i = 1; i <= regions; i++) {
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
        var searchErrorTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">Sorry all inputs are empty.</span></div>'; 
        $("#pGViewer_title").replaceWith(searchErrorTitle);
        $('.pGViewer_title_line').css("color","red");
        $('#tabviewer').hide();
      }else if(keyword !== '' || list.length !== 0 || requestParams.qtl.length !== 0 ){
        fetchData(requestParams,list,keyword,login_check_url,request,searchMode,geneList_size);
      }
}

//Function to send form values to backend server inside the above Function SearchKeyword if input values are not empty,
function fetchData(requestParams,list,keyword,login_check_url,request,searchMode,geneList_size){
    $.ajax({
        type: 'GET', url: login_check_url, xhrFields: { withCredentials: true }, dataType: "json", 
        timeout: 1000000, cache: false,
        headers: { "Accept": "application/json; charset=utf-8", "Content-Type": "application/json; charset=utf-8" }, 
        success: function (data) {

            //if logged out, keep default restrictions.
            if((typeof data.id === "undefined") || (data.id === null)) {
               //$(".loadingDiv").replaceWith('<div class="loadingDiv"><b>The free KnetMiner is limited to '+freegenelist_limit+' genes. Upgrade to <a href="https://knetminer.com/pricing-plans" target="_blank">Pro</a> plan</b></div>');
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
                    //$(".loadingDiv").replaceWith('<div class="loadingDiv"><b>The free KnetMiner is limited to '+freegenelist_limit+' genes. Upgrade to <a href="https://knetminer.com/pricing-plans" target="_blank">Pro</a> plan</b></div>');
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
                         $("#pGViewer_title").replaceWith('<div id="pGViewer_title"></div>'); // clear display msg
                         var server_error= JSON.parse(xhr.responseText); // full error json from server
                         var errorMsg= "Search failed...\t"+ server_error.statusReasonPhrase +" ("+ server_error.type +"),\t"+ server_error.title +"\nPlease use valid keywords, gene IDs or QTLs.";
                         console.log(server_error.detail);
                         alert(errorMsg);
                                         // Remove loading spinner from 'search' div
                                         deactivateSpinner("#search");
                     })
                     .success(function (data) {
                        var gviewer = data.gviewer
                         var genomicViewTitle; 
                         var messageNode; 
                         var querytime= performance.now() - this.startTime; // query response time
                         var queryseconds= querytime/1000;
                         queryseconds= queryseconds.toFixed(2); // rounded to 2 decimal places

                         $(".loadingDiv").replaceWith('<div class="loadingDiv"></div>');

                                  // Remove loading spinner from 'search' div
                                  deactivateSpinner("#search");
                                  //console.log("search: success; remove spinner...");
                                  genomicViewContent(data,keyword,geneList_size,searchMode,queryseconds,gviewer)
                     });
             }
             else {
                 $(".loadingDiv").replaceWith('<div class="loadingDiv"><b>The KnetMiner Free Plan is limited to '+freegenelist_limit+' genes. <a href="https://knetminer.com/pricing-plans" target="_blank">Upgrade to Pro plan now</a> to search with unlimited genes</b></div>');
             }
        }
    });
 
}

// function runs inside fetch data to show client features like: numbers of linked/unlinked genes;
function genomicViewContent(data,keyword, geneList_size,searchMode,queryseconds,gviewer){

    if (data.geneCount === 0) { 

        //  uncommmeted as client error message that handles empty 
         // for failed search with no results.
        //  var messageNode='Sorry,no results were found. <br> '; 
        //  secondmessage ='<span>Make sure that all words are spelled correctly. Otherwise try a different or more general query.</span>'; 
        //  genomicViewTitle = createGenomicViewTitle(messageNode,secondmessage);

         if(keyword.length > 0) { // msg for keyword search error
            messageNode = keyword + 'did not match any genes or documents. Make sure that all words are spelled correctly. Try different or more general keywords.'; 
            genomicViewTitle = createGenomicViewTitle(messageNode);

            if(geneList_size > 0) {
                // msg for keyword + genelist search error
                messageNode = 'did not match any genes. Try different or more general keywords. Make sure that only one gene per line is entered. Try gene names (eg. TPS1)'
               genomicViewTitle = createGenomicViewTitle(messageNode);
              }
        }

         if(keyword.length < 2 && geneList_size > 0) {
              // msg for "gene list only" search error
            messageNode = 'did not match any genes. Make sure that only one gene per line is entered. Try gene names (eg. TPS1).';
            genomicViewTitle = CreateGenomicViewTitle(messageNode); 
        }

         if(searchMode === "qtl") { 
             // msg for QTL search error
             messageNode = 'did not match any genes. Make sure that only one gene per line is entered. Try gene names (eg. TPS1). Provide valid QTLs'; 
            genomicViewTitle = CreateGenomicViewTitle(messageNode);
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
         $("#pGViewer_title").replaceWith(genomicViewTitle);

         activateButton('resultsTable');
         document.getElementById('resultsTable').innerHTML = "";
         document.getElementById('evidenceTable').innerHTML = "";
         document.getElementById('NetworkCanvas').innerHTML = "";

     }else {
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
         var genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + results + ' genes</b> were found ('+queryseconds+' seconds).</span></div>'
         if(keyword.length > 0) { // msg for keyword search
            genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + results + ' genes</b> were found ('+queryseconds+' seconds).</span></div>';
            if(geneList_size > 0) { // msg for keyword + genelist search
               var count_linked= countLinkedUserGenes(data.geneTable);
               var count_unlinked = results - count_linked;
               var count_notfound = geneList_size - count_linked - count_unlinked;
               // for wildcard in genelist when all matches will be found
               if(results === (count_linked+count_unlinked)) { count_notfound=0; }
               if(count_notfound === 0) {
                  genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).</span></div>';
                 }
               else if(count_notfound > 0) {
                  genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).</span></div>';
               }
               // for rare edge cases when no genes in list are found in search, then search is keyword-centric only.
               if((count_linked === 0) && (count_unlinked > geneList_size) && (!list.toString().includes("*"))) {
                  genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">No user genes found. Showing keyword-centric results. In total <b>' + results + ' were found. ('+queryseconds+' seconds).</span></div>';
                 }
              }
           }
         if(keyword.length < 2 && geneList_size > 0) { // msg for "gene list only" search
            //genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + results + ' genes</b> were found ('+queryseconds+' seconds).</span></div>';
            var count_linked= countLinkedUserGenes(data.geneTable);
            var count_unlinked= results - count_linked;
            var count_notfound= geneList_size - count_linked - count_unlinked;
            // for wildcard in genelist when all matches will be found
            if(results === (count_linked+count_unlinked)) { count_notfound=0; }
            if(count_notfound === 0) {
               genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).</span></div>';
              }
            else if(count_notfound > 0) {
              genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).</span></div>';
             }
            // for rare edge cases when no genes in list are found in search, then search is empty.
            if((count_linked === 0) && (count_unlinked > geneList_size) && (!list.toString().includes("*"))) {
               genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">No user genes found. Please provide valid gene IDs to see results.</span></div>';
              }
           }
         if(searchMode === "qtl") { // msg for QTL search
            genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + results + ' genes</b> were found ('+queryseconds+' seconds).</span></div>'; // default
            var count_linked= countLinkedUserGenes(data.geneTable);
            var count_unlinked= results - count_linked;
            var count_notfound= geneList_size - count_linked - count_unlinked;
            // for wildcard in genelist when all matches will be found
            if(results === (count_linked+count_unlinked)) { count_notfound=0; }
            if(keyword.length < 2) {  // msg for qtl region only search
               if(count_notfound === 0) {
                  genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).</span></div>';
                 }
               else if(count_notfound > 0) {
                 genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).</span></div>';
                }
              }
            if(keyword.length > 2) {  // msg for qtl region + keyword search
               if(count_notfound === 0) {
                  genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).</span></div>';
                 }
               else if(count_notfound > 0) {
                 genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).</span></div>';
                }
              }
            if(geneList_size > 0) { // msg for qtl + genelist search
               if(count_notfound === 0) {
                  genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).</span></div>';
                 }
               else if(count_notfound > 0) {
                 genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).</span></div>';
                }
               // for rare edge cases when no genes in list are found in search, then search is QTL-centric only.
               if((count_linked === 0) && (count_unlinked > geneList_size) && (!list.toString().includes("*"))) {
                  genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">No user genes found. Shwoing keyword/QTL related results. In total <b>' + results + ' were found. ('+queryseconds+' seconds).</span></div>';
                 }
              }
           }
         if (candidateGenes > 1000) { // for over 1000 results in any searchMode
             candidateGenes = 1000;
             //genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + results + ' genes</b> were found. Top 1000 genes are displayed in Genomaps.js Map View ('+queryseconds+' seconds).</span></div>';
         }

         $("#pGViewer_title").replaceWith(genomicViewTitle);
         // Setup the mapview component
         var annotationsMap = data.gviewer;

         // create new basemap with bands for genes and pass it as well to the Map Viewer.
         genemap.drawFromRawAnnotationXML('#genemap', 'html/data/basemap.xml', annotationsMap);

         //Collapse Suggestor view
         $('#suggestor_search').attr('src', 'html/image/qs_expand.png');
         $('#suggestor_search_area').slideUp(500);
                             //$('#suggestor_search').dialog('close');


         activateButton('resultsTable');
         createGenesTable(data.geneTable, keyword, candidateGenes);
         createEvidenceTable(data.evidenceTable, keyword);
         // show linked/unlinked genes checkboxes only if a gene list was provided by the user
         if(geneList_size > 0) {
            $('#selectUser').show();
           }
           else { $('#selectUser').hide(); }
     }


}

// function creates Genomic title by using same html template for all messages
function createGenomicViewTitle(message){
    var genomicTemplate = `<div id="pGViewer_title"><$ class="pGViewer_title_line">Your search ${message}</span>
    </div> `; 
    return genomicTemplate; 
}