 /*
  * Function to create interactive legend as summary for Gene View evidences.
  * @returns interactive Gene View summary legend <div>
  */
 function getInteractiveSummaryLegend(GeneView_fullText) {
  var evidences_rows= GeneView_fullText.split("\n");
//console.log("getInteractiveSummaryLegend()>> evidences_rows: "+ evidences_rows);

  var evidencesArr= new Array();
  for(var i=1; i < evidences_rows.length-1; i++) {
      var evi_value= evidences_rows[i].split("\t")[9].trim();
      if(evi_value !== "") {
         evidencesArr.push(evi_value);
        }
     }
//console.log("evidencesArr: "+ evidencesArr);

  var evidences_Summary= new Array();
  // Iterate through evidences and get counts for each evidence Concept Type.
  evidencesArr.forEach(function(evi) {
      var row_values= evi.trim().split("||");
      row_values.forEach(function(rv) {
//console.log("\t \t row_value: "+ rv);
          var evidence_elements= rv.trim().split("//");
//console.log("\t \t \t evidence_elements: "+ evidence_elements);
          // add to Array evidence_elements[0] & length-1
          var conType= evidence_elements[0].trim();
          var conCount= evidence_elements.length-1;
        //  console.log("\t type: "+ conType +", count: "+ conCount);
          for(var k=1; k <= conCount; k++) {
              var type_evi= conType +"|"+ evidence_elements[k].trim();
              //console.log("\t \t type_evi: "+ type_evi);
              
              if(!evidences_Summary.includes(type_evi)) {
                 evidences_Summary.push(type_evi);
            //	 console.log("\t \t \t New/unique type_evi: "+ type_evi +" Saved!");
                }
             }
        });
     });
//console.log("evidences_Summary: "+ evidences_Summary);

   var evidence_Types= {}; // new Object();
  // For each line in evidences_Summary array, split by |, take cell 0 (type) and store with count.
  evidences_Summary.forEach(function(evidence) {
	var evidenceType= evidence.split("|")[0].trim();
//	console.log("evidence_Types["+evidenceType+"]: "+ evidence_Types[evidenceType]);
	if(evidenceType in evidence_Types) { // increment count
	   var eviCount= evidence_Types[evidenceType] + 1;
	   evidence_Types[evidenceType]= eviCount;
	   //console.log("\t"+ evidenceType +", count= "+ evidence_Types[evidenceType]);
	  }
	  else { // add
	   evidence_Types[evidenceType]= 1; // new entry
	   //console.log("\t"+ evidenceType +" Added...; count="+ evidence_Types[evidenceType]);
	  }
  });
//console.log("Legend>> evidence_Types: "+ JSON.stringify(evidence_Types));

  // Display evidence icons with count and name in legend.
  //var legend= '<div id="evidence_Summary_Legend" class="evidenceSummary">'+ '<div id="evidenceSummary2" class="evidenceSummary" title="Click to filter by type">';
  var legend= '<div id="evidenceSummary2" class="evidenceSummary" title="Click to filter by type">';
  var summaryText = '';
  for(var key in evidence_Types){
      var contype= key.trim();
	  if (key !== "Trait") {
	      summaryText = summaryText+'<div class="evidenceSummaryItem"><div class="evidence_item evidence_item_'+key+'" onclick=filterTableByType("'+contype+'"); title="'+key+'"></div>'+evidence_Types[key]+'</div>';
		 }
	  else { // For Trait, display tooltip text as GWAS instead.
	    summaryText = summaryText+'<div class="evidenceSummaryItem"><div class="evidence_item evidence_item_'+key+'" onclick=filterTableByType("'+contype+'"); title="GWAS"></div>'+evidence_Types[key]+'</div>';
	   }
	 }

 // legend= legend + summaryText +'</div>' +'<input id="revertGeneView" type="button" value="Undo All" onclick="revertGeneViewTable(\''+GeneView_fullText.trim()+'\');" title= "Revert all filtering changes"></div>';
  legend= legend + summaryText +'</div>';
  return legend;
 }

  /*
  * Function
  * Filter visible table by selected Concept Type
  */
 function filterTableByType(key) {
  console.log("filterTableByType: "+ key);
  // Check which Tab user is on: Gene View or Evidence View
  if ($('#resultsTable').css('display') === 'block') {
//      $("#loadingDiv_GeneView").css("display","block"); // notify
      // get tbody
    //  $('#tablesorter').children('tbody');
	  var gvTable= /*$('#tablesorter');*/ document.getElementById("tablesorter");
	  var rowLength= gvTable.rows.length;
//	  console.log("rows= "+ rowLength +", columns= "+ gvTable.rows[0].cells.length);
	  for(var i=1; i < rowLength; i++) { // i=1 to skip title row
	      var currentRow= gvTable.rows.item(i);
	      // get cells of current row
		  var gv_cells = currentRow.cells;
	//	  var gene_acc= gv_cells.item(0).innerHTML; // Accession
		  var gene_evidences= gv_cells.item(gv_cells.length-2).innerHTML; // Evidences
  	      // if this Accession doesn't have key in evidences, hide the row.
		  if(!gene_evidences.includes(key)) {
//		  console.log("gene_acc: "+ gene_acc +"; evidences: "+ gene_evidences);
		     // hide row
			 currentRow.style.display= 'none';
		    }
	     }
//      $("#loadingDiv_GeneView").css("display","none"); // // clear
     }
 }
