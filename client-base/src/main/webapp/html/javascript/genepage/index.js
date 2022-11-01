var knetmaps;
var genemaps; 

$(document).ready(function(){
  setupApiUrls()
  .then(function(){

		var urlParams = (new URL(window.location.href)).searchParams; 
    var keywords = urlParams.get("keyword"); 
    var list = urlParams.get('list'); 
    $('#search-gene').html(`${list} (blue triangles with yellow label)`)
    $('#search-keyword').html(keywords)

    generateCyJSNetwork(api_url + '/network',{keyword:keywords, list:[list],exportPlainJSON:false});
    loginUtilsInit();	
    multiSpeciesFeature.init();	
    knetmaps = KNETMAPS.KnetMaps();
  }).catch ( 
		err => showApiInitResult ( err )
	);
   
})