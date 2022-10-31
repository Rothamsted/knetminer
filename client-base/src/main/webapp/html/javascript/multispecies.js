// multi-species object literal house functions that can be used outside independently outside
multiSpeciesFeature = function ()
{
    var currentTaxId = "";

    // function get lists of registered species from API
   function getSpeciesList()
    {
	          // TODO: two tasks into the same function, too complicated, setting the ID
	          // based on URL should be dealt with else where, this looks more for 
	          // fetching the species. 
	          
	          // TODO: also the function name doesn't look very good: does it get the species and
	          // set up the user interface? => Name it something like setSpeciesSelector ()  
	          //
	            	
            var taxIdFromURL = new URLSearchParams ( document.location.search )
              .get ( "taxId" );
            if ( taxIdFromURL ) setTaxId ( taxIdFromURL );

						/**
						 * TODO: remove and keep the version above. This is not robust, in principle, nothing tells you 
						 * that, if the paramers are available, then taxId is one of them. Try to not rely on accidental 
						 * application circumstances like this. 
						 *              
            if (url.indexOf('?') !== -1)
            {    
                var url = new URLSearchParams(url); 
                setTaxId(url.get('taxId'));
            }
            */          
            
            
            $.get(api_url + '/dataset-info','').done( function(data){
                renderHtmlHeaders(data);
                var speciesInfos = data.species;
                var createdDropDown = createDropdown(speciesInfos); 

                if(createdDropDown){
                    selectDropdown();
                    $('#species_header').css('display','flex');
                    multiSpeciesEvents(); 
                    deactivateSpinner("#wrapper");
                }
            }).fail(function(xhr,status,errolog){
                errorComponent('#pGViewer_title',xhr);
            });
    }

    // function creates the species dropdown
    function createDropdown(speciesNames){
        var expectedOptions = speciesNames.length;
        for(var speciesName in speciesNames){
            var singleSpecie = speciesNames[speciesName]; 
            var optionElement = '<option value='+ singleSpecie.taxId+'>'+singleSpecie.scientificName+'</option>'
            $('.navbar-select').append(optionElement);
            var speciesOptions = $('.navbar-select option')
            if(speciesOptions.length === expectedOptions){
                return true
            }
        }
        
        
    }

    // function house events that needs to be called when currentTaxId changes
    function multiSpeciesEvents(){
        getQueryExamples();
        drawGeneMaps('draw',null);
        getChromosomeList();
        matchCounter();
        setTaxIdParams()
        return true;
    }

    /** 
     * Set the current taxonomy ID, usually based on the user selection.
     */
    // function setApiUrl(id)
    function setTaxId (id) {
      currentTaxId = id;
      return currentTaxId ? true : false
    }

		/**
		 * Helper to get the URL fragment to request the right taxonomy ID, based on the currently selected
		 * ones (see setTaxId () )
		 * 
		 */
		function getTaxIdUrlFrag ()
		{
			return currentTaxId ? '?taxId=' + currentTaxId : "";
		}

    /**
     * Helper function adds and replace taxonomy ID to current url when triggered
     * 
     */
    function setTaxIdParams()
    {
      taxIdFrag = getTaxIdUrlFrag();
      
      var taxIdFromURL = new URLSearchParams ( document.location.search )
        .get ( "taxId" );
        
      // TODO: why do we need to manage this in this convoluted way?
      // It should be like:
      //
      // - on UI load: 
      //   - init speciesList (or object, or whaterver)
      //   - selectSpecie ( taxId from URL )
      // - on new specie selected from the UI selector: selectSpecie ( new taxID )
      // - PERIOD.
      //
      // - selectSpecie ( taxId ): 
      //   works with speciesList to change the UI with the new specie (if != current one)
      //   - It DOES NOT care how taxId is chosen (from URL or UI element)
      //   - Possibly, it DOES NOT care about fetching the speies data (does not invoke the API, or calls
      //     a separated function/method/object/etc for that)
      // 
      //
      
      if ( taxIdFromURL ) 
        history.pushState ( {}, '', taxIdFrag )
			else
			  history.replaceState ( {}, '', taxIdFrag )
    }
    
    // 
    /**
     * Function checks if current taxId value equals to the value of one of the species select options
     * if taxId value equals that of a species it becomes selected
     * If taxId is not set, the first select option is selected
     * 
     */
    function selectDropdown(){
        if(currentTaxId !== ""){
            var speciesOptions = $('.navbar-select option')
            speciesOptions.each(function(){
                if(currentTaxId === this.value){
                    $(this).attr('selected', true)
                    console.log('here')
                }
            })
        }else{
            var firstSpecies = $('.navbar-select').first();
            setTaxId(firstSpecies.val());  
        }

    }
		
    // get species query examples 
    function getQueryExamples(){
            var sampleQueryButtons = "";
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
                        sampleQueryButtons += "<a href:'javascript;' class='exampleQuery' id='exampleQuery" + i + "'>" + sampleQueries[i].name + "</button></a>" + desc + '<br>';
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
                            
                            while (!$("#chr" + numRegions).length){ //while if the last row for which we have data, doesn't exist add one
                                $("#addRow").click();
                            }


                            removeGeneRow()

                          
                

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

                            removeGeneRow()
                            emptyRegionInputs(1); 
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
    // get the gene chromosome list 
    function getChromosomeList(){
        $.get(api_url + '/dataset-info/chromosome-ids' + getTaxIdUrlFrag () ,'').done( function(chromosomes){
            for(let i=0; i < chromosomes.length; i++){
                var chr1Options = '<option value='+chromosomes[i]+'>'+ chromosomes[i]+'</option>';
                $('#chr1').append(chr1Options);
            }  
        }).fail(function (xhr,status,errorlog){
            errorComponent('.nav',xhr,status,errorlog);
        });
    }

    // function sets instance title and meta data contents for keywords and description. currently called in line 29
    function renderHtmlHeaders(species){
        document.title = species.title; 
        document.querySelector('meta[name="description"]').content = species.description;
        document.querySelector('meta[name="keywords"]').content = species.keywords;
    }

    // draws the genomap view 
    function drawGeneMaps(basemapString,data){  
        var taxIdBaseXmlUrl = api_url + '/dataset-info/basemap.xml'+ getTaxIdUrlFrag ()
            if(basemapString === 'draw'){
                genemap.draw('#genemap',taxIdBaseXmlUrl, data)
            }else{
                genemap.drawFromRawAnnotationXML('#genemap',taxIdBaseXmlUrl,data);
            }
    
    }
    // function filters out species Information using currentTaxId value
    function currentSpecies(data){
        var currentSpecies = data.filter(speciesnames => speciesnames.taxId === currentTaxId)[0]
        return currentSpecies
    }

    return {
        init:getSpeciesList,
        speciesEvents: multiSpeciesEvents,
        taxId: setTaxId,
        maps:drawGeneMaps,
        speciesData: currentSpecies
    }
}(); 