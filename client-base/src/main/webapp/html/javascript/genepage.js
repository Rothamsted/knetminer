var knetmaps;
var genemaps; 

$(document).ready(function(){
    

  setupApiUrls()
  .then(function(){

	var urlParams = (new URL(window.location.href)).searchParams; 
    var keywords = urlParams.get("keyword"); 
    var list = urlParams.get('list'); 
    $('#search-gene').html(`${list} (blue triangles with yellow label)`)

    // conditionals address the case where keyword value is empty
    if(keywords !== ''){
        console.log(keywords);
        $('#search-keyword').html(keywords)
    }else{
        $('#keyword-section').hide();
        console.log(keywords);
    }
    
    getSpeciesInformation(); 

    generateCyJSNetwork(api_url + '/network',{keyword:keywords, list:[list],exportPlainJSON:false});
    loginUtilsInit();
    knetmaps = KNETMAPS.KnetMaps();
    $('#NetworkCanvas').show();
  }).catch ( 
		err => showApiInitResult ( err )
	);
   
})

// function calls {api-url + /dataset-info} to get instance id
function getSpeciesInformation(){
    $.get(api_url + '/dataset-info','').done( function(data){
        var speciesInfo = data.id
        $('#search-taxid').html(speciesInfo); 
    })
}