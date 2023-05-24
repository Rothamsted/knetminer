/* New version of code for GA (2022-08)
 * This was adapted from their instructions, to make it fully dynamic (instead of static bindings via
 * <script> elements).
 */

const googleAnalytics = function () 
{ 
	var isEnabled = false
	
	/**
	 * Track an event, in the way explained by the documentation.
	 * 
	 * @param eventId something like 'app opened', 'user view selected' etc
	 * @param parametersObject additional data you want to be tracked with the event, eg, 
	 * { searchString: 'blah', results: 123 }
	 * 
	 * WARNING! For Knetminer API tracking, we try to keep the parameter names
	 * consistent with the server-side tracking in KnetminerServer.java
	 * 
	 */
	function trackEvent ( eventId, parametersObject = {} )
	{
		/*
		TODO: to be verified, this applies to the measurement protocol, here GA seems to accept
		a different format
		
		const gaValidationRe = /^\w+$/
		if  ( ! eventId.match ( gaValidationRe ) )
			throw new RangeError ( `Invalid GA format for event name "${eventId}"`)
		
		for ( paramName in parametersObject )
			if  ( ! paramName.match ( gaValidationRe ) )
				throw new RangeError ( `Invalid GA format for param name: "${eventId}"`)
		*/
			
		if ( eventId.startsWith ( "api_" ) ) throw new RangeError ( 
			`Invalid GA Analytics event ID "${eventId}", 'api_' names are reserved for the server components` 
		)
		 
		gtag ( 'event', eventId, parametersObject )
		console.info ( `Google Analytics, event '${eventId}' sent` )
	}
	
	/**
	 * Used in ui-utils.js::activateButton() to specifically track the selection of 
	 * a given view in the bottom panel.
	 * 
	 * @param viewId is one of the tab identifiers used in the UI and activateButton()
	 * We send a better-titles event IDs in its place (see the function implementation)
	 */
	function trackViewSelection ( viewId )
	{
    // Let's send a better event ID to GA
    const gaEventsMap = {
		  'resultsTable': 'geneTable',
		  'evidenceTable': 'evidenceTable',
		  'genemap-tab': 'mapView',
		  'NetworkCanvas': 'networkView'
		}
		targetStr = gaEventsMap [ viewId ]
		if ( !targetStr ) targetStr = 'unknownView'
	  googleAnalytics.trackEvent ( `${targetStr}Selected` );	
	}
	
  /** 
   * The gtag() function Google gives in the instructions.
   *  
   * This sends whatever arguments it receives to GA. It's a low level handler, probably
   * you actually want to use trackXXXX()
   *    
   */
	function gtag ()
	{
		if ( !isEnabled ) return
		dataLayer.push ( arguments );
		// debug only, it's very verbose
		/* 
		const paramStr = arguments && arguments.length > 0 
			? arguments [ 0 ] : '<NA>' 
		console.debug ( `Google Analytics, '${paramStr}' sent` )
		*/
	}

	/**
	 * Used on page load, to start everything. Google doc says it's important this is done only once
	 * per new page.
	 * 
	 */
	async function start ()
	{
		const googleAnalyticsId = await $.get (
	    api_url + "/dataset-info/google-analytics-id",
	    gaUrl => gaUrl.replace ( /\n/g, "" )
	  );
	  		
		if ( !googleAnalyticsId ) {
			console.info ( "Google Analytics, no ID set, not tracking" );
			return;
		}
		
		try
		{ 
			await $.getScript( "https://www.googletagmanager.com/gtag/js?id=" + googleAnalyticsId );
	  	window.dataLayer = window.dataLayer || [];
	  	isEnabled = true;
	  	gtag ( 'js', new Date() );
	  	gtag ( 'config', googleAnalyticsId );
	  	console.info ( "Google Analytics tracker started with", googleAnalyticsId );
	  }
	  catch ( ex )
	  {
			console.error ( "Google Analytics invocation failed:", ex );
	  }					
	} // start
		
	return {
		trackEvent: trackEvent,
		trackViewSelection: trackViewSelection,
		gtag: gtag,
		start: start
	}
} () 
