/* 
  TODO: this and its file need to change name. KnetSelector has zero meaning, there are tens of 
  selectors in an average application, each meaning completely different things.
  
  to consider: specieManager or specieSelector, or knetSpecieXXX
*/ 
// multi-species object literal house functions for the multi-species feature
const speciesSelector = function ()
{
    let currentTaxId = "";

    // function get lists of registered species from API
   function initiate ()
    {
	    $.get(api_url + '/dataset-info','').done( function(data){
	        knetWidgets.html(data);
	        var speciesInfo = data.species;
	        var isDropdownCreated = createSelectElement(speciesInfo); 

            if (isDropdownCreated){
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
        matchCounter();
        $('#speciename_container').empty();
        $('#chr1').empty();
        $('#tabviewer').hide(); 
        $('#pGSearch_title').hide();
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
  
	/** TODO: not used, remove?	*/
    // Update: function used in save-knet.js ln 37
    // function filters out species Information using currentTaxId value
    function getCurrentSpecies(data){
        var currentSpecies = data.filter(speciesnames => speciesnames.taxId === currentTaxId)[0]
        return currentSpecies
    }



    /**
     * function creates the species dropdown selector
     * @return true if the selector was created correctly
     * 
     * This is inside this other function, cause it's not needed anywhere else.
     */
    function createSelectElement(speciesInfo)
    {
        if(speciesInfo.length > 1){
            for(var speciesName in speciesInfo){
                var singleSpecie = speciesInfo[speciesName]; 
                var optionElement = '<option value='+ singleSpecie.taxId+'>'+singleSpecie.scientificName+'</option>'
                $('.navbar-select').append(optionElement);
            }
            return true 
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

    // function to be triggered on changing the species dropdown option
    // TODO: could this be a method of speciesSelector? In that case, we could hide
    // refreshUI () ?
    //
    function changeSpecies(selectElement){
        var selectedSpecie = $(selectElement).children("option:selected"),
        currentTaxData = setTaxId (selectedSpecie.val());

        if(currentTaxData)
        {
            refreshUI ()
            examples()
            setTimeout(function(){
                // gets genome region search table row elements
                var getGenomeRegionRow = getGenomeRegionRows();
                for(genomeRegionIndex = 0; genomeRegionIndex < getGenomeRegionRow.length; genomeRegionIndex++){
                    var geneomeDatarow = $(getGenomeRegionRow[genomeRegionIndex]).children();
                    $(geneomeDatarow[4]).children().focus();
                }
            },100)
        }
    }

    return {
        initiate: initiate,
        getCurrentSpecies:getCurrentSpecies,
        refreshUI: refreshUI,
        setTaxId: setTaxId,
        getTaxIdUrlFrag: getTaxIdUrlFrag,
        changeSpecies:changeSpecies
    }
}(); 