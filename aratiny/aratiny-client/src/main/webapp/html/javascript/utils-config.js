// See the main POM for details.

// TODO:newConfig, remove
// var api_base_url = "${knetminer.api.baseUrl}";
var api_url = "";
// temporary solution, tried ways to working with setupApiUrls but not working for the release page
var ws_url = "${knetminer.api.url}"

// TODO: to be removed, we shouldn't use it anymore with multi-specie code
// boolean, tells if the data set contains reference genome info  
var reference_genome = true; // TODO:newConfig remove the conditional code using this, now it's always true 

// TODO:newConfig, what is it? Do we need it as conditional?
var multiorganisms = false; // Code support the multi-organism case, but now it's disabled

// TODO:newConfig remove? Doesn't seem to be still in use
// var species_name = "${knetminer.specieName}";

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

		// TODO: possibly manage an ultimate non-recoverable failure happening here.
		// Possibly use a nested try/catch
    try{
      await $.getJSON ( guessApiUrl, js => {
        // Initially, I've tried: api_url = await $.getJSON(...), but
        // no idea why in this case api_url is set to js, instead of this returnvalue
          api_url = instanceBaseUrl + "/ws/" + js [ "id" ]
        });

    }catch(e){

      console.log(e)
    }

  }

  // Set anything else that depends on it
  //

	// TODO: again, possibly manage this possible failure, with another try/catch
	
  // Same trick with this other API (including \n escaping)
  try{
    knetspace_api_host = await $.get (
      api_url + "/dataset-info/knetspace-url",
      ksUrl => ksUrl.replace ( /\n/g, "" )
    );
  
    return api_url; // just in case the invoker wants it
  }catch(e){
    console.log(e)
  }

}

var enforce_genelist_limit= true; // enforce free user search limits (true/false).

// TODO: why the hell are they here? It must come from API and from config
var freegenelist_limit= 20; // default gene list search limit for free user (Pro: unlimited).
var knetview_limit= 10; // default Gene View knetwork selction limit for KnetMaps for Free user (Pro: 200).

// TODO:newConfig remove, now we're getting this from doGoogleAnalytics()
/*var enableGA = "${knetminer.enableAnalytics}"; // from base knetminer POM for client-side JS to use
var ga_id = "${knetminer.gaIdUi}"; // ga_id from base knetminer POM for UI JS to use
*/