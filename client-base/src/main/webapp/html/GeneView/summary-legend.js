
 /*
  * Filter visible Gene and Evidence View table by selected Concept Type (from legend)
  * 
  */
function filterKnetTableByType(key,location,event,revertButton) {       
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
    
        // returns totalpage and evidence and geneview actual length see( getTablePaginationData())
        var {totalPage,itemsLength} = tableHandler.saveTableData(evidenceKeysArrays,location); 

    switch(location){
        case 'resultsTable':
        var filteredBody = createGeneTableBody(evidenceKeysArrays,1,totalPage);
        $('#geneTableBody').html('').append(filteredBody);
        break;
        case 'evidenceTable': 
        var filteredBody = await createEvidenceTableBody(evidenceKeysArrays,1,totalPage); 
        $('#evidenceBody').html(filteredBody);
        break; 
    }

    $(`#${location}`).find('.count').html(itemsLength); 
    $(`#${location}`).find('.limit').html(evidenceKeysArrays.length); 
}

/**
 * @desc returns a list of evidence keys contained in genes evidence string 
 * @param {*} evidences string of evidence from API data, see(filterKnetTableByType())
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
