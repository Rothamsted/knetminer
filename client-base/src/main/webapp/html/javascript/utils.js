
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
			// sets genemap width based on user screen-size see in ui-utils.js
			var genemapWidth = adaptGenoMapSize();

			genemap = GENEMAP.GeneMap({apiUrl: api_url}).width(genemapWidth).height(500)
		 // changed from 750x400
			
			knetmaps = KNETMAPS.KnetMaps();


			detectTaxIdFromUrl();
		
			speciesSelector.initiate();	
				


			exampleQuery.setQueryData();						
			loginUtilsInit();	 // See notes in loginUtils.js
			loadOnReady();
			showReferenceGenome();
			initResetButton();
			showToolTips();
			intialiseFeedbackCtaConfig();
			setupGenesSearch
		
			// Do this as last step, so that it doesn't track in 
			// case of failure		
	    googleAnalytics.start ()
	    .then ( () => googleAnalytics.trackEvent ( "uiOpened" ) );
		})
		.catch ( 
			err => showApiInitResult ( err )
		);
	});
// ready()