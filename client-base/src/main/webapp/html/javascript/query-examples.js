
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