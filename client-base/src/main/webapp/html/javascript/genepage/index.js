var knetmaps;
var genemaps; 

$(document).ready(function(){
  setupApiUrls()
  .then(function(){

		var urlParams = (new URL(window.location.href)).searchParams; 
    var keywords = urlParams.get("keyword"); 
    var list = urlParams.get('list'); 
    $('#search-gene').html(list)
    $('#search-keyword').html(keywords)

    generateCyJSNetwork(api_url + '/network',{keyword:keywords, list:[list],exportPlainJSON:false});
    loginUtilsInit();	
    multiSpeciesFeature.init();	
    knetmaps = KNETMAPS.KnetMaps();
    $("#navbarselect-container").delete();
  }).catch ( 
		err => showApiInitResult ( err )
	);
   
})