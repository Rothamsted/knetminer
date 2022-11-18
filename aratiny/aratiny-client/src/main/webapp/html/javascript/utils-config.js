
var api_url = "";

var knetspace_api_host= "";

// TODO:newConfig probably it's poor Js, I've added this to utils::$.ready()
/**
 * Sets up the API-related URL variables (eg, api_url).
 *
 * This is based on multiple attempts, until one that succeds:
 *
 *  - First the /html/api-url.jsp is probed, mainly to see if the API URL base is configured via JVM or can 
 *    be computed by that JSP combining the client's URL and well-known API paths 
 *  - If that doesn't work (eg, behind a reverse proxy), then the same well-known URL approach is attempted
 *    from the client side.
 * 
 *  If all of the above fails, an exception is raised. Upon success, variables like api_url are set and the value
 *  set for the latter is also returned.
 * 
 *  callerUrlPath tells the function the URL path where the invoker is. This is needed to figure out what the 
 *  application URL prefix might be, eg, if we're calling http://foo.com:8080/test/test-page.html and
 *  test-page invokes this with /test-page.html, then the function will assume the application is 
 *  located at http://foo.com:8080/test.
 *
 *  WARNING: this requires jQuery.
 */
async function setupApiUrls ( callerUrlPath = "" )
{
	$.ajaxSetup( { timeout:3000 } ); // Applies globally, from now on
	
  var clientBaseUrl = window.location.href
    .replace ( /\?.*/g, "" ) // Don't mess-up with the params
    .replace ( /\/$/g, "" ); // URLs with // don't always work;

	if ( callerUrlPath != "" )
		clientBaseUrl = clientBaseUrl.replace ( callerUrlPath, "" );
  
  bootstrapUrl = clientBaseUrl;
  bootstrapUrl += "/html/api-url.jsp";
  bootstrapUrl += "?clientUrl=" + encodeURIComponent ( bootstrapUrl );

  // getting these \n from the API, who knows why
  try {
    api_url = await $.get ( bootstrapUrl, aurl => aurl.replace ( /\n/g, "" ) );
  }
  catch ( e )
  {
		// If it fails, try this too, might help when the client URL is wrong for the
		// server side
		instanceBaseUrl = clientBaseUrl.replace ( /client$/g, "" );
		guessApiUrl = instanceBaseUrl + "/ws/default/dataset-info";

		await $.getJSON ( guessApiUrl, js => {
			// Initially, I've tried: api_url = await $.getJSON(...), but
			// no idea why in this case api_url is set to js, instead of this return value
			api_url = instanceBaseUrl + "/ws/" + js [ "id" ]
		});
  }
	
  // Same trick with this other API (including \n escaping)
  knetspace_api_host = await $.get (
    api_url + "/dataset-info/knetspace-url",
    ksUrl => ksUrl.replace ( /\n/g, "" )
  );

  return api_url; // just in case the invoker wants it
}

var enforce_genelist_limit= true; // enforce free user search limits (true/false).

// TODO: these should come from API and from config
var freegenelist_limit= 20; // default gene list search limit for free user (Pro: unlimited).
var knetview_limit= 10; 
