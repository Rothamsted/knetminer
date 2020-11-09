 /*
  * Function to create interactive legend as summary for Gene View evidences.
  * @returns interactive Gene View summary legend <div> for filtering
  */
 function getInteractiveSummaryLegend(GeneView_fullText) {
  var evidences_rows= GeneView_fullText.split("\n");

  var evidencesArr= new Array();
  for(var i=1; i < evidences_rows.length-1; i++) {
      var evi_value= evidences_rows[i].split("\t")[9].trim();
      if(evi_value !== "") {
         evidencesArr.push(evi_value);
        }
     }

  var con_legend= new Map();
  // Iterate through evidences and get counts for each evidence Concept Type.
  evidencesArr.forEach(function(evi) {
      var row_values= evi.trim().split("||");
      row_values.forEach(function(rv) {
          var conType= rv.trim().split("__")[0].trim();
          var conCount= Number(rv.trim().split("__")[1].trim());
          // check/add unique concept types to Map
          if(con_legend.has(conType)) {
             // update if this count is greater than old, stored count
             var old_count= con_legend.get(conType);
             if(Number(conCount) > Number(old_count)) { con_legend.set(conType, conCount); }
            }
          else { // add new conType to Map
              con_legend.set(conType, conCount);
          }
        });
     });

  // Display evidence icons with count and name in legend.
  //var legend= '<div id="evidence_Summary_Legend" class="evidenceSummary">'+ '<div id="evidenceSummary2" class="evidenceSummary" title="Click to filter by type">';
  var legend= '<div id="evidenceSummary2" class="evidenceSummary" title="Click to filter by type">';
  var summaryText = '';
  con_legend.forEach(function(value, key, map) {
      var contype= key.trim();
      if (key !== "Trait") {
          summaryText = summaryText+'<div class="evidenceSummaryItem"><div class="evidence_item evidence_item_'+key+'" onclick=filterTableByType("'+contype+'"); title="'+key+'"></div>'+value+'</div>';
	 }
      else { // For Trait, display tooltip text as GWAS instead.
          summaryText = summaryText+'<div class="evidenceSummaryItem"><div class="evidence_item evidence_item_'+key+'" onclick=filterTableByType("'+contype+'"); title="GWAS"></div>'+value+'</div>';
	 }
  });

  legend= legend + summaryText + '<input id="revertGeneView" type="button" value="" class="unhover" title= "Revert all filtering changes">'+'</div>';
  return legend;
 }

  /*
  * Function
  * Filter visible table by selected Concept Type
  */
 function filterTableByType(key) {
  //console.log("filterGeneTableByType: "+ key);
  // Check which Tab user is on: Gene View or Evidence View
  if ($('#resultsTable').css('display') === 'block') {
//      $("#loadingDiv_GeneView").css("display","block"); // notify
      // get tbody
    //  $('#tablesorter').children('tbody');
	  var gvTable= /*$('#tablesorter');*/ document.getElementById("tablesorter");
	  var rowLength= gvTable.rows.length;
	  for(var i=1; i < rowLength; i++) { // i=1 to skip title row
	      var currentRow= gvTable.rows.item(i);
	      // get cells of current row
		  var gv_cells = currentRow.cells;
	//	  var gene_acc= gv_cells.item(0).innerHTML; // Accession
		  var gene_evidences= gv_cells.item(gv_cells.length-2).innerHTML; // Evidences
  	      // if this Accession doesn't have key in evidences, hide the row.
		  if(!gene_evidences.includes(key)) {
		     // hide row
			 currentRow.style.display= 'none';
		    }
	     }
//      $("#loadingDiv_GeneView").css("display","none"); // // clear
     }
 }
