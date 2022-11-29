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

  con_legend.forEach(function(value, key, map)
  {     
    var contype= key.trim();

			// Special tooltip for the Trait case.
			var summaryTextTitle = key == 'Trait'
				? "GWAS"
				: key; // For Trait, display tooltip text as GWAS instead.

			summaryText = summaryText + '<div  onclick=filterTableByType("'+contype+'","#resultsTable",'+4+',"tablesorter",event,"revertGeneView");  class="evidenceSummaryItem"><div class="evidence-icons evidence_item evidence_item_'+key+'"  title="' + summaryTextTitle + '"></div> <span style="font-weight:600;">'+ summaryTextTitle+'</span> <span style="margin-left:.25rem">('+value+')</span> </div>';
  });

  legend= legend + summaryText +'</div>';
  return legend;
 }


  /*
  * Function
  * Filter visible Gene and Evidence View table by selected Concept Type (from legend)
  *0*/
  function filterTableByType(key,location,sortingPosition,table,event,revertButton) {
           updateLegendsKeys(key,location,event)
     try{
         if ($(location).css('display') === 'block') {
             var gvTable=  document.getElementById(table);
             var rowLength= gvTable.rows.length;
             var currentData = $(location).data('keys'); 
             console.log(currentData);
             if(currentData.length === 0 ){
                // reset table if all legends are unselected
                document.getElementById(revertButton).click();
             }else{
                for(var i=1; i < rowLength; i++) { // i=1 to skip title row
                    var currentRow= gvTable.rows.item(i);
                    var gv_cells = currentRow.cells;
                    var gene_evidences = gv_cells.item(sortingPosition).innerHTML;
                        if(!currentData.every(keys => gene_evidences.includes(keys))){
                            $(currentRow).addClass('non-filter').removeClass('current-filter')
                        }else{
                            $(currentRow).addClass('current-filter').removeClass('non-filter');
                        }
                } 
                }
               
         }
     }catch (err) {
         var errorMsg = err.stack + ":::" + err.name + ":::" + err.message;
         console.log(errorMsg);
     }
    
 }
 
//  function updates, store and checks for non-active legend keys
 function updateLegendsKeys(key,location,event){

     $(event.currentTarget).toggleClass('active-legend');

    // current keys stored using jquery.data() method
     var getKeys = $(location).data('keys'); 
    
    //  if getKeys is empty
     if(getKeys == undefined){
         $(location).data({keys: [key]}); 
     }else{
         isKeyElementActive = $(event.currentTarget).hasClass('active-legend')
        //  if legends is not active function returns true to remove legend associated rows from table
         if(isKeyElementActive){
             // pushing new keys to getKeys Array 
             getKeys.push(key);
         }else{
             var getCurrentIndex = getKeys.indexOf(key);
             if(getCurrentIndex > -1 ){getKeys.splice(getCurrentIndex, 1);}
         }
         
         $(location).data({keys: getKeys}); 
         
     }
 }
