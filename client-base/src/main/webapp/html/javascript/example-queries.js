/**
 * TODO: Regarding recent changes about minimumUserRole, we don't have anything to test them in 
 * aratiny, that's not good, we should check if we can have a test user which can be used
 * for the aratiny dataset.
 * 
 */

/**
 * Makes URL calls to sample query endpoint.
 * Creates elements attached to UI with click events that populates queries to search inputs.
 */
const exampleQuery = function () {
    /**
     * An array that house example queries objects parsed from XML API endpoint.
     */
    var sampleQueries = [];

    /**
     * function gets XML-format example queries from dataset-info API endpoint.
     * Parses data into an array of objects.
     */
    async function setQueryData() {

        $.ajax({
            type: 'POST',
            url: api_url + '/dataset-info/sample-query.xml',
            dataType: "xml",
            cache: false, //force cache off
            success: function (sampleQuery) {
                // Parse the values from the recieved sampleQueries.xml file into an object.
                //object to hold parsed xml data
                $("query", sampleQuery).each(function (index) { //for each different Query
                    var tempXML = new Object();
                    tempXML["description"] = $("description", this).text();
                    tempXML["term"] = $("term", this).text();
                    // tempXML["withinRegion"] = $("withinRegion", this).text();
                    tempXML["taxId"] = $("taxId", this).text();
                    tempXML["minimumUserRole"] = $("minimumUserRole", this).text();
                    tempXML["index"] = index;
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

                    var genes = Array();

                    $("gene", this).each(function () {
                        genes.push($(this).text());
                    });

                    tempXML["genes"] = genes;
                    sampleQueries.push(tempXML);
                });

                renderQueryHtml(); 

            }
        });
    }


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

    /**
     * Populate the search fields example query is clicked. 
     * Called outside to prevent being trigged when mounting HTML fragments
     * @param {*} queryIndex 
     */
    function populateQueryValues(queryIndex) {

        var targetQuery = sampleQueries.filter((query) => query.index == queryIndex)[0]
        /* TODO: is this really needed Can't you just do something like:
           var targetQuery = sampleQueries [ queryIndex ]
           If not, is it because sampleQueries creation requires something like: 
           sampleQueries [ <the index attribute> ] = <the parsed XML>
        */ 

        var { term, regions, genes, minimumUserRole } = targetQuery;

        var isQueryRestricted = userAccessMgr.requires(minimumUserRole);

        // disables search button if query is restricted
        $('#searchBtn').toggleClass('button-disabled', !isQueryRestricted); 

        if (!regions.length) {
            removeGeneRow()
            emptyRegionInputs(1);
            if ($("#region_search_area").is(":visible")) {
                $("#region_search").attr('src', 'html/image/expand.gif')
                $('#region_search_area').hide();

            }
        }

        if (!genes.length) {
            $("#list_of_genes").val("");
            if ($("#advanced_search_area").is(":visible")) {
                $("#advanced_search").attr('src', 'html/image/expand.gif')
                $("#advanced_search_area").hide();
            }
        }
        
        if (genes.length) populateGeneList(genes);

        if (regions.length) populateGenomeRegion(regions);

        populatekeywordSearch(term);

        triggerInputsEvents()


        //  if (trim(withinRegion) == 'true') {
        //      $("input:radio[name=search_mode]").val(['qtl']);
        //  } else {
        //      $("input:radio[name=search_mode]").val(['genome']);
        //  }
    }

    /**
     * Populates keyword queries to keyword search input
     * @param {*} term 
     */
    function populatekeywordSearch(term) {
        if ($('#kwd_search').attr('src') === 'html/image/expand.gif') {
            $('#kwd_search').trigger('click');
        }
        $("#keywords").val(term);
    }

    /**
     * Populates Genes list search textarea with example query genes list
     * @param {*} genes 
     */
    function populateGeneList(genes) {

        if ($("#advanced_search_area").is(":hidden")) {
            $("#advanced_search").click();
        }

        var genesText = "";
        for (var gene = 0; gene < genes.length; gene++) {
            genesText += genes[gene] + "\n";
        }
        $("#list_of_genes").val(genesText);
    }

    /**
     * Populates Genome region search with example query chromosome positions
     * @param {*} regions 
     */
    function populateGenomeRegion(regions) {

        var numRegions = regions.length;

        while (!$("#chr" + numRegions).length) { //while if the last row for which we have data, doesn't exist add one
            $("#addRow").click();
        }

        if ($("#region_search_area").is(":hidden")) {
            $("#region_search").click();
        }

        //loop through all regions and fill in the QTL region rows
        for (i = 0; i < numRegions; i++) {
            var num = i + 1;
            var { chromosome, start, end, label } = regions[i]
            $("#chr" + num).val(chromosome);
            $("#start" + num).val(start);
            $("#end" + num).val(end);
            $("#label" + num).val(label);
            $("#genes" + num).focus();

            toggleRegionDeleteIcon(num)
        }
    }

    /**
     * Calls events that shows number of documents and suggested keywords found from populated inputs.
     */
    function triggerInputsEvents() {

        // updates number of matched documents and genes counter
        geneCounter();

        // check if query populates gene list search
        matchCounter();

        // Refresh the Query Suggester, if it's already open.
        refreshQuerySuggester();

        $("#resetknet").show();
    }

    /**
   * Renders query examples to UI .
   */
    function renderQueryHtml() {
        
        $('#eg_queries').html('')
        $('#searchBtn').removeClass('button-disabled')
        
        var currentTaxId = $(".navbar-select").children("option:selected").val();

        var selectedQuery = sampleQueries.filter((queries) => queries.taxId === currentTaxId || queries.taxId === '');
        // empty exiting examples 

       selectedQuery.forEach(function(query)
        {
            var { minimumUserRole,description,index } = query;

            var queryRestriction;
            var isQueryRestricted = userAccessMgr.requires(minimumUserRole);
            var isGeneListRestricted = userAccessMgr.isLimitEnforced();

            if (!isQueryRestricted) {
                queryRestriction = `<a class='query-restriction-text' onclick="loginModalInit()">(Login)</a>`;
            }

						/* TODO: NO! roles need to be cheched via can(), see user-access.js
						   
						   Also, why are you checking minimumUserRole again, if it was already done upon 
						   setting isGeneListRestricted? 
						*/
						
            if (isGeneListRestricted && minimumUserRole == 'pro') {
                queryRestriction = `<a class='query-restriction-text' href="https://knetminer.com/pricing-plans" target="_blank" >(Upgrade)</a>`;
            }

            // Example query buttons
            var sampleQueryButtons = !queryRestriction ?  `<li class='exampleQuery'><a onclick="populateExamples(${index})" >${description}</a></li>`: `<li class='exampleQuery'><a onclick="populateExamples(${index})" >${description}</a> ${queryRestriction}</li>`;
            //Add example queries to page  

            $('#eg_queries').append(sampleQueryButtons);
        })
    }

    return {
        setQueryData: setQueryData,
        populateQueryValues: populateQueryValues,
        renderQueryHtml: renderQueryHtml
    }

}();

/**
 * Called outside object literal to avoid being triggered when mounting HTML element. 
 * @param {*} queryIndex 
 */
function populateExamples(queryIndex) {
    exampleQuery.populateQueryValues(queryIndex);
}