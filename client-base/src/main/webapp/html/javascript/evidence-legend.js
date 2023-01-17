/*
 * Function to create interactive legend for Evidence View.
 * @returns interactive Evidence View legend <div> for filtering
 */
function getEvidencesLegend(ev_fullText) {
    var evi_view = ev_fullText.split("\n");

    var summaryArr = new Array();
    for (var i = 1; i < evi_view.length - 1; i++) {
        var evi = evi_view[i].split("\t")[0].trim();
        if (evi !== "") { summaryArr.push(evi); }
    }

    var evi_legend = new Map();
    // Iterate through evidence types and get counts for each evidence Concept Type.
    summaryArr.forEach(function (evi) {
        var eviType = evi.trim();
        // check/add unique evidence types to Map
        if (evi_legend.has(eviType)) {
            var old_count = evi_legend.get(eviType);
            evi_legend.set(eviType, old_count + 1);
        }
        else { // add new evidence type to Map
            evi_legend.set(eviType, 1);
        }
    });

    // Display evidence icons with count and name in legend.
    var legend = '<div id="evidenceSummary1" class="evidenceSummary" title="Click to filter by type">';
    var summaryText = '';
    evi_legend.forEach(function (value, key, map) {
        var contype = key.trim();
        summaryText = summaryText + '<div  onclick=filterTableByType("' + contype + '","#evidenceTable",' + 1 + ',"tablesorterEvidence",event,"revertEvidenceView");  class="evidenceSummaryItem"><div class="evidence-icons evidence_item evidence_item_' + key + '"  title="' + key+ '"></div> <span style="font-weight:600; margin-right:.5rem;">' + key+ '</span> <span> ('+ value +') </span></div>';
    });

    legend = legend + summaryText + '</div>';
    return legend;
}
