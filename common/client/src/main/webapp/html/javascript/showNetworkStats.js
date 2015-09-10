
window.onload= function () {
     // Display knowledge network Stats.
     fetchStats();
    };

/*
 * Function to read .tab file containing stats about the knowledge network & its mappings & to update 
 * them in the release.html webpage.
 */
function fetchStats() {
    var fileUrl= dataUrl +"Network_Stats.tab";
    try {
     $.ajax({
        url:fileUrl,
        type:'GET',
        dataType:'text',
        async: true,
        timeout: 1000000,
        error: function(){						  
        },
        success: function(text){
console.log("Stats>> response: "+ text);
    		var resp= text.split("\n");
                var totalGenes= fetchValue(resp[1]);
                var totalConcepts= fetchValue(resp[2]);
                var totalRelations= fetchValue(resp[3]);
                var geneEvidenceConcepts= fetchValue(resp[4]);
                var minValues= fetchValue(resp[6]);
                var maxValues= fetchValue(resp[7]);
                var avgValues= fetchValue(resp[8]);
                
                // Display stats data.
                var statsText= "Graph Stats:</br>"+"<ul><li>Total number of genes: "+ totalGenes +
                        "</li><li>Total concepts: "+ totalConcepts +"</li><li>Total Relations: "+ 
                        totalRelations +"</li><li>Concept2Gene #mappings: "+ geneEvidenceConcepts +
                        "</li><li>Size of the gene-evidence networks:<ul><li>Min.: "+ minValues +
                        "</li><li>Max.: "+ maxValues +"</li><li>Average: "+ avgValues +"</li></ul>"+
                        "</li></ul>";
                
                document.getElementByID('network_stats').innerHTML= statsText;
	}
      });
    }
  catch(err) { console.log("Error occurred while retrieving Network details: "+ err.stack); }
}

 function fetchValue(valText) {
  var start= valText.indexOf(">");
  var end= valText.indexOf("</");
  var val= valText.substring(start+1, end);
  return val;
 }