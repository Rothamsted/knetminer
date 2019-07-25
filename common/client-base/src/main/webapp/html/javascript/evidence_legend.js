 /*
  * Function to create interactive legend for Evidence View.
  * @returns interactive Evidence View legend <div> for filtering
  */
 function getEvidencesLegend(ev_fullText) {
  var evi_view= ev_fullText.split("\n");
  
  var summaryArr = new Array();
  for(var i=1; i < evi_view.length-1; i++) {
      var evi= evi_view[i].split("\t")[0].trim();
      if(evi !== "") { summaryArr.push(evi); }
     }

  var evi_legend= new Map();
  // Iterate through evidence types and get counts for each evidence Concept Type.
  summaryArr.forEach(function(evi) {
      var eviType= evi.trim();
      // check/add unique evidence types to Map
          if(evi_legend.has(eviType)) {
             var old_count= evi_legend.get(eviType);
             evi_legend.set(eviType, old_count+1);
            }
          else { // add new evidence type to Map
              evi_legend.set(eviType, 1);
          }
     });

  // Display evidence icons with count and name in legend.
  var legend= '<div id="evidenceSummary1" class="evidenceSummary" title="Click to filter by type">';
  var summaryText = '';
  evi_legend.forEach(function(value, key, map) {
      var contype= key.trim();
      summaryText = summaryText + '<div class="evidenceSummaryItem"><div class="evidence_item evidence_item_' + key + '" onclick=filterEvidenceTableByType("'+contype+'"); title="' + key + '"></div>' + value + '</div>';
    //  summaryText = summaryText + '<div class="evidenceSummaryItem"><div class="evidence_item evidence_item_' + key + '" onclick=filterEvidenceTableByType("'+contype+'"); id="evi_' + key + '" title="' + key + '"></div>' + value + '</div>';
  });

  legend= legend + summaryText + '<input id="revertEvidenceView" type="button" value="" class="unhover" title= "Revert all filtering changes">'+'</div>';
  return legend;
 }

  /*
  * Function
  * Filter visible Evidence View table by selected Concept Type (from legend)
  */
 function filterEvidenceTableByType(key) {
  //console.log("Evidence View legend: filterEvidenceTableByType= "+ key);
  // Check which Tab user is on: Gene View or Evidence View
  try {
      // disable clicked button
    //  $('#evi_'+key).prop('disabled',true).css('opacity',0.5);
    //  if($('#evi_'+key).is(':disabled')) { console.log("already disabled..."); }
    //  else {
      if ($('#evidenceTable').css('display') === 'block') {
        // get tbody
        //  $('#tablesorterEvidence').children('tbody');
          var evTable= /*$('#tablesorterEvidence');*/ document.getElementById("tablesorterEvidence");
	  var rowLength= evTable.rows.length;
	  for(var i=1; i < rowLength; i++) { // i=1 to skip title row
	      var currentRow= evTable.rows.item(i);
	      // get cells of current row
		  var ev_cells = currentRow.cells;
		  var evType= ev_cells.item(1).innerHTML; // Evidences
		  if(!evType.includes(key)) {
                      // if evidences of this type are shown, hide those table rows.
                      //console.log("\t HIDE: evType: "+ evType);
                      currentRow.style.display= 'none';
		    }
                  else { // Else, show them to allow users to visualize multiple evidence types together
                      if (currentRow.style.display === 'none') {
                          //console.log("\t SHOW: evType: "+ evType);
			  currentRow.style.display= 'table-row';
                         }
                    }
	      }
           }
       //}
     }
     catch (err) {
         var errorMsg = err.stack + ":::" + err.name + ":::" + err.message;
         console.log(errorMsg);
        }
 }
