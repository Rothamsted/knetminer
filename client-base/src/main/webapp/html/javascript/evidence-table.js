

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
 * @param evidenceTable: the evidence table data, as it comes from the API, after being turned into
 * a matrix and after bean cleane of header and empty trailer (see data-utils.js:handleViewCreation()).
 * 
 * @param selectedSize: how many rows to display. This is non-null when the function is called by the
 * bottom size selector. When null (the default), it shows up to 100 rows.  
 * 
 * @param doSortTable: if true, the table needs to be sorted. This is set to false whem the 
 * first caller gets the table from the API and with the API-level sorting option set. DO NOT
 * remove the conditional code that depend on this flag, since we're still not sure how well
 * this server-side sorting performs. 
 
 */
async function createEvidenceTable( evidenceTable, doSortTable=false ) 
{
    var table = "";
    var {totalPage,itemsLength} = tableHandler.saveTableData(evidenceTable,'evidenceTable');

    // set current table data for infinite scrolling
    $('#evidenceTable').html("<p>No evidence found.</p>");
       
    if(evidenceTable.length == 0) return null 

		// TODO: remove once the API change to sort is implemented (and invoked)
		// WARNING: I am OBVIUSLY talking of the WHOLE block (if + its body), if you remove the 
		// if only, you'll end up doing the OPPOSITE of what it's meant!
		if ( doSortTable )
		{
	    evidenceTable.sort ( function( row1, row2 )
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
	    }); // evidenceTable.sort ()
		} // if doSortTable

        
    // Evidence View: interactive legend for evidences.
    var eviLegend = getEvidencesLegend(evidenceTable);
    table = '';
    table = table + '<div class="gene_header_container">' + eviLegend + '<input id="revertEvidenceView" type="button" value="" class="unhover" title= "Revert all filtering changes"></div><br>';
    table = table + '<div id= "evidenceViewTable" class="scrollTable">';
    table = table + '<table id="tablesorterEvidence" class="tablesorter">';
    table = table + '<thead>';
    table = table + '<tr>';

    table = table + '<th width="75">Omit/Add</th>';
    table = table + '<th width="50">Type</th>';
    table = table + '<th width="212">Node label</th>';
    table = table + '<th width="78"> P-Value <span id="pvalue" class="hint hint-small"> <i class="fas fa-info-circle"></i></span> </th>';
    table = table + '<th width="70">Genes <span id="genesHint" class="hint hint-small"> <i class="fas fa-info-circle"></i></span></th>';
    table = table + '<th width="103">Gene List  <span id="genelistHint" class="hint hint-small"> <i class="fas fa-info-circle"></i></span> </th>';
    table = table + '<th width="70">Select</th>';
    table = table + '</tr>';
    table = table + '</thead>';
    table = table + '<tbody class="scrollTable" id="evidenceBody">';
    var tableBody = await createEvidenceTableBody(evidenceTable,1,totalPage)
    table = table + tableBody; 
    table = table + '</tbody>';
    table = table + '</table>';
    table = table + '</div><div class="evidence-footer">';
    table = table + '<div class="evidence-select"><span>Showing <span id="evidenceCount" class="count">'+itemsLength+'</span> of <span class="limit">'+evidenceTable.length+'</span></span></div>';
    table = table + '<div class="gene-footer-container"><div class="gene-footer-flex" ><div id="evidence-count" class="selected-genes-count"><span style="color:#51CE7B; font-size: 14px;">No terms selected</span></div>';
    table = table + '<button onclick="generateMultiEvidenceNetwork(event)" id="new_generateMultiEvidenceNetworkButton" class="non-active btn knet_button" title="Render a knetwork of the selected evidences">Create Network</button></div></div>';

    $('#evidenceTable').html(table);

    // TODO: tablesorter seems to perform same sorting functionality as 
    // TODO: (MB) as what? Yes, this initially sorts the rendered table with the same criteria as the 
    // initial data sorting. But the latter is needed before cutting the rows to 100.
    //  I don't know if this additional sorting is also needed to have the column sorting arrows displayed (or upon the
    // table re-creation). If not, remove it. Remove these comments when this is clarified.
    //
    tableSorterOpts = {
      textExtraction: function (node) { // Sort TYPE column
        var attr = $(node).attr('type-sort-value');
        if (typeof attr !== 'undefined' && attr !== false) {
            return attr;
        }
        var actualPvalue = $(node).attr('actual-pvalue');
        if (actualPvalue) return actualPvalue;
        return $(node).text();
      }
    }
    
    // Tell table sorter to sort it if not already done (server side)
    // TODO: as discussed and mentioned in #744, when this is not set, table sorter
    // doesn't draw the column header markers that show the column is sorted, so we
    // need a function to tweak them, as explained here:
    //
    // https://stackoverflow.com/questions/75778264/is-there-a-way-to-tell-jquery-tablesorter-that-the-table-is-already-sorted

    // Initial sorting is by p-value, user genes, total genes, node label
    // This ensures something significant if both pvalues and user genes are N/A and 0

    // TODO: check the numbers again, they don't seem to reflect the comment above
    var  sortingPositions = [[3, 0], [5, 1], [4, 1]]; 
    
    if ( doSortTable ) {
			// If it's the sorter that has to sort, then here there are the columns
    	tableSorterOpts.sortList = sortingPositions;
    }
        
    // initialise tablesorter 
    $("#tablesorterEvidence").tablesorter(); 

    
    if ( !doSortTable )
   	{
	    // Place the header sorting marks to columns that we already know to be sorted
	    // As you can see, we ONLY do it conditionally, ie, if the table is not sorted 
	    // by the table sorter, else, it sorts and places thes ticks on its own. 
     
    	for(var sortingIndex=0; sortingIndex < sortingPositions.length; sortingIndex++)
    	{
				// TODO: NO!!! As I tried to said multiple times, define A FUNCTION like:
				//    
				//   function setTableSorterHeaderTick ( tableId, columnIndex, isAscending = true )
				//  
				//  which does the things in the loop body (choose the right file for it, it's a small generic helper).
				//  Then invoke it like:
				//  
				//   for ( var sortPos in sortingPositions ) setTableSorterHeaderTick ( ... )
				//
        var getSortingDirection = sortingPositions[sortingIndex][1] == 0 ? 'tablesorter-headerDesc' : 'tablesorter-headerAsc'; 
        $(`#tablesorterEvidence thead tr:nth-child(1) th:nth-child(${sortingPositions[sortingIndex][0]})`).addClass(`${getSortingDirection} tablesorter-headerSorted`);
    	}
    } // if ( doSortTable )
    
    /*
     * Revert filtering changes on Evidence View table
     */
    $("#revertEvidenceView").click(function (e) {
        createEvidenceTable(evidenceTable,false); // redraw table
        $('#evidenceTable').data({ keys: [] });
    });

    $("#revertEvidenceView").mouseenter(function (e) {
        $("#revertEvidenceView").removeClass('unhover').addClass('hover');
    });

    $("#revertEvidenceView").mouseout(function (e) {
        $("#revertEvidenceView").removeClass('hover').addClass('unhover');
    });


    // binds onscroll event to evidence table to add new rows after one seconds
    tableHandler.scrollTable('evidenceViewTable');
}

/*
 * Function to get the network of all "genes" related to a given evidence
 * 
 */
function evidencePath(concept, targetElement,genesCount) {
    
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
function openGeneListPopup(conceptId, element) {

    // remove existing tooltip to avoid duplication
    removeAccessionToolTips('copy_tooltip');
    removeAccessionToolTips('download_tooltip');


    // Modal popup DOM element
    var modalElement = $(`#modal_${conceptId}`);

    // Checking if modal element is already created for current conceptID
    if (modalElement.length) {

        // display already existing modal element
        modalElement.css({
            "display": 'block',
            "opacity": 1,
            "margin": '0 auto'
        });

        var modalOverlay = $(`#modal_${conceptId}-overlay`);

        modalOverlay.css({
            "display": 'block',
            "opacity": 1
        })

        // close modals with Overlay
        modalOverlay.bind("click", function (e) {
            e.preventDefault();
            modalElement.hide();
            modalOverlay.hide();
        })

        // close Modals with cancel button
        $('.jBox-closeButton').bind("click", function (e) {
            e.preventDefault();
            modalElement.hide();
            modalOverlay.hide();
        })

        triggerAccessionToolTips(conceptId);

    } else {
        var description = $(element).attr("data-description");
        var type = $(element).attr("data-type");
        var getTaxIdFrag = multiSpeciesFeature.getTaxId();

        $.get({ url: api_url + `/genome?keyword=ConceptID:${conceptId}`, data: '', timeout: 100000 })
        .done(function (data)
        {
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
                accessionList = []

                for (var accessionColumn = 1; accessionColumn < (currentData.length - 1); accessionColumn++) {
                    var accessionItem = currentData[accessionColumn].split("\t").slice(1, 2);
                    accessionList.push(accessionItem.join("\t"));
                }

                if (accessionList.length > 0) {
                    navigator.clipboard.writeText(accessionList.join("\n"));
                }

                evidenceNotice = '<span><b>Acession Copied to clipboard</b></span>'
                jboxNotice(evidenceNotice, 'green', 300, 2000);
                accessionModal.close()

            })

            triggerAccessionToolTips(conceptId);

        }).fail(function (xhr, status, errolog) {
            jboxNotice('An error occured, kindly try again', 'red', 300, 2000);
            

        })
    }
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
function removeAccessionToolTips(elementId) {
    var tooltipElement = $(`#${elementId}`)
    if (tooltipElement !== undefined) tooltipElement.remove();
}

// Function triggers tooltips mouse events for icons in genelist popup
function triggerAccessionToolTips(conceptId) {

    var accessionToolTip = createAccessionToolTips(`#copy-${conceptId}`, 'Copy gene accessions (for genelist search).', 'copy');

    var downloadToolTip = createAccessionToolTips(`#download-${conceptId}`, 'Download full table.', 'download');

    $(".accession-clipboard").mouseover(function (e) {
        e.preventDefault();
        accessionToolTip.open();
    })

    $(".accession-clipboard").mouseout(function (e) {
        e.preventDefault();
        accessionToolTip.close()
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
 * @see createTableSizeSelector()
 */
function createEvidenceTableSizeSelector ( selectedSize, tableSize )
{
	return createTableSizeSelector ( selectedSize, tableSize, false ) 
}


/**
 * @desc Core function to create the selector for the number of rows to be displayed in the gene or
 * evidence table.
 * 
 * WARNING: this is a wrapper of more specific functions and you shouldn't call it directly 
 * 
 * @param selectedSize: the number of the rows to be displayed
 *  
 * @param tableSize: the total number of rows of data availabe from API call
 * 
 * @param isGeneTable: true if you're calling me to render the selector for the gene table, else
 * I'm rendering the evidence table (they're slightly different).
 * 
 * TODO: this has become a generic function, so it should be moved to some other file
 * (probably, ui-utils.js) 
 */
// TODO: will extend function to serve genetable 
// TODO: (MB, 2003): what does this comment mean?
function createTableSizeSelector ( selectedSize, tableSize, isGeneTable )
{
    var sizeOpts = [50, 100, 200, 500, 1000];
    
    // The HTML selector ID depends on gene/evidence table
    // TODO: do we need them to have different IDs? Can we use the same ID and 
    // avoid this conditional?
    var selectElementId; 
    
    // Messages have 'Genes' qualifier in the gene table and '' in the evidence table
    var itemsLabel;
    if ( isGeneTable ) {
			selectElementId = "num-genes";
			itemsLabel = "Genes";
		}
		else {
			selectElementId = "evidence-select";
			itemsLabel = "";
		}
		 
		// if non-null, we always put a space before
		var itemsLabelStr = itemsLabel ? '' : ` ${itemsLabel}`
		 
    var selectButton = `<select value = "${selectedSize}" id = "${selectElementId}">\n`;
    for (var sizeOpt of sizeOpts){
        selectButton += `  <option value = "${sizeOpt}"${selectedSize == sizeOpt ? ' selected' : ''}>${sizeOpt} ${itemsLabelStr}</option>\n`
    }

    selectButton += `  <option value = "${tableSize}"${selectedSize == tableSize ? ' selected' : ''}>All${itemsLabelStr} (${tableSize})</option>\n`
    selectButton += '</select>\n'; 
    
    return selectButton; 
}

// function creates evidence table body
//
async function createEvidenceTableBody(evidenceTable, pageIndex,totalPage )
{

		// TODO: currentPage starts from 1 and pageIndex starts from 0?
		// Is this necessary? Can't we harmonise both to the 0-start convention?
		//
    var tableBody=""; 
    var pageStart = (pageIndex - 1) * 30;
    var pageEnds = pageIndex == totalPage ? evidenceTable.length : pageIndex * 30; 

    for (var ev_i = pageStart; ev_i < pageEnds; ev_i++)
    {   
        [type, nodeLabel,,pvalue,genes, geneList,,conceptId,genesCount, ...nonUsedValues] = evidenceTable[ev_i];

        // Prefer this templating style, at least for new code
        // Also, avoid "x = x + ...", it's more verbose, especially when it's needed many times
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
      if ( pageIndex == 1 ) return tableBody;
        // TODO: come on! This is nonsense.
        // There is no need for this function to deal with pageEnds and to return it to the caller.
        // Does the caller really need it? The value is set and changed here, in the lines below.
        // If the caller actually needs it, it's just a function like: 
        //   getTablePageLimits ( currentPageIdx, pageSize, tableSize ) = [begin, end + 1]
        // which could be called from wherever it's needed
        // Also, why are you returning back currentPage, if the caller already has it!?
        //
        // => The only thing that this function needs to return is tableBody, as a string
        // 
        // Similarly, this function doesn't need evidencePageCount as parameter, since it
        // can compute it with the same function above.
        //

        $('#evidenceBody').append(tableBody)
        $('#evidenceCount').html(pageEnds)
    }
    return null; // just to return something
}


/**
 * function handles scroll events for Geneview and Evidence view tables.
 * 
 * TODO: This is still a mess (2023-05-02), see previous notes and in particular: 
 *   - Why is it a singleton and not a class that can be instantiated twice, ideally inside the 
 *     function that manages the table and scrolling, not as a global variable
 *   - Why does it have two tables as fields? Renaming one into resultsTable means little, the point 
 *     is it shouldn't have two tables, cause there should be one object (class instance) per table, 
 *     not a singleton handling data from the two tables. This is simple OOP, please let's have 
 *     a brief call if you need further clarifications.
 * 
 * TODO: THIS IS INSANE! WE HAVE TO STOP TO PROGRAM THIS BADLY!
 * 
 * Programming is about THINKING, using logic, think about clean code organisation, CHANGE
 * existing code to adapt it to new features and needs, NOT MAKE ABSURD CONVOLUTIONS
 * around it.
 * 
 * This is a short block with an incredible amount of MESS: 
 * 
 * - The name tableEvents is wrong, this is about the infinite scrolling of two tables.
 *   STOP naming things randomly
 * - Why the hell do you need to manage two tables at the same time?! Why can't you have 
 *   ONE class and TWO instance objects, each with its own table to manage?
 * - Once it's a class, what's the point of having a global object? Why can't it be instantiated
 *   and used where it's needed, in the respective tables? 
 *  
 * More issues are reported below.
 * 
 */
tableHandler = function(){

    // Update: Tried using classes as recommended but found it diffcult to handle data changes because each instance will only have access data it was instantiated with. Currently investigating better approach as recommended. 
    var tableData

    function saveTableData(data){
        tableData = data
        var pageCount = Math.ceil(tableData.length/30)
        var itemsLength = tableData.length < 30 ? tableData.length : 30;
        
        var data =  {
            totalPage:pageCount,
            itemsLength:itemsLength
        }
    
        return data;
    }

    function scrollTable(table){

        var tableContainer = table == 'geneViewTable' ? 'resultsTable' : 'evidenceTable';
        var isTableScrollable;
        var tableElement =  $(`#${table}`);

        tableElement.scroll(function(e){
            if(isTableScrollable) return
            isTableScrollable = true; 

            // throtting to prevent hundreds of events firing at once
            setTimeout(function(){
                isTableScrollable = false; 
                
                const selectedtable = document.getElementById(table); 
                // checks if user reaches the end of page
                var tableOverflow =  selectedtable.scrollTop + selectedtable.offsetHeight >= selectedtable.scrollHeight;
                var itemsLength = $(`#${tableContainer}`).find('.count').text(); 
                console.log(itemsLength); 
                var currentPage = Math.ceil(+itemsLength/30);
                var totalPage  = Math.ceil(tableData.length/30);

                    // if user reaches end of the page new rows are created
                    if(tableOverflow && totalPage !== currentPage){
                        switch(table){
                            // creates evidence table 
                            case 'evidenceViewTable':
                            createEvidenceTableBody(tableData, currentPage + 1, totalPage)
                            break;
                            // creates geneview table
                            case 'geneViewTable':
                            createGeneTableBody(tableData,currentPage+1,totalPage)
                            break;
                        }
                    }
            }, 1000)
        })
    }

    return {saveTableData, scrollTable} 
}()
