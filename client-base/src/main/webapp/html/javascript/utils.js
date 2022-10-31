
// Map View
var genemap; 
var knetmaps; 

/*
* Initialised the API URls, setup UI elements, renders possible errors. 
*/
$(document).ready ( 
	function()
	{
		setupApiUrls()

		.then ( function ()
		{
			showApiInitResult ();
			
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
		})
		.catch ( 
			err => showApiInitResult ( err )
		);
	});