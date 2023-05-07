

/*
 * Filters gene or evidence table by the selected Concept Type (coming from the legend).
 *  
 * DO NOT call me directly, use the wrappers below.
 * 
 * @param {type} the concept type ID from the legend to be used as filter key
 * @param {tableId} the HTML ID of the table to filter 
 * @param {revertButtonId} the ID of the filter reset button
 * @param {rowFilterPredicate} a function (selectedTypes, tableRow) => boolean tells if the
 *        concept type(s) associated to a target table row are selected by the current selection
 *        from the legend, selectedTypes. The criteria are different for the two tables, see the
 *        invocations below. 
 */
function _filterKnetTableByType ( 
	event, type, tableId, revertButtonId, rowFilterPredicate
) 
{
    updateLegendsKeys(type, tableId, event)
    try 
    {
			// Nothing to do if we aren't visible
      if ($('#' + tableId).css('display') !== 'block') return 

      // TODO: to be clarified why this is thrown into a body function data(),
      // which then returns a data array. WHY does it need to be so convoluted!?
      //
      // Also, this is not the gene view table ONLY anymore, WE NEED SOME TIDINESS! 
      var tableData = $('body').data().data [ tableId ];

      var selectedTypes = $(`#${tableId}`).data('keys');

      if (selectedTypes.length === 0) {
          // reset table if all legends are unselected
          document.getElementById( revertButtonId ).click();
          // and then we're finished in this case
          return
      } 
      
      // Select what required, using the helper
			var evidenceKeysArrays = tableData.filter ( row => rowFilterPredicate ( selectedTypes, row ) )


      // TODO: remove. Please pay attention to the cleaned version. We need some more common sense here, some
      /* more attention!
      var evidenceKeysArrays = []
      for (var tableRow in tableData )
      {
          // TODO: remove? this ends up being == tableId, if that's always the case, remove it
          // else, harmonise these IDs or use an additional parameter
          // var tableLocation = tableId.includes('resultsTable') ? 'resultsTable' : 'evidenceTable';
          
          // var selectedEvidence = setLegendsState(tableId, evidenceKeys, currentPosition, selectedKeys);
          // if (selectedEvidence !== undefined) evidenceKeysArrays.push(selectedEvidence)
          
          if ( rowFilterPredicate ( selectedTypes, tableRow ) )
          	evidenceKeysArrays.push ( tableRow )
      } // for tableRow
      */

      if (evidenceKeysArrays.length > 0)
        createFilteredTable ( evidenceKeysArrays, tableId )
      else
      {
        $('#tablesorter').hide()
        $('#filterMessage').show();
        $('.num-genes-container').hide();
      }
    } 
    catch (err) {
        console.error ( "Error while selecting from concept legend", err );
    }
} // _filterKnetTableByType()

function filterGeneTableByType ( event, conceptType )
{
	const rowFilterPred = ( selectedTypes, tableRow ) => 
	{
		const rowEvidencesString = tableRow [ 9 ]
		if ( !rowEvidencesString ) return false // just in case
	 	// Splits the gene evidences string in the gene table into an array of evidences. 
	  // See the API for details about this format
	  const evidenceCountStrings = rowEvidencesString.split ( "||" )
		const rowEvidences = evidenceCountStrings.map ( evStr => evStr.split('__')[ 0 ] )
	  return selectedTypes.every ( t => rowEvidences.includes ( t ) ) 
	}
	
	_filterKnetTableByType ( 
		event, conceptType, "resultsTable", "revertGeneView", rowFilterPred 
	)
}

function filterEvidenceTableByType ( event, conceptType )
{
	const rowFilterPred = ( selectedTypes, tableRow ) => {
		const rowEvidencesString = tableRow [ 0 ]
	  return selectedTypes.some ( t => t == rowEvidencesString )
	}

	_filterKnetTableByType ( 
		event, conceptType, "evidenceTable", "revertEvidenceView", rowFilterPred 
	)
}


//  function updates, store and checks for non-active legend keys
function updateLegendsKeys(key, location, event) {

    const currentTable = $(`#${location}`)

    $(event.currentTarget).toggleClass('active-legend');

    // current keys stored using jquery.data() method
    var getKeys = currentTable.data('keys');

    //  if getKeys is empty
    if (!getKeys) currentTable.data({ keys: [key] });

    isKeyElementActive = $(event.currentTarget).hasClass('active-legend')

    //  if legends is not active function returns true to remove legend associated rows from table
    if (isKeyElementActive) {
        // pushing new keys to getKeys Array 
        getKeys.push(key);
    } else {
        var getCurrentIndex = getKeys.indexOf(key);
        if (getCurrentIndex > -1) getKeys.splice(getCurrentIndex, 1);
    }

    currentTable.data({ keys: getKeys });

}

// TODO: remove, AFTER having read the new version. 
// I don't know how it's possible to conceive things this way! Please, some more common sense, some
// more attention!
// Function sets the visibility state of Gene and Evidence legends  
/*
function setLegendsState(tableLocation, gene_evidences, currentRow, currentData) {
    switch (tableLocation) {
        case "resultsTable":
            if (currentData.every(keys => gene_evidences.includes(keys))) {
                return currentRow;
            }
            break;
        case "evidenceTable":
            if (currentData.some(keys => gene_evidences.includes(keys))) {
                return currentRow
            }
            break;
    }
}
*/

/**
 * @desc function creates table body for filtered geneview and evidence table
 * @param {*} filteredTable 
 * @param {*} table 
 */
async function createFilteredTable(evidenceKeysArrays, location) {

    $('#filterMessage').hide();
    $('#tablesorter').show();
    $('.num-genes-container').show();

    // returns totalpage and evidence and geneview actual length see( getTablePaginationData())
    var { totalPage, itemsLength } = tableHandler.saveTableData(evidenceKeysArrays);
    switch (location) {
        case 'resultsTable':
            var filteredBody = createGeneTableBody(evidenceKeysArrays, 1, totalPage);
            $('#geneTableBody').html('').append(filteredBody);
            break;
        case 'evidenceTable':
            var filteredBody = await createEvidenceTableBody(evidenceKeysArrays, 1, totalPage);
            $('#evidenceBody').html(filteredBody);
            break;
    }

    $(`#${location}`).find('.count').html(itemsLength);
    $(`#${location}`).find('.limit').html(evidenceKeysArrays.length);
}

