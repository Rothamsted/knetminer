// multi-species object literal house functions for the multi-species feature
const knetSelector = function ()
{
    let currentTaxId = "";

    // function get lists of registered species from API
   function register ()
    {
	    /**
	     * function creates the species dropdown selector
	     * @return true if the selector was created correctly
	     * 
	     * This is inside this other function, cause it's not needed anywhere else.
	     */
	    function create(speciesInfo)
	    {
	        var expectedOptions = speciesInfo.length;
	        if(expectedOptions > 1){
	            for(var speciesName in speciesInfo){
	                var singleSpecie = speciesInfo[speciesName]; 
	                var optionElement = '<option value='+ singleSpecie.taxId+'>'+singleSpecie.scientificName+'</option>'
	                $('.navbar-select').append(optionElement);
	                var speciesOptions = $('.navbar-select option')
	                // TODO: Why does it need to be so convoluted?
	                // Are you expecting this loop to iterate over a different no of elements?
	                // why can't it be:
	                //
	                // for ( speciesName ... )
	                //   <render the option element>
	                // return true
	                // 
	                if (speciesOptions.length === expectedOptions)
	                    return true
	            }
	        }else{
	        		// Draw one element and hide it, so that the rest of the UI works the same as multiple options
	            setTaxId(speciesInfo[0].taxId);
	            var optionElement = '<option value='+ speciesInfo[0].taxId+'>'+speciesInfo[0].scientificName+'</option>'; 
	            $('.navbar-select').replaceWith("<span class='navbar-select'></span>");
	            $('.navbar-select').append(optionElement);
	            $('.navbarselect-container').css({
	                "border":"none",
	                "height":'unset'
	            })
	            $('.navbar-select').css({
	                "height":"unset"
	            })
	            return false
	        }
	    }
	
	    $.get(api_url + '/dataset-info','').done( function(data){
	        knetWidgets.html(data);
	        var speciesInfo = data.species;
	        var createdDropDown = create(speciesInfo); 
	        if(createdDropDown){
	            doSpecieSwitch ();
	            $('#species_header').css('display','flex');
	            refreshUI (); 
	        }
	    }).fail(function(xhr,status,errolog){
	        errorComponent('#pGViewer_title',xhr);
	    });
    }

		/** 
		 * Calls the necessary events after switching specie. 
		 */
    function refreshUI ()
    {
        knetWidgets.drawMap('draw',null);
        knetWidgets.getList();
        examples()
        matchCounter();
    }

    /** 
     * Set the current taxonomy ID, usually based on the user selection.
     */
    function setTaxId(id) {
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
     * Function checks if current taxId value equals to the value of one of the species select options
     * if taxId value equals that of a species it becomes selected
     * If taxId is not set, the first select option is selected
     * 
     */
    function doSpecieSwitch ()
    {
        if(currentTaxId !== ""){
            // set 
            var speciesOptions = $('.navbar-select option')
            speciesOptions.each(function(){
                if(currentTaxId === this.value){
                    $(this).attr('selected', true)
                    var url = window.location.href; 
                    url = url.split('?')[0]
                    history.pushState ( {}, '',url);
                }
            })


        }else{
            var firstSpecies = $('.navbar-select').first();
            setTaxId(firstSpecies.val());  
        }

    }
  
		/* TODO: not used, remove?		
    // function filters out species Information using currentTaxId value
    function getSpecies(data){
        var currentSpecies = data.filter(speciesnames => speciesnames.taxId === currentTaxId)[0]
        return currentSpecies
    }
    */

    function examples(){
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
                   // tempXML["name"] = $("name", this).text(); //disabled for now - using bulletpointed lists instead
                    tempXML["description"] = $("description", this).text();
                    tempXML["term"] = $("term", this).text();
                    tempXML["withinRegion"] = $("withinRegion", this).text();
                    tempXML["taxId"] = $("taxId", this).text();
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

                // Create a string of html with a button for each of the example queries.
                for (i = 0; i < sampleQueries.length; i++) {
                    if (sampleQueries[i].taxId && sampleQueries[i].taxId != currentTaxId) continue; // Only show relevant sample queries
                    desc = "";
                    if (sampleQueries[i].description) {
                        desc = sampleQueries[i].description;
                    }
                    sampleQueryButtons += "• " + "<a href:'javascript;' class='exampleQuery' id='exampleQuery" + i + "'>" + desc + "</button></a>" + '<br>';
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


    return {
        register: register,
        refreshUI: refreshUI,
        setTaxId: setTaxId,
        // TODO: remove!!! COME ON!!! getTaxId is ALMOST ALWAYS understood as: GET ME THAT VALUE
        // NOT A STRING BASED ON IT!!!
        // Also, it's cleaner to name the exposed keys the same as the internal functions.
        // getTaxId: getTaxIdUrlFrag,
        getTaxIdUrlFrag: getTaxIdUrlFrag,
        
        // TODO: remove. Why do you expose it to the world, if it's an internal helper?!
        // create:create,
        
        // TODO: remove. Why do you expose it to the world, if it's an internal helper?!
        // doSpecieSwitch: doSpecieSwitch,
        
        // TODO: not used, remove?
        // getSpecies: getSpecies
    }
}(); 

