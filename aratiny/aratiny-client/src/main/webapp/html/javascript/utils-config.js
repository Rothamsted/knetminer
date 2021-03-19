// See the main POM for details.
var api_base_url = "${knetminer.api.baseUrl}";
var api_url = "${knetminer.api.url}";
// boolean, tells if the data set contains reference genome info  
var reference_genome = ${knetminer.isReferenceGenomeProvided};
var multiorganisms = false; // Code support the multi-organism case, but now it's disabled
var species_name = "${knetminer.specieName}";
var knetspace_api_host= "${knetminer.knetSpaceHost}"; // from base knetminer POM for client-side JS
var enableGA = "${knetminer.enableAnalytics}"; // from base knetminer POM for client-side JS to use
