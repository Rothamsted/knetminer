
var api_url = "";

var knetspace_api_host= "";

// TODO:newConfig probably it's poor Js, I've added this to utils::$.ready()
async function setupApiUrls ()
{
  var clientBaseUrl = window.location.href
    .replace ( /\?.*/g, "" ) // Don't mess-up with the params
    .replace ( /\/$/g, "" ); // URLs with // don't always work;
  bootstrapUrl = clientBaseUrl;
  bootstrapUrl += "/html/api-url.jsp";
  bootstrapUrl += "?clientUrl=" + encodeURIComponent ( bootstrapUrl );

  // getting these \n from the API, who knows why
  try {
    api_url = await $.get ( bootstrapUrl, aurl => aurl.replace ( /\n/g, "" ) );
  }
  catch ( e )
  {
		// If it fails again, try to guess this too, might help when the client URL is wrong for the
		// server side
		instanceBaseUrl = clientBaseUrl.replace ( /client$/g, "" );
		guessApiUrl = instanceBaseUrl + "/ws/default/dataset-info";

		await $.getJSON ( guessApiUrl, js => {
		// Initially, I've tried: api_url = await $.getJSON(...), but
		// no idea why in this case api_url is set to js, instead of this returnvalue
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
var freegenelist_limit= 20; // default gene list search limit for free user (Pro: unlimited).
var knetview_limit= 10; 
