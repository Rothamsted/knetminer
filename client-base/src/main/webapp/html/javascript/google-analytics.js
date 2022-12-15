/* New version of code for GA (2022-08)
 * This was adapted from their instructions, to make it fully dynamic (instead of static bindings via
 * <script> elements).
 */

/** The gtag() function they give in the instructions */
function _gtag() { dataLayer.push ( arguments ); }

async function doGoogleAnalytics ()
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
  	_gtag ( 'js', new Date() );
  	_gtag ( 'config', googleAnalyticsId );
  	console.info ( "Google Analytics tracker invoked with", googleAnalyticsId );
  }
  catch ( ex )
  {
		console.error ( "Google Analytics invocation failed:", ex );
  }	
}
