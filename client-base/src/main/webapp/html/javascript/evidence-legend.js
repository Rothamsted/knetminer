/*
 * Function to create interactive legend for Evidence View.
 * @returns interactive Evidence View legend <div> for filtering
 */
function getEvidencesLegend( evidenceTable )
{
	var types = evidenceTable.map ( row => row [ 0 ] )

  var eviLegend = new Map();
  // Iterate through evidence types and get counts for each evidence Concept Type.
  types.forEach(function (typeStr)
  {
		if ( typeStr == "" ) return; // shouldn't happen, but just in case
    var eviType = typeStr.trim();
    // check/add unique evidence types to Map
    if (eviLegend.has(eviType)) {
    	var old_count = eviLegend.get(eviType);
      eviLegend.set(eviType, old_count + 1);
    }
    else {
			// add new evidence type to Map
      eviLegend.set(eviType, 1);
    }
  });

  // Display evidence icons with count and name in legend.
  var legend = '<div id="evidenceSummary1" class="evidenceSummary" title="Click to filter by type">';
  var summaryText = '';
  eviLegend.forEach(function (value, key, map) {
    var contype = key.trim();
    // TODO: (not urgent) it has reached the length of 357 columns!
    // Can we split it into simpler blocks, using their semantics, eg, 
    // `<div onClick = ...
    //    <div class = ....
    // ...`
    summaryText = summaryText + '<div  onclick=filterKnetTableByType("' + contype + '","evidenceTable",event,"revertEvidenceView");  class="evidenceSummaryItem">';
    summaryText = summaryText + '<div class="evidence-icons evidence_item evidence_item_' + key + '"  title="' + key+ '"></div>';
    summaryText= summaryText + '<span style="font-weight:600; margin-right:.5rem;">' + key+ '</span> <span> ('+ value +') </span></div>';
  });

  legend = legend + summaryText + '</div>';
  return legend;
}
