/**
 * Used in the evidence table, to render p-values nicely.
 */
function renderEvidencePvalue ( pvalueStr )
{
	const na = "N/A";
	
	if ( !pvalueStr ) return na;
	
	var pvalue = Number ( pvalueStr ); 

	// -1 is usually to mark that there is no p-value
	if ( pvalue < 0 ) return na;
	// for smaller values, use the scientific notation with a suitable no. of digit, eg, 1.1234E-8
	if ( pvalue < 1E-4 ) return pvalue.toExponential ( 4 ).toString ().toUpperCase();
	// for bigger values, just round to a good digit, eg, 0.0123
	return pvalue.toFixed ( 4 )	
}

function createEvidenceTable(text, keyword)
{
    var table = "";
    var summaryArr = new Array();
    var summaryText = '';
    $('#evidenceTable').html("<p>No evidence found.</p>");
    var evidenceTable = text.split("\n");
    if (evidenceTable.length > 2) {
        // Evidence View: interactive legend for evidences.
        var evi_legend= getEvidencesLegend(text);
        var utf8Bytes = "";
        utf8Bytes = encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
          });
        
        table = '';
        table = table + '<p class="margin_left"><a download="evidencetable.tsv" href="data:application/octet-stream;base64,' + btoa(utf8Bytes) + '" target="_blank">Download as TAB delimited file</a><br />';
        //table = table + '<div id="evidenceSummary1" class="evidenceSummary" title="Click to filter by type"></div>';
        // display dynamic Evidence Summary legend above Evidence View.
        table = table + '<div id="evidences_Legend" class="evidenceSummary">' + evi_legend + '</div>';
        table = table + '<div id= "evidenceViewTable" class = "scrollTable">';
        table = table + '<table id="tablesorterEvidence" class="tablesorter">';
        table = table + '<thead>';
        table = table + '<tr>';
        var header = evidenceTable[0].split("\t");
        table = table + '<th width="75">Omit/Add</th>';
        table = table + '<th width="50">' + header[0] + '</th>';
        table = table + '<th width="212">DESCRIPTION</th>';
        //table = table + '<th width="78">LUCENE ' + header[2] + '</th>';
        table = table + '<th width="78">' + header[3] + '</th>';
        table = table + '<th width="70">TOTAL ' + header[4] + '</th>';
        table = table + '<th width="103">' + header[5] + '</th>';
        table = table + '<th width="70">Select</th>';
        table = table + '</tr>';
        table = table + '</thead>';
        table = table + '<tbody class="scrollTable">';

        var eviTableLimit= evidenceTable.length-1;
        if(eviTableLimit > 1000) { // limit evidence view table to top 1000 evidences
           eviTableLimit= 1001;
          }
       
        for (var ev_i = 1; ev_i < eviTableLimit; ev_i++) {
            values = evidenceTable[ev_i].split("\t");
            table = table + '<tr>';
           
            table = table + '<td><p id="evidence_exclude_' + ev_i + '" style="padding-right:10px;" class="excludeKeyword evidenceTableExcludeKeyword" title="Exclude term"></p>'+
                    '<p id="evidence_add_' + ev_i + '" class="addKeyword evidenceTableAddKeyword" title="Add term"></p></td>';

            //link publications with pubmed
            pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
            if (values[0] == 'Publication')
                evidenceValue = '<a href="' + pubmedurl + values[1].substring(5) + '" target="_blank">' + values[1] + '</a>';
            else
                evidenceValue = values[1];

            table = table + '<td type-sort-value="' + values[0] + '"><div class="evidence_item evidence_item_' + values[0] + '" title="' + values[0] + '"></div></td>';
            table = table + '<td>' + evidenceValue + '</td>';
            //table = table + '<td>' + values[2] + '</td>'; // TODO: remove? What was it?!
            
            var pvalue = values[3];
            // to tell table-sorter that it's a number
            var sortedPval = pvalue == isNaN ( pvalue ) ? 1 : pvalue
						table += "<td actual-pvalue = '" + sortedPval + "'>" + renderEvidencePvalue ( pvalue ) + "</td>";

            table = table + '<td>' + values[4] + '</td>';


            // For user genes, add option to visualize their Networks in KnetMaps via web services (api_url)
            var userGenes = 0;
            if (values[5].length > 0) {
                userGenes = 1; // i.e., min. 1 user gene found
                values[5] = values[5].trim();
                if (values[5].includes(",")) { // for multiple user genes
                    userGenes = values[5].split(",").length; // total user genes found
                }
                // launch evidence network using 'userGenes'.
                if(userGenes < 500) {
                    table = table + '<td><a href="javascript:;" class="userGenes_evidenceNetwork" title="Display in KnetMaps" id="userGenes_evidenceNetwork_' + ev_i + '">' + userGenes + '</a></td>';
                  }
                else {
                    table = table + '<td>' + userGenes + '</td>'; // user genes
                }
            }
            else {
                userGenes = 0;
                table = table + '<td>' + userGenes + '</td>'; // zero user genes
            }

            var select_evidence = '<input id="checkboxEvidence_' + ev_i + '" type="checkbox" name= "evidences" value="' + values[7]+':'+values[5] + '">';
            table = table + '<td>' + select_evidence + '</td>'; // eviView select checkbox
         
        }
        table = table + '</tbody>';
        table = table + '</table>';
        table = table + '</div>';
        table = table + '<div id="networkButton"><button id="new_generateMultiEvidenceNetworkButton" class="btn knet_button" title="Render a knetwork of the selected evidences">Create Network</button>';
        table = table + '</insert><div id="loadingNetwork_Div"></div></div>';


        $('#evidenceTable').html(table);

        $(".evidenceTableExcludeKeyword").bind("click", {x: evidenceTable}, function (e) {

            e.preventDefault();

            var targetID = $(e.target).attr("id");
            var evidenceNum = targetID.replace("evidence_exclude_", "");
            var values = e.data.x[evidenceNum].split("\t");

            if ($(e.target).hasClass("excludeKeyword")) {
            	if($("#keywords").val() === '') {
            	   $("#keywords").val('ConceptID:' + values[7]);
            	   $('#' + targetID).toggleClass('excludeKeywordUndo excludeKeyword');
            	   matchCounter();
            	  }
            	else { 
                 excludeKeyword('ConceptID:' + values[7], targetID, 'keywords');
                }
            } else {
            	if($("#keywords").val() === '') {
            	   $("#keywords").val('ConceptID:' + values[7]);
            	   $('#' + targetID).toggleClass('excludeKeywordUndo excludeKeyword');
            	   matchCounter();
            	  }
            	else { 
                 excludeKeywordUndo('ConceptID:' + values[7], targetID, 'keywords');
                }
            }
        });

        $(".evidenceTableAddKeyword").bind("click", {x: evidenceTable}, function (e) {

            e.preventDefault();

            var targetID = $(e.target).attr("id");

            var evidenceNum = targetID.replace("evidence_add_", "");

            var values = e.data.x[evidenceNum].split("\t");

            if ($(e.target).hasClass("addKeyword")) {
            	if($("#keywords").val() === '') {
            	   $("#keywords").val('ConceptID:' + values[7]);
            	   $('#' + targetID).toggleClass('addKeywordUndo addKeyword');
            	   matchCounter();
            	  }
            	else { 
                 addKeyword('ConceptID:' + values[7], targetID, 'keywords');
                }
            } else {
            	if($("#keywords").val() === '') {
            	   $("#keywords").val('ConceptID:' + values[7]);
            	   $('#' + targetID).toggleClass('addKeywordUndo addKeyword');
            	   matchCounter();
            	  }
            	else { 
                 addKeywordUndo('ConceptID:' + values[7], targetID, 'keywords'); 
                }
            }
        });

        /*
         * click handler for generating the evidence path network for total genes (UNUSED now)
         */
        $(".generateEvidencePath").bind("click", {x: evidenceTable}, function (e) {
            e.preventDefault();
            var evidenceNum = $(e.target).attr("id").replace("generateEvidencePath_", "");
            var values = e.data.x[evidenceNum].split("\t");
            evidencePath(values[7], []);
        });

        /*
         * click handler for generating the evidence path network for user genes (using user_genes and search keywords, passed to api_url
                * @author: Ajit Singh (19/07/2018)
         */
        $(".userGenes_evidenceNetwork").bind("click", {x: evidenceTable}, function (e) {
            e.preventDefault();
            // for user genes column in evidence view
            var evidenceNum = $(e.target).attr("id").replace("userGenes_evidenceNetwork_", "");
            var values = e.data.x[evidenceNum].split("\t");
            var evi_userGenes = values[5].trim(); // user gene(s) provided
            evidencePath(values[7], evi_userGenes.split(","));
        });
        
        $("#new_generateMultiEvidenceNetworkButton").click(function (e) {
            // new multi select checkboxes in evidence view to render knetwork via 'network' api
            generateMultiEvidenceNetwork(); 
        });

        $("#tablesorterEvidence").tablesorter({
            // sort by p-value (displayed in JS table as col3) in ascending order (0) in all cases
            sortList: [[3,0]],
            textExtraction: function (node) { // Sort TYPE column
                var attr = $(node).attr('type-sort-value');
                if (typeof attr !== 'undefined' && attr !== false) {
                    return attr;
                }
                var actualPvalue = $(node).attr ( 'actual-pvalue' );
                if ( actualPvalue ) return Number ( actualPvalue );
                return $(node).text();
            }
        });

        /*
         * Revert filtering changes on Evidence View table
         */
        $("#revertEvidenceView").click(function (e) {
            createEvidenceTable(text, keyword); // redraw table
        });
        
        $("#revertEvidenceView").mouseenter(function (e) {
            $("#revertEvidenceView").removeClass('unhover').addClass('hover');
        });
        
        $("#revertEvidenceView").mouseout(function (e) {
            $("#revertEvidenceView").removeClass('hover').addClass('unhover');
        });
    }
}



/*
 * Function to get the network of all "genes" related to a given evidence
 * 
 */
function evidencePath(id, genes) {
	
    var params = {keyword: 'ConceptID:'+id};
    if (genes.length > 0) {
        params.list = genes;
    }
    //console.dir(params);
	
    // Generate the Network in KnetMaps.
    //generateCyJSNetwork(api_url + '/evidencePath', params);
    // harmonized now to use 'network' api only
    generateCyJSNetwork(api_url + '/network', params);
}



/*
 * Function
 * Generates multi evidence network in KnetMaps
 * @author: Ajit Singh.
 */
function generateMultiEvidenceNetwork(){
    var evidence_ondexids_and_genes = [];
    var evidences_ondexid_list = "";
    var geneids = [];
    var ev_list = $("input[name=evidences");
    for(var i = 0; i < ev_list.length; i++) {
        if (ev_list[i].checked) {
            // each ev_list[i].value has evidence_ondexID:any_comma_separated_geneIDs
            evidence_ondexids_and_genes= ev_list[i].value.split(':');
            // get all saved ONDEXIDs and for each, add evidenceID and use for 'network' api
            evidences_ondexid_list= evidences_ondexid_list +' ConceptID:'+evidence_ondexids_and_genes[0]; // ondex IDs of all selected evidences via checkboxes
            var geneids_row= evidence_ondexids_and_genes[1].split(',');
            for(var j=0; j<geneids_row.length; j++) {
                // for each evidence ondexID (values[7]), find its values[5] geneIDs and add to a new unique list
                if(geneids.indexOf(geneids_row[j]) === -1) { 
                   geneids.push(geneids_row[j]); // insert unique geneID
                  }
               }
           }
       }
    //console.log("evidence terms elected: "+ evidences_ondexid_list);
    //console.log("Selected evidence(s) are linked to these user_genes: "+ geneids);
    if (evidences_ondexid_list === "") {
        $("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div"><b>Please select evidence terms.</b></div>');
    }
    else {
        var params = {keyword: evidences_ondexid_list};
	params.list = geneids;
        if(geneids.length>0 && geneids[0].length>1) { 
          // Generate the evidence knetwork in KnetMaps.
          generateCyJSNetwork(api_url + '/network', params);
	}
       else {
       	$("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div"><b>Search with a genelist to view network.</b></div>');
       }
    }
}