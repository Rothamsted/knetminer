/**
 * Makes URL calls to sample queries endpoints
 * Creates Elements and attach to UI with click events to autofill queries to search inputs.
 */
function examples(){
    $('#eg_queries').html('');
    $.ajax({
        type: 'POST',
        url: api_url + '/dataset-info/sample-query.xml', 
        dataType: "xml",
        cache: false, //force cache off
        success: function (sampleQuery) {
            // Parse the values from the recieved sampleQueries.xml file into an object.
            var sampleQueries = new Array();	//object to hold parsed xml data
            $("query", sampleQuery).each(function () {	//for each different Query
                var tempXML = new Array();
               // tempXML["name"] = $("name", this).text(); //disabled for now - using bulletpointed lists instead
                tempXML["description"] = $("description", this).text();
                tempXML["term"] = $("term", this).text();
                tempXML["withinRegion"] = $("withinRegion", this).text();
                tempXML["taxId"] = $("taxId", this).text();
                tempXML["accType"] = $("accType", this).text(); 
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
            * 		> name				= STRING - Name of the example query - this is now removed. TODO: remove it forever?
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
            *       > taxid             = STRING taxid (optional parameter - if not populated queries will appear on all species)
            *
            */

            var currentTaxId =  $(".navbar-select").children("option:selected")
            // Create a string of html with a button for each of the example queries.
            for (i = 0; i < sampleQueries.length; i++) {
                var queryRestriction;

                if (sampleQueries[i].taxId && sampleQueries[i].taxId != currentTaxId.val()) continue; // Only show relevant sample queries
                desc = "";

                if (sampleQueries[i].description) {
                    desc = sampleQueries[i].description;
                }

                if(enforce_genelist_limit){

                    if(freegenelist_limit == 20 && sampleQueries[i].accType.toLowerCase() == 'free'){
                        queryRestriction = `<a class='query-restriction-text' onclick="loginModalInit()">(Sign Up)</a>`; 
                    }

                    if(freegenelist_limit <=100 && sampleQueries[i].accType.toLowerCase() == 'pro'){
                        queryRestriction = `<a class='query-restriction-text' href="https://knetminer.com/pricing-plans" target="_blank" >(Upgrade to Pro)</a>`; 
                    }
                }

                // example query buttons
                var sampleQueryButtons = `<a class='exampleQuery' id='exampleQuery${i}'>${desc}</a>`; 

                //add example queries to page  
                var query = !queryRestriction ? sampleQueryButtons : `<div id="restricted-query"><div> ${sampleQueryButtons} ${queryRestriction}</div>`; 
                $('#eg_queries').append(query);
            }
            
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
                    
                    while (!$("#chr" + numRegions).length){ //while if the last row for which we have data, doesn't exist add one
                        $("#addRow").click();
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
                        $("#genes" + num).focus();
            
                        toggleRegionDeleteIcon(num)
                    }

                } else {

                    removeGeneRow()
                    emptyRegionInputs(1); 
                    if ($("#region_search_area").is(":visible")) {
                        $("#region_search").attr('src', 'html/image/expand.gif')
                        $('#region_search_area').hide();
                        
                    }
                }


                if (trim(sampleQueries[sampleNum].mapGLWithoutRestriction) == 'true') {
                    $("input:radio[name=list_mode]").val(['GL']);
                } else {
                    $("input:radio[name=list_mode]").val(['GLrestrict']);
                }
                

                // TODO: extend original function that takes the on clicking the buttton
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
                        $("#advanced_search").attr('src', 'html/image/expand.gif')
                        $("#advanced_search_area").hide();
                    }
                }

                matchCounter(); // updates number of matched documents and genes counter
                // check if query populates gene list search
                geneCounter(); 

                // Refresh the Query Suggester, if it's already open.
                refreshQuerySuggester();
            });
        }
    });
}