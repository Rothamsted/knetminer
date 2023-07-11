/**
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
 * @param {renderingFun} either createFilteredGenesTable or createFilteredEvidenceTable, see below 
 */
function _filterKnetTableByType ( 
	event, type, tableId, revertButtonId, rowFilterPredicate, renderingFun
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
      var filteredTable = tableData.filter ( row => rowFilterPredicate ( selectedTypes, row ) )

      if (filteredTable.length > 0)
        renderingFun ( filteredTable, tableId )
      else
      	toggleKnetTablesDisplay ( false )
    } 
    catch (err) {
        console.error ( "Error while selecting from concept legend", err );
    }
} // _filterKnetTableByType()

function filterGeneTableByType ( event, conceptType )
{
	const rowFilterPred = ( selectedTypes, tableRow ) => 
	{
		const { conceptEvidences } = tableRow
		if ( !conceptEvidences ) return false // just in case
	 	// Splits the gene evidences string in the gene table into an array of evidences. 
	  // See the API for details about this format
	  
	  /* TODO: remove, use the available facilities for these
	     operations
	  let evidences = []
	  for(let evidence in conceptEvidences){
		evidences.push(evidence)
	  } */
	  const rowEvidences = Object.keys ( conceptEvidences )
	  return selectedTypes.every ( t => rowEvidences.includes ( t ) ) 
	}
	
	_filterKnetTableByType ( 
		event, conceptType, "resultsTable", "revertGeneView", 
		rowFilterPred, createFilteredGenesTable 
	)
}

function filterEvidenceTableByType ( event, conceptType )
{
	const rowFilterPred = ( selectedTypes, tableRow ) => {
	  return selectedTypes.some ( t => t == tableRow.conceptType )
	}

	_filterKnetTableByType ( 
		event, conceptType, "evidenceTable", "revertEvidenceView", 
		rowFilterPred, createFilteredEvidenceTable 
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


/**
 * @desc Re-creates the table body for filtered geneview table
 *  
 */
async function createFilteredGenesTable ( filteredTable )
{
	toggleKnetTablesDisplay ( true )
	
	if ( filteredTable && filteredTable.length > 0 )
		genesTableScroller.setTableData ( filteredTable )
	
	createGeneTableBody ( filteredTable )	
}

/**
 * @desc Re-creates the table body for filtered evidence table
 *  
 */
async function createFilteredEvidenceTable ( filteredTable )
{
	toggleKnetTablesDisplay ( true )
	
	if ( filteredTable && filteredTable.length > 0)
		evidenceTableScroller.setTableData ( filteredTable )
	
	createEvidenceTableBody ( filteredTable )
}
 
 
/**
 * Manipulates the DOM to show genes/evidence table, or a no-row message.
 * 
 * @param {displayOn} a boolean
 */
function toggleKnetTablesDisplay ( displayOn ) 
{
		// TODO: If there is only ONE instance for each of these, then WHY do we have DIFFERENT
		// names/variables/objects that manage genes and evidence tables separately, as if there were
		// TWO instances of them?!?
		// NEEDS serious review for coherence!
	    $('#filterMessage').toggleClass('show-block',!displayOn); 
	    $('.num-genes-container').toggleClass('show-block',displayOn); 
		$('#tablesorter').toggleClass('hide',!displayOn);
}


