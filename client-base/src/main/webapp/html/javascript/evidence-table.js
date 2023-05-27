

/**
 * Used in the evidence table, to render p-values nicely.
 */
function renderEvidencePvalue ( pvalueStr )
{
   const na = "N/A";

   if ( !pvalueStr ) return na;

   var pvalue = Number( pvalueStr );

   // -1 is usually to mark that there is no p-value
   if (pvalue < 0) return na;
   // for smaller values, use the scientific notation with a suitable no. of digit, eg, 1.1234E-8
   if (pvalue < 1E-4) return pvalue.toExponential(2).toString().toUpperCase();
   // for bigger values, just round to a good digit, eg, 0.0123
   return pvalue.toFixed(4)
}

/**
 * Used in the evidence table, get a plain number representing a signficant pvalue for 
 * computations. Eg, if none is defined, returns 1
 *
 */
function getEvidencePvalue ( pvalueStr )
{
   if ( !pvalueStr ) return 1;

   var pvalue = Number ( pvalueStr );

   // -1 is usually to mark that there is no p-value
   if ( pvalue < 0 ) return 1;
   
   return pvalue;	
}

/**
 * 
 * @desc Renders the evidence table from API output.
 * 
 * @param tableData: the evidence table data, as it comes from the API, after being turned into
 * a matrix and after been cleaned of header and empty trailer (see data-utils.js:createEvidenceView()).
 * 
 * @param doSortTable: if true, the table needs to be sorted. This is set to false whem the 
 * first caller gets the table from the API and with the API-level sorting option set. DO NOT
 * remove the conditional code that depend on this flag, since we're still not sure how well
 * this server-side sorting performs. 
 
 */
function createEvidenceTable( tableData, doSortTable=false ) 
{
    var table = "";
    
		evidenceTableScroller.setTableData ( tableData )
		const firstPageEnd = evidenceTableScroller.getPageEnd ()

    // set current table data for infinite scrolling
    $('#evidenceTable').html("<p>No evidence found.</p>");
       
    if(tableData.length == 0) return null 

		// TODO: remove once the API change to sort is implemented (and invoked)
		// WARNING: I am OBVIUSLY talking of the WHOLE block (if + its body), if you remove the 
		// if only, you'll end up doing the OPPOSITE of what it's meant!
		if ( doSortTable )
		{
	    tableData.sort ( function( row1, row2 )
	    {
	      // TODO: this damn column indices are popping up everywhere, either use the conversion to 
	      // meaning variables, or, if we have many of this row value accesses, consider to get them
	      // with a common function like:
	      //
        // function getEvidenceTableRowAsDict ( arrayRow ) {
        //   returns a dictionary object 'dict', with the meaningful keys, ie,
        //   dict.type, dict.nodeLabel, dict.pvalue...
        // }
	                                                    
        var [ pval1, nUserGenes1, totGenes1 ] = [ row1 [ 3 ], row1 [ 5 ], row1 [ 4 ] ]
        var [ pval2, nUserGenes2, totGenes2 ] = [ row2 [ 3 ], row2 [ 5 ], row2 [ 4 ] ]
                        
        pval1 = getEvidencePvalue ( pval1 )
        pval2 = getEvidencePvalue ( pval2 )
        if ( pval1 !== pval2 ) return pval1 - pval2
	        
        nUserGenes1 = Number ( nUserGenes1 )
        nUserGenes2 = Number ( nUserGenes2 )

        if ( nUserGenes1 !== nUserGenes2 )
            return nUserGenes2 - nUserGenes1 // descending order
        
        totGenes1 = Number ( totGenes1 )
        totGenes2 = Number ( totGenes2 )
        
        return totGenes2 - totGenes1 // descending order
	    }); // tableData.sort ()
		} // if doSortTable

    // Evidence View: interactive legend for evidences.
    var eviLegend = getEvidencesLegend(tableData);
    table = '';
    table += '<div class="gene_header_container">' + eviLegend + '<input id="revertEvidenceView" type="button" value="" class="unhover" title= "Revert all filtering changes"></div><br>';
    table += '<div id= "evidenceViewTable" class="scrollTable">';
    table += '<table id="tablesorterEvidence" class="tablesorter">';
    table += '<thead>';
    table += '<tr>';

    table += '<th width="75">Omit/Add</th>';
    table += '<th width="50">Type</th>';
    table += '<th width="212">Node label</th>';
    table += '<th width="78"> P-Value <span id="pvalue" class="hint hint-small"> <i class="fas fa-info-circle"></i></span> </th>';
    table += '<th width="70">Genes <span id="genesHint" class="hint hint-small"> <i class="fas fa-info-circle"></i></span></th>';
    table += '<th width="103">Gene List  <span id="genelistHint" class="hint hint-small"> <i class="fas fa-info-circle"></i></span> </th>';
    table += '<th width="70">Select</th>';
    table += '</tr>';
    table += '</thead>';
    table += '<tbody class="scrollTable" id="evidenceBody">';
    table += '</tbody>';
    table += '</table>';
    table += '</div><div class="evidence-footer">';
    table += '<div class="evidence-select"><span>Showing <span id="evidenceCount" class="count">'+firstPageEnd+'</span> of <span id = "evidenceTotal" class="limit">'+tableData.length+'</span></span></div>';
    table += '<div class="gene-footer-container"><div class="gene-footer-flex" ><div id="evidence-count" class="selected-genes-count"><span style="color:#51CE7B; font-size: 14px;">No terms selected</span></div>';
    table += '<button onclick="generateMultiEvidenceNetwork(event)" id="new_generateMultiEvidenceNetworkButton" class="non-active btn knet_button" title="Render a knetwork of the selected evidences">Create Network</button></div></div>';

    $('#evidenceTable').html ( table );
	createEvidenceTableBody ( tableData )
    

		// Deal with table sorting options, if they're enabled, see notes in init-utils.js
		var tableSorterOpts = {}
		
		if ( KNET_TABLES_SORTING_ENABLED )		
		{
			// This is used when the user start clicking on col headers cause they want to sort the table
			// DO NOT REMOVE. It is necessary IN ANY CASE, including when doSortTable == false   
	    tableSorterOpts = {
	      // deals with p-value, offering the actual value for sorting, rather than the
	      // formatted one
	      textExtraction: function (node) { 
	        var attr = $(node).attr ( 'type-sort-value' );
	        if ( typeof attr !== 'undefined' && attr !== false ) return attr;
	        var actualPvalue = $(node).attr ( 'actual-pvalue' );
	        if (actualPvalue) return actualPvalue;
	        return $(node).text();
	      }
	    }
	    
	    // Initial sorting is by p-value, user genes, total genes, node label
	    var  sortingPositions = [ [4, 0], [6, 1], [5, 1] ]; 
	    
	    if ( doSortTable )
				// If it's the sorter that has to sort, then here there are the columns
	    	tableSorterOpts.sortList = sortingPositions;
	  }
	  else
	  // !KNET_TABLES_SORTING_ENABLED 
	  {
			var disabledHeaders = Object.fromEntries ( 
				Array( tableData.length )
				.fill ( { sorter: false } )
				.map ( (x,i) => [i, x] ) 
			)
			tableSorterOpts.headers = disabledHeaders
	  
	  } // if KNET_TABLES_SORTING_ENABLED
    	
    $("#tablesorterEvidence").tablesorter( tableSorterOpts );
    	
    if ( KNET_TABLES_SORTING_ENABLED && !doSortTable )        
    {   
      
      // As explained in #744, place the header sorting marks to columns that we already know 
      // to be sorted.
      // As you can see, we ONLY do it conditionally, ie, if the table is not sorted 
      // by the table sorter, else, it sorts and places thes ticks on its own.
      for ( var sortingPosition of sortingPositions )
        setTableSorterHeaderTick( "tablesorterEvidence", sortingPosition [ 0 ], sortingPosition [ 1 ] == 0 )
    }
    
    /*
     * Revert filtering changes on Evidence View table
     */
    $("#revertEvidenceView").click(function (e) {
        createEvidenceTable(tableData,false); // redraw table
        $('#evidenceTable').data({ keys: [] });
    });

    $("#revertEvidenceView").mouseenter(function (e) {
        $("#revertEvidenceView").removeClass('unhover').addClass('hover');
    });

    $("#revertEvidenceView").mouseout(function (e) {
        $("#revertEvidenceView").removeClass('hover').addClass('unhover');
    });

    evidenceTableScroller.setupScrollHandler ()
}

/*
 * Function to get the network of all "genes" related to a given evidence
 * 
 */
function evidencePath(concept, targetElement, genesCount) {
    
    var genesList = $(targetElement).attr('data-genelist').trim().split(",");
    var params = { keyword: 'ConceptID:' + concept };
    if (geneList.length > 0) {
        params.list = genesList;
    }
    if(genesCount > 0)generateCyJSNetwork(api_url + '/network', params, false);
}


/*
 * Function
 * Generates multi evidence network in KnetMaps
 * @author: Ajit Singh.
 */
function generateMultiEvidenceNetwork(event) {
    
    var evidence_ondexids_and_genes = [];
    var evidences_ondexid_list = "";
    var geneids = [];
    
    var ev_list = $("input[name=evidences");
    for (var i = 0; i < ev_list.length; i++) {
        if (ev_list[i].checked) {
            // each ev_list[i].value has evidence_ondexID:any_comma_separated_geneIDs
            evidence_ondexids_and_genes = ev_list[i].value.split(':');
            // get all saved ONDEXIDs and for each, add evidenceID and use for 'network' api
            evidences_ondexid_list = evidences_ondexid_list + ' ConceptID:' + evidence_ondexids_and_genes[0]; // ondex IDs of all selected evidences via checkboxes
            var geneids_row = evidence_ondexids_and_genes[1].split(',');
            for (var j = 0; j < geneids_row.length; j++) {
                // for each evidence ondexID (values[7]), find its geneList geneIDs and add to a new unique list
                if (geneids.indexOf(geneids_row[j]) === -1) {
                    geneids.push(geneids_row[j]); // insert unique geneID
                }
            }
        }
    }

    var evidenceNotice;

    if (evidences_ondexid_list === "") {
        evidenceNotice = '<span><b>Please select evidence terms.</b></span>'
        jboxNotice(evidenceNotice, 'red', 300, 2000);
    }
    else {
        var params = { keyword: evidences_ondexid_list };
        params.list = geneids;
        if (geneids.length > 0 && geneids[0].length > 1) {
            getLongWaitMessage.createLoader('#'+event.target.id,'#tabviewer_content','Creating Network')
            // Generate the evidence knetwork in KnetMaps.
            generateCyJSNetwork(api_url + '/network', params, false);
        }
        else {
            $('.overlay').remove();
            $('#new_generateMultiEvidenceNetworkButton').html('Create Network');
            evidenceNotice = '<span><b>Search with a genelist to view network.</b></span>'
            new jBox('Notice', {
                content: evidenceNotice,
                color: 'red',
                autoClose: 2000,
                position: {
                    x: 45,
                    y: 252.9
                },
                target: '#revertEvidenceView',
                reposition: true
            });
        }
    }
}


//  Function creates popup showing table of accessions associated to a genes concept
async function openGeneListPopup(conceptId, element)
{
  // TODO: (remove after reading) how the hell was this indented?!
  
  // Checking if modal element is already created for current conceptID

	var description = $(element).attr("data-description");
	var type = $(element).attr("data-type");      
	var taxIdFrag = speciesSelector.getTaxIdUrlFrag();
	var request = api_url+'/genome?keyword=ConceptID:'+ conceptId
	
	let data = await webCacheWrapper.getCachedData(request);
	if ( !data )
    {
	  data = await $.get({ url:request, data: '', timeout: 100000 })
	  .done( rdata => {
            webCacheWrapper.cacheRequest ( request, rdata )
		})
		.fail(function (xhr, status, errolog) {
	    jboxNotice('An error occured, kindly try again', 'red', 300, 2000);
	    return null
	  })						
	}
	
	if ( data ) createGenesColPopup ( description, data, type, taxIdFrag, conceptId )
}

// Function creates tooltips for icons in genelist popup
function createAccessionToolTips(targetElement, content, element) {

    return new jBox('Tooltip', {
        target: `${targetElement}`, pointer: 'center', content: '<div style="tableStrings-align:center;width:160px;padding:0.25rem;font-size:0.75rem">' + content + '</div>', position: {
            x: 'center',
            y: 'top'
        },
        id: `${element}_tooltip`
    });
}


// Function removes tooltips for icons in genelist popup
function removeAccessionToolTips(){
    var tooltipElements = document.querySelectorAll('.jBox-Tooltip'); 
    
    tooltipElements.forEach(tooltipElement => {
        tooltipElement.remove()
    })
    // remove jbox overlay
   document.querySelector('.jBox-overlay').remove(); 

    // removes jbox overlay 
   document.querySelector('.jBox-Modal').remove(); 


}

// Function triggers tooltips mouse events for icons in genelist popup
function triggerAccessionToolTips() {
    var accessionToolTip  = createAccessionToolTips('.accession-clipboard', 'Copy gene accessions (for genelist search).', 'copy');
    var downloadToolTip = createAccessionToolTips('.accession-downloadicon', 'Download full table.', 'download');
    

    $(".accession-clipboard").mouseover(function (e) {
        e.preventDefault();
      accessionToolTip.open();
    })

    $(".accession-clipboard").mouseout(function (e) {
        e.preventDefault();
        accessionToolTip.close();
    })

    $(".accession-downloadicon").mouseover(function (e) {
        e.preventDefault();
        downloadToolTip.open();
    })

    $(".accession-downloadicon").mouseout(function (e) {
        e.preventDefault();
       downloadToolTip.close();
    })

}

/**
 * @desc function toggles 'NOT conceptId' to keyword search input
 * @param  * takes row conceptId, event object and current Target Element
 */
function evidenceTableExcludeKeyword(conceptId, targetElement,event){
    event.preventDefault();
    var targetID = $(targetElement).attr("id");

    if ($(event.target).hasClass("excludeKeyword")) {
            excludeKeyword('ConceptID:' + conceptId, targetID, 'keywords');
    } else {
            excludeKeywordUndo('ConceptID:' + conceptId, targetID, 'keywords');
    }
}

/**
 * @desc function toggles 'OR conceptId' to keyword search input
 * @param  * takes row conceptId, event object and current Target Element
 */
function  evidenceTableAddKeyword(conceptId, targetElement, event) {

    event.preventDefault();
    var  targetId = $(targetElement).attr('id');

    if ($(event.target).hasClass("addKeyword")) {
        addKeyword('ConceptID:' + conceptId,targetId)
    } else {
        addKeywordUndo('ConceptID:' + conceptId, targetId , 'keywords');
    }
}


/**
 * @desc creates the evidence table body for a data window and places it in the DOM
 * @param {tableData} evidence table data, as it comes from the API and turned into a nested array (see TODO).
 * 
 * The function considers the current page available in evidenceTableScroller.getPage() and 
 * shows that window only.
 */
function createEvidenceTableBody ( tableData, doAppend = false )
{
  var tableBody=""; 

	const fromRow = evidenceTableScroller.getPageStart ()
	const toRow = evidenceTableScroller.getPageEnd ()

  for (var ev_i = fromRow; ev_i < toRow; ev_i++)
  {   
    [type, nodeLabel,,pvalue,genes, geneList,,conceptId,genesCount, ...nonUsedValues] = tableData[ev_i];

    // Prefer this templating style, at least for new code
    // Also, avoid "x = x + ...", it's more verbose than +=, especially when
    // it's needed many times.
    //  
    tableBody +=`<tr>
                    <td>
                    <p onclick="evidenceTableExcludeKeyword(${conceptId},this,event)" id="evidence_exclude_${ev_i}" style="padding-right:10px;" class="excludeKeyword evidenceTableExcludeKeyword" title="Exclude term"></p>
                        <p onclick="evidenceTableAddKeyword(${conceptId},this,event)" id="evidence_add_${ev_i}" class="addKeyword evidenceTableAddKeyword" title="Add term"></p>
                    </td>`;

    //link publications with pubmed
    var evidenceValue;
    if (type == 'Publication')
    {
    	pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
      evidenceValue = '<a href="' + pubmedurl + nodeLabel.substring(5) + '" target="_blank">' + nodeLabel + '</a>';
    }
    else
      evidenceValue = nodeLabel;

    tableBody += `  <td type-sort-value="${type}"><div class="evidence_item evidence_item_${type}" title="${type}"></div></td>\n`;
    tableBody += `  <td>${evidenceValue}</td>\n`;

    // p-values
    //
    pvalue = renderEvidencePvalue(pvalue);
    
    // to tell tableBody-sorter that it's a number
    var sortedPval = pvalue == isNaN(pvalue) ? 1 : pvalue

    tableBody += `  <td actual-pvalue='${sortedPval}'>${pvalue}</td>\n`;
    // /end:p-values


    // Count of all matching genes
    tableBody += `  <td ><span style="margin-right:.5rem;">${genes}</span> <span data-type="${type}" data-description="${nodeLabel}" class="accession-download" onclick="openGeneListPopup(${conceptId},this)"><i class="fas fa-file-download"></i></span> <div id="concept${conceptId}"></div></td>\n`;

    // launch evidence network with them, if they're not too many.
    tableBody += `  <td><button data-genelist="${geneList}" style="${geneList == 0 ? 'text-decoration:none;': null}" onclick="evidencePath(${conceptId},this,${genesCount})"  class="userGenes_evidenceNetwork" title="Display in KnetMaps" id="userGenes_evidenceNetwork_${ev_i}">${genesCount}</button></td>\n`;

    var select_evidence = `<input onchange="updateSelectedGenesCount('evidences', '#evidence-count', 'Term');" id="checkboxEvidence_${ev_i}" type="checkbox" name= "evidences" value="${conceptId}:${geneList}">`;
    tableBody += `  <td>${select_evidence}</td>\n`; // eviView select checkbox
  } 
  
  if ( tableBody )
  {
		const bodyContainer = $( '#evidenceBody' )
		if ( doAppend )
			bodyContainer.append ( tableBody ) 
		else
		{ 
			bodyContainer.html ( tableBody )

			// When replacing, let's update sorting too
			$( ".tablesorter" ).trigger ( 'update' );
		}
    
    // Update "x/y rows" label
    $('#evidenceCount').html ( toRow )
    $('#evidenceTotal').html ( tableData.length )
  }
}


// function creates genes column popup 
// TODO: will introduce HTML template style to table content and improve code quality in coming days. 
function createGenesColPopup(description, data, type, getTaxIdFrag,conceptId){

    if (data.geneTable !== null) {
        var geneTable = data.geneTable.split("\n");
        var accessionTable = "";
        accessionTable += '<div class="accession-popup-container">';
        accessionTable += '<div class="accession-popup-table"><table class="tablesorter">';
        accessionTable += '<thead>';
        accessionTable += '<tr>'
        accessionTable += '<th> ACCESSION </th>';
        accessionTable += '<th> GENE NAME</th>';
        accessionTable += '<th> CHROMOSOME </th></tr></thead><tbody>';

        var genesCount = geneTable.length >= 501 ? 501 : geneTable.length

        var genesCountMessage = geneTable.length >= 501 ? '<div style="display:flex; align-items:center; justify-items:center;margin:.5rem 0;"><span><b>Showing 500 genes.</b> Copy or Download (top right) for the full list.</span></div>' : '';


        for (var geneValue = 1; geneValue < (genesCount - 1); geneValue++) {
            var value = geneTable[geneValue].split("\t").slice(1, 4);
            accessionTable += '<tr><td>' + value[0] + '</td>';
            accessionTable += '<td>' + value[1] + '</td>';
            accessionTable += '<td>' + value[2] + '</td></tr>';
        };

        accessionTable += '</tbody></table></div>';

        if (geneTable.length > 0) {
            var result = geneTable.join("\n");

            var utf8Bytes = encodeURIComponent(result).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                return String.fromCharCode('0x' + p1);
            })

            var delimiterAttr = 'data:application/octet-stream;base64,' + btoa(utf8Bytes) + '';
            accessionTable += genesCountMessage;
            accessionTable += '<div class="accession-popup-header"><div><p style="margin-bottom: 0.5rem; margin-top:0.5rem;">TaxID: ' + getTaxIdFrag.replace('?taxId=', "") + '</p>';
            accessionTable += '<p style="margin-top: 0;"> ' + type + ': ' + description + '</p></div>';
            accessionTable += '<div class="accession-popup-icons">';
            accessionTable += '<a id="copy-' + conceptId + '" class="accession-clipboard" href="javascript:;"><img src="html/image/copy.svg" alt="copy-accession"/></a>';
            accessionTable += '<a id="download-' + conceptId + '" class="accession-downloadicon" download="Accession.tsv" href="' + delimiterAttr + '"><img src="html/image/Knetdownload.png" alt="download-accession"/></a></div></div>';
            accessionTable += '</div>';

            // creating Jbox accession element
            var accessionModal = new jBox('Modal', {
                id: `modal_${conceptId}`,
                class: 'accessionModal',
                animation: 'pulse',
                title: '<span><font size="3"><font color="#51CE7B">Gene List</font></font> <span id="accessionInfo" class="hint hint-small accessionInfo"><i  class="far fa-question-circle"></i> </span>',
                content: accessionTable,
                cancelButton: 'Exit',
                draggable: 'title',
                attributes: {
                    x: 'center',
                    y: 'center'
                },
                delayOpen: 50,
                onClose:function(){
                    removeAccessionToolTips();
                }
            });

            
            accessionModal.open()

        }

    } else {
        evidenceNotice = '<span><b>Sorry, these genes have no accessions</b></span>'
        jboxNotice(evidenceNotice, 'red', 300, 2000);
    }

    // copy clipboard event that allows users to copy accessions as comma seperated string.
    $(".accession-clipboard").bind("click", { x: data.geneTable }, function (e) {
        e.preventDefault();
        var currentData = e.data.x.split("\n");
        var  accessionList = []

        for (var accessionColumn = 1; accessionColumn < (currentData.length - 1); accessionColumn++) {
            var accessionItem = currentData[accessionColumn].split("\t").slice(1, 2);
            accessionList.push(accessionItem.join("\t"));
        }

        if (accessionList.length > 0) {
            navigator.clipboard.writeText(accessionList.join("\n"));
        }
        
        // popup to confirm navigator copied data to 
        evidenceNotice = '<span><b>Acession Copied to clipboard</b></span>'
        jboxNotice(evidenceNotice, 'green', 300, 2000);
        accessionModal.close()

    })

    triggerAccessionToolTips(conceptId);
}
