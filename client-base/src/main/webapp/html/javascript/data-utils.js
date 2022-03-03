

/*
 * Function to search KnetMiner & update Map View, Gene View and Evidence View
 */
function searchKeyword() {
    //var searchMode = getRadioValue(document.gviewerForm.search_mode);
    var searchMode="genome"; // default

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
     let messageNode;
     let genomicViewTitle; 
     let status; 

    if (data.geneCount === 0) { 
          status = true; 
         if(keyword.length > 0) { // msg for keyword search error
            messageNode = keyword + 'did not match any genes or documents. Make sure that all words are spelled correctly. Try different or more general keywords.'; 
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

         $("#pGViewer_title").replaceWith(genomicViewTitle);

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
                  messageNode ='In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found ('+queryseconds+' seconds).' 
                  genomicViewTitle = createGenomicViewTitle(messageNode,status); 
                 }
               else if(count_notfound > 0) {
                 messageNode= 'In total <b>' + count_linked + ' linked genes</b> and '+count_unlinked+' unlinked genes were found. '+count_notfound+' user genes not found. ('+queryseconds+' seconds).'
                  genomicViewTitle = createGenomicViewTitle(messageNode,status);
               }
               // for rare edge cases when no genes in list are found in search, then search is keyword-centric only.
               if((count_linked === 0) && (count_unlinked > geneList_size) && (!list.toString().includes("*"))) {
                 messageNode = 'No user genes found. Showing keyword-centric results. In total <b>' + results + ' were found. ('+queryseconds+' seconds).'
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
               genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">No user genes found. Please provide valid gene IDs to see results.</span></div>';
              }
           }
         if(searchMode === "qtl") { // msg for QTL search
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
                  genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">No user genes found. Shwoing keyword/QTL related results. In total <b>' + results + ' were found. ('+queryseconds+' seconds).</span></div>';
                 }
              }
           }
         if (candidateGenes > 1000) { // for over 1000 results in any searchMode
             candidateGenes = 1000;
         }

         $("#pGViewer_title").replaceWith(genomicViewTitle);
         // Setup the mapview component
         var annotationsMap = data.gviewer;

         // create new basemap with bands for genes and pass it as well to the Map Viewer.
         genemap.drawFromRawAnnotationXML('#genemap', 'html/data/basemap.xml', annotationsMap);

         //Collapse Suggestor view
         $('#suggestor_search').attr('src', 'html/image/qs_expand.png');
         $('#suggestor_search_area').slideUp(500);



         activateButton('resultsTable');
         createGenesTable(data.geneTable, keyword, candidateGenes);
         createEvidenceTable(data.evidenceTable, keyword);
         if(geneList_size > 0) {
            $('#selectUser').show();
           }
           else { $('#selectUser').hide(); }
     }
}

// function creates Genomic title by using same html template for all messages
function createGenomicViewTitle(message,status){
    var genomicTemplate = `<div id="pGViewer_title"><span class="pGViewer_title_line"> ${status ? 'Your Search': 'In total'} ${message}</span>
    </div> `; 
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
        var keyword = chr_name + "-" + start + "-" + end;
        var request = "/" + searchMode + "?keyword=" + keyword;
        var url = api_url + request;
        $.get(url, '').done(function (data) {
            $("#" + id).val(data.geneCount);
        });
    }
}


// function returns query examples of the current dataset
function getQueryExamples(){

    var sampleQueryButtons = "";
        $.ajax({
            type: 'GET',
            url: "html/data/sampleQuery.xml",
            dataType: "xml",
            cache: false, //force cache off
            success: function (sampleQuery) {
                // Parse the values from the recieved sampleQueries.xml file into an object.
                var sampleQueries = new Array();	//object to hold parsed xml data
                $("query", sampleQuery).each(function () {	//for each different Query
                    var tempXML = new Array();
                    tempXML["name"] = $("name", this).text();
                    tempXML["desciption"] = $("description", this).text();
                    tempXML["term"] = $("term", this).text();
                    tempXML["withinRegion"] = $("withinRegion", this).text();
                    var regions = Array();
                    $("region", this).each(function () {
                        regions.push({
                            chromosome: $("chromosome", this).text(),
                            start: $("start", this).text(),
                            end: $("end", this).text(),
                            label: $("label", this).text()
                        });
                    });
                    tempXML["regions"] = regions;

                    tempXML["mapGLWithoutRestriction"] = $("mapGLWithoutRestriction", this).text();

                    var genes = Array();
                    $("gene", this).each(function () {
                        genes.push($(this).text());
                    });
                    tempXML["genes"] = genes;
                    sampleQueries.push(tempXML);
                });

                /*
                 * Object structure for parsed XML data
                 *
                 * sampleQueries[] 			= array of all queries parsed from sampleQuery.xml
                 * 		> name				= STRING - Name of the example query
                 * 		> description		= STRING - short description of the example query
                 * 		> term 				= STRING - Query Search Terms -
                 * 		> withinRegion 		= BOOLEAN - TRUE = Search within QTL region / FALSE = search whole genome -
                 * 		> region[] 			= ARRAY - qtl regions
                 * 			> chromosome 	= STRING ( chromosome name )
                 * 			> start		 	= NUMBER - region start
                 * 			> end		 	= NUMBER - region end
                 * 			> label		 	= STRING - region label
                 * 		> mapGLWithoutRestriction 	= BOOLEAN - TRUE = map gene list to results / FALSE = map gene list without restrictions
                 * 		> genes[]			= ARRAY of STRINGS - each string is an individual gene.
                 *
                 */

                // Create a string of html with a button for each of the example queries.
                for (i = 0; i < sampleQueries.length; i++) {
                    desc = "";
                    if (sampleQueries[i].desciption) {
                        desc = " - " + sampleQueries[i].desciption;
                    }
                    sampleQueryButtons += "</br><a href:'javascript;' class='exampleQuery' id='exampleQuery" + i + "'>" + sampleQueries[i].name + "</button></a>" + desc;
                }
                // add example queries to page
                $('#eg_queries').html(sampleQueryButtons);

                // set an event handler to populate the search fields when one of the example queries is clicked
                $('body').on('click', '.exampleQuery', function () {
                    //$('#with').trigger('click');
                    sampleNum = $(this)[0].id.replace('exampleQuery', '');

                    // show reset button 
                    $("#resetknet").show(); 
                    // display keyword search box
		            if($('#kwd_search').attr('src') === 'html/image/expand.gif') {
		               $('#kwd_search').trigger('click');
		              }
                    $("#keywords").val(sampleQueries[sampleNum].term);
                    var numRegions = sampleQueries[sampleNum].regions.length;



                    if (trim(sampleQueries[sampleNum].withinRegion) == 'true') {
                        $("input:radio[name=search_mode]").val(['qtl']);
                    } else {
                        $("input:radio[name=search_mode]").val(['genome']);
                    }

                    if (numRegions > 0) {
                        while (!$("#chr" + numRegions).length) { //while if the last row for which we have data, doesn't exist add one
                            $("#addRow").click();
                        }
                        while ($("#chr" + (numRegions + 1)).length) {	//while the row after the last one for which we have data exists remove one.
                            $("#removeRow").click();
                        }

                        if ($("#region_search_area").is(":hidden")) {
                            $("#region_search").click();
                        }

                        //loop through all regions and fill in the QTL region rows
                        for (i = 0; i < numRegions; i++) {
                            var num = i + 1;
                            $("#chr" + num).val(sampleQueries[sampleNum].regions[i].chromosome);
                            $("#start" + num).val(sampleQueries[sampleNum].regions[i].start);
                            $("#end" + num).val(sampleQueries[sampleNum].regions[i].end);
                            $("#label" + num).val(sampleQueries[sampleNum].regions[i].label);
                            $("#genes" + num).focus();	//forces Genes counter column to update
                        }
                    } else {
                        while ($("#chr2").length) {	//while there is more than 1 row remove one.
                            $("#removeRow").click();
                        }

                        $("#chr1").attr('selectedIndex', 0);
                        $("#start1").val("");
                        $("#end1").val("");
                        $("#label1").val("");
                        $("#genes1").focus();

                        if ($("#region_search_area").is(":visible")) {
                            $("#region_search").click();
                        }
                    }

                    if (trim(sampleQueries[sampleNum].mapGLWithoutRestriction) == 'true') {
                        $("input:radio[name=list_mode]").val(['GL']);
                    } else {
                        $("input:radio[name=list_mode]").val(['GLrestrict']);
                    }

                    //console.log("sampleQueries[sampleNum].genes.length= "+ sampleQueries[sampleNum].genes.length);
                    if (sampleQueries[sampleNum].genes.length > 0) {
                        if ($("#advanced_search_area").is(":hidden")) {
                            $("#advanced_search").click();
                        }
                        var genesText = "";
                        for (gene = 0; gene < sampleQueries[sampleNum].genes.length; gene++) {
                            genesText += sampleQueries[sampleNum].genes[gene] + "\n";
                        }
                        $("#list_of_genes").val(genesText);
                    } else {
                        $("#list_of_genes").val("");
                        if ($("#advanced_search_area").is(":visible")) {
                            $("#advanced_search").click();
                        }
                    }

                    matchCounter(); // updates number of matched documents and genes counter
                     // check if query populates gene list search
                     geneCounter(); 

                    // Refresh the Query Suggester, if it's already open.
                    if ($('#suggestor_search').attr('src') == "html/image/qs_collapse.png") {
                        refreshQuerySuggester();
                    }

                });
            }
        });



}

/*
 * Function to get the number of matches
 *
 */
function matchCounter() {
    var keyword = $('#keywords').val();

    $("#pGViewer_title").replaceWith('<div id="pGViewer_title"></div>'); // clear display msg
    if (keyword.length == 0) {
        $('#matchesResultDiv').html('Please, start typing your query');
		// hide query suggestor icon
		$('#suggestor_search').css('display', 'none');
    } else {
        if ((keyword.length > 2) && ((keyword.split('"').length - 1) % 2 == 0) && bracketsAreBalanced(keyword) && (keyword.indexOf("()") < 0) && ((keyword.split('(').length) == (keyword.split(')').length)) && (keyword.charAt(keyword.length - 1) != ' ') && (keyword.charAt(keyword.length - 1) != '(') && (keyword.substr(keyword.length - 3) != 'AND') && (keyword.substr(keyword.length - 3) != 'NOT') && (keyword.substr(keyword.length - 2) != 'OR') && (keyword.substr(keyword.length - 2) != ' A') && (keyword.substr(keyword.length - 3) != ' AN') && (keyword.substr(keyword.length - 2) != ' O') && (keyword.substr(keyword.length - 2) != ' N') && (keyword.substr(keyword.length - 2) != ' NO')) {
            var searchMode = "countHits";
            var request = "/" + searchMode + "?keyword=" + keyword;
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
                //$('#matchesResultDiv').html('<span class="redText">The KnetMiner server is currently offline. Please try again later.</span>');
                var server_error= JSON.parse(xhr.responseText); // full error json from server
                var errorMsg= server_error.statusReasonPhrase +" ("+ server_error.title +")";
                $('#matchesResultDiv').html('<span class="redText">'+errorMsg+'</span>');
                console.log(server_error.detail); // detailed stacktrace
            });
        } else {
            $('#matchesResultDiv').html('');
        }
    }
}
