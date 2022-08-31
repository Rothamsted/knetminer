// TODO: What's for? The current Google instructions don't mention any of these
// DISABLING AND INTRODUCING NEW VERSIONS
/*
 * general page analytics, not the tracking ga_id one
 *
function generalPageAnalytics(){
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-26111300-1']);
    _gaq.push(['_trackPageview']);
}

function createAnalyticsTag() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
}
*/

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
		console.log ( "Google Analytics, no ID set, not tracking" );
	}
	
	try
	{ 
		await $.getScript( "https://www.googletagmanager.com/gtag/js?id=" + googleAnalyticsId );
  	window.dataLayer = window.dataLayer || [];
  	_gtag ( 'js', new Date() );
  	_gtag ( 'config', googleAnalyticsId );
  }
  catch ( ex )
  {
		console.error ( "Google Analytics invocation failed:", ex );
  }	
}
