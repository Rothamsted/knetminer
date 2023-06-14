
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
			speciesSelector.initiate();					
			loginUtilsInit();	 // See notes in loginUtils.js
			loadOnReady();
			showReferenceGenome();
			initResetButton();
			showToolTips();
			intialiseFeedbackCtaConfig();
			checkUserPlan();
		
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