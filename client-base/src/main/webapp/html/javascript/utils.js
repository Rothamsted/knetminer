
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
		getTaxIdFromUrl();
	    multiSpeciesFeature.init();					
			loginUtilsInit();	 // See notes in loginUtils.js
	    loadOnReady();
	    showReferenceGenome();
	    initResetButton();
	    inputHandlers();
	    QtlRegionHandlers();
	    searchHandlers();
		showToolTips();
		intialiseFeedbackCtaConfig();
		
		// Do this as last step, so that it doesn't track in 
		// case of failure		
	    doGoogleAnalytics ();
		})
		.catch ( 
			err => showApiInitResult ( err )
		);
	});
// ready()