 /*
  * Function to create interactive legend as summary for Gene View evidences.
  * @returns interactive Gene View summary legend <div> for filtering
  */
function getInteractiveSummaryLegend(GeneView_fullText) {

  var evidencesArr= new Array();
  for(var i=1; i < GeneView_fullText.length; i++) {
      var evi_value= GeneView_fullText[i][9].trim();
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

			summaryText = summaryText + '<div style="font-weight:600;"  onclick=filterTableByType("'+contype+'","resultsTable",event,"revertGeneView");  class="evidenceSummaryItem"><div class="evidence-icons evidence_item evidence_item_'+key+'"  title="' + key + '"></div> '+ key +'</div>';
  });

  legend= legend + summaryText +'</div>';
  return legend;
}


  /*
  * Function
  * Filter visible Gene and Evidence View table by selected Concept Type (from legend)
  *0*/
function filterTableByType(key,location,event,revertButton) {       
           updateLegendsKeys(key,location,event)
     try{
         if ($('#'+location).css('display') === 'block') {

    
             var gvTable=  $('body').data().data[location];
             var rowLength=  gvTable.length;

             var selectedKeys = $(`#${location}`).data('keys'); 


             if(selectedKeys.length === 0 ){
                // reset table if all legends are unselected
                document.getElementById(revertButton).click();
             }else{
                    var evidenceKeysArrays = []
                    for(var tableIndex=0; tableIndex < rowLength; tableIndex++) {
                        var currentPosition = gvTable[tableIndex];

                        var evidenceKeys = location.includes('resultsTable') ? getGeneKeyTypes(currentPosition[9]): currentPosition[0] ;

                        var tableLocation = location.includes('resultsTable') ? 'resultsTable' : 'evidenceTable';
                        var selectedEvidence =  setLegendsState(tableLocation,evidenceKeys,currentPosition,selectedKeys);

                        if(selectedEvidence !== undefined) evidenceKeysArrays.push(selectedEvidence)
                    } 

                    if(evidenceKeysArrays.length > 0)
                    {
                        createFilteredTable(evidenceKeysArrays,location)
                    }else{
                        $('#tablesorter').hide() 
                        $('#filterMessage').show();
                        $('.num-genes-container').hide();
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

    const currentTable = $(`#${location}`)

     $(event.currentTarget).toggleClass('active-legend');

    // current keys stored using jquery.data() method
     var getKeys = currentTable.data('keys'); 
    
    //  if getKeys is empty
     if(!getKeys)currentTable.data({keys: [key]}); 

         isKeyElementActive = $(event.currentTarget).hasClass('active-legend')

        //  if legends is not active function returns true to remove legend associated rows from table
         if(isKeyElementActive){
             // pushing new keys to getKeys Array 
             getKeys.push(key);
         }else{
             var getCurrentIndex = getKeys.indexOf(key);
            if(getCurrentIndex > -1 )getKeys.splice(getCurrentIndex, 1);}
         
         currentTable.data({keys: getKeys}); 
         
     
 }

// Function sets the visibility state of Gene and Evidence legends  
 function setLegendsState(tableLocation,gene_evidences,currentRow,currentData){
    switch(tableLocation){
        case "resultsTable":
            if(currentData.every(keys => gene_evidences.includes(keys))){
                return currentRow; 
            }
            break;
        case "evidenceTable":
            if(currentData.some(keys => gene_evidences.includes(keys))){
               return currentRow
            }
            break;
    }
 }
 
 
/**
 * @desc function creates table body for filtered geneview and evidence table
 * @param {*} filteredTable 
 * @param {*} table 
 */
 async function createFilteredTable(evidenceKeysArrays,location){

        $('#filterMessage').hide();
        $('#tablesorter').show();
        $('.num-genes-container').show();

        var{rows,totalPage,shownItems}= createPaginationForTable(evidenceKeysArrays); 
        var itemsCount = location == 'resultsTable' ? ['geneCount','geneLimit'] : ['count','limit']; 

        switch(location){
            case 'resultsTable':
            var filteredBody = createGeneTableBody(evidenceKeysArrays,1,rows,totalPage);
            $('#geneTableBody').html('').append(filteredBody)
            break;
            case 'evidenceTable': 
            var filteredBody = await createEvidenceTableBody(evidenceKeysArrays,1,rows,totalPage)
            $('#evidenceBody').html(filteredBody);
            break; 
        }
        
        $(`#${itemsCount[0]}`).html(shownItems);
        $(`#${itemsCount[1]}`).html(evidenceKeysArrays.length);

        tableEvents.setTableData(evidenceKeysArrays,location);
 }

/**
 * @desc returns a list of evidence keys contained in genes evidence string 
 * @param {*} evidences 
 * @returns array of evidence keys 
 */ 
 function getGeneKeyTypes(evidences){
    var  evidencesList = []; 
    var evidencesCount = evidences.split("||")
    for(var evidenceIndex = 0; evidenceIndex < evidencesCount.length; evidenceIndex++){
        singleEvidence = evidencesCount[evidenceIndex].split('__')[0]; 
        evidencesList.push(singleEvidence); 
    }
    return evidencesList
 }
