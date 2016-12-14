
window.onload= function () {
     // Display knowledge network Stats.
     fetchStats();
    };

/*
 * Function to read .tab file containing stats about the knowledge network & its mappings & to update 
 * them in the release.html webpage.
 */
function fetchStats() {
    var fileUrl= data_url +"latestNetwork_Stats.tab";
//console.log("Fetching Network stats from: "+ fileUrl);
    try {
     $.ajax({
        url:fileUrl,
        type: 'GET',
        dataType: 'text',
        async: true,
        timeout: 1000000,
        error: function(){						  
        },
        success: function(text){
    		var resp= text.split("\n");
                var totalGenes= fetchValue(resp[1]);
                var totalConcepts= fetchValue(resp[2]);
                var totalRelations= fetchValue(resp[3]);
                var geneEvidenceConcepts= fetchValue(resp[4]);
                var minValues= fetchValue(resp[6]);
                var maxValues= fetchValue(resp[7]);
                var avgValues= fetchValue(resp[8]);
                // calculate concept occurrence percentage.
                var conceptPercentage= (geneEvidenceConcepts / (totalConcepts-totalGenes))*100;
                conceptPercentage= conceptPercentage.toFixed(1);

                // Display stats data.
                var statsText= "<br/><ul><li>Total number of genes: "+ totalGenes +"</li>"+
                        "<li>Total concepts: <strong>"+ totalConcepts +"</strong></li>"+
                        "<li>Total relations: <strong>"+ totalRelations +"</strong></li>"+
                        "<li>Concept2Gene #mappings: "+ geneEvidenceConcepts +" ("+ conceptPercentage +"%)</li>"+
                        "<li>Size of the gene-evidence networks:"+
                        "<ul><li>Min.: "+ minValues +"</li>"+
                        "<li>Max.: "+ maxValues +"</li>"+
                        "<li>Average: "+ avgValues +"</li></ul>"+
                        "</li></ul>";
//console.log("stats: "+ statsText);
                $("#network_stats").append(statsText);
	}
      });
    }
  catch(err) { console.log("Error occurred while retrieving Network details: \n"+ err.message +"\n"+ err.stack); }
}

 function fetchValue(valText) {
  var start= valText.indexOf(">");
  var end= valText.indexOf("</");
  var val= valText.substring(start+1, end);
  return val;
 }