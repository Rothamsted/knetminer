
// Map View
var genemap; 
var knetmaps; 

/*
* Document ready event executes when the HTML document is loaded
* 	- add/remove QTL regions
* 	- advanced search
* 	- tooltips
*   - more (see the implementation)
*/
$(document).ready (
    function () {
       setupApiUrls()
       .then ( function () 
       {
					genemap = GENEMAP.GeneMap({apiUrl: api_url})
						.width(800).height(550); // changed from 750x400
					knetmaps = KNETMAPS.KnetMaps();
	        multiSpeciesFeature.init();					
					loginUtilsInit();	 // See notes in loginUtils.js
	        loadOnReady();
	        showReferenceGenome();
	        initResetButton();
	        inputHandlers();
	        QtlRegionHandlers();
	        searchHandlers();
	        bodyHandlers();
	        doGoogleAnalytics ();
	     });        
    }
);
