// See the main POM for details.

// TODO: get it from the API
var api_base_url = "${knetminer.api.baseUrl}";
var api_url = "${knetminer.api.url}";

// WHAT THE HELL IS THIS?!?
// var multiSpecieUrl = "${knetminer.api.versionUrl}"
//
// TODO: no! This IS NOT the URL to multi-specie, it's the URL to get dataset information, and 
// very likely, there is NO NEED to define a constant to just append a tail to api_url. 
// 
var multiSpecieUrl = api_url + "/dataset-info"

// TODO: to be removed, we shouldn't use it anymore with multi-specie code
// boolean, tells if the data set contains reference genome info  
var reference_genome = true; // TODO:newConfig remove the conditional code using this, now it's always true 

// TODO:newConfig, what is it? Do we need it as conditional?
var multiorganisms = false; // Code support the multi-organism case, but now it's disabled

// TODO:newConfig remove? Doesn't seem to be still in use
// var species_name = "${knetminer.specieName}";

var knetspace_api_host= "";

// TODO:newConfig probably it's poor Js, I've added this to utils::$.ready()
function setupKnetSpaceUrl ()
{
	$.get ( 
		api_url + "/dataset-info/knetspace-url", 
	  (url) => {
	    knetspace_api_host = url;
	  }
	);
}

var enforce_genelist_limit= true; // enforce free user search limits (true/false).

// TODO: why the hell are they here? It must come from API and from config
var freegenelist_limit= 20; // default gene list search limit for free user (Pro: unlimited).
var knetview_limit= 10; // default Gene View knetwork selction limit for KnetMaps for Free user (Pro: 200).

// TODO: get it from the API
var enableGA = "${knetminer.enableAnalytics}"; // from base knetminer POM for client-side JS to use
var ga_id = "${knetminer.gaIdUi}"; // ga_id from base knetminer POM for UI JS to use
