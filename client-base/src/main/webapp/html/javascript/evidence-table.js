

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
    
    // set current table data for infinite scrolling
    $('#evidenceTable').html("<p>No evidence found.</p>");
       
    if(tableData.length == 0) return null 

		evidenceTableScroller.setTableData ( tableData )
		const firstPageEnd = evidenceTableScroller.getPageEnd ()


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
    table += '<div class="gene_header_container">' + eviLegend + '<input id="revertEvidenceView" type="button" value="" class="unhover legends-reset-button" title= "Revert all filtering changes"></div><br>';
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

  // Checking if modal element is already created for current conceptID 

    let accessionCache = new EvidenceAccessionCache('accession-cache');
    let accessionData =  await accessionCache.apiHandler(conceptId); 
	
	if ( accessionData ){
        var accessionPopup = new AccessionPopupManager(element, conceptId, accessionData); 
        accessionPopup.showPopup()
    }


    $(".accession-clipboard").bind("click", function (e) {
        e.preventDefault();

        var accessionList = []
        for (var accessionColumn = 0; accessionColumn < accessionData.length; accessionColumn++) {
            var accessionItem = accessionData[accessionColumn].split("\t").slice(1, 2);

            accessionList.push(accessionItem.join("\t"))
        }

        accessionList.shift(); 

        navigator.clipboard.writeText(accessionList.join("\n"));
    
        evidenceNotice = '<span><b>Acession Copied to clipboard</b></span>'
        jboxNotice(evidenceNotice, 'green', 300, 2000);

    })
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
    

    // TODO: too much repeatition 

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
	// In this case, it doesn't do anything anyway and this prevents the scroller from 
	// failing.
	if ( !( tableData && tableData.length > 0 ) ) return
	
  var tableBody=""; 

	const fromRow = evidenceTableScroller.getPageStart ()
	const toRow = evidenceTableScroller.getPageEnd ()

	/**
	 * TODO: how can this work, if before we were looping on the fromRow/toRow window?
	 * 
	 * Is it because it now gets the rendered window only? If yes, remove fromRow, toRow declarations, 
	 * but then what's evidenceTableScroller for? 
	 * 
	 * if it's a bug, fix it with a loop over the right window 
	 */
  
  tableData.forEach( (evidence,index) => 
  {   
    let {conceptType, name, pvalue, totalGenesSize, geneList, nodeId, userGenesSize, userGeneAccessions } = evidence

    // Prefer this templating style, at least for new code
    // Also, avoid "x = x + ...", it's more verbose than +=, especially when
    // it's needed many times.
    //  
    tableBody +=`<tr>
                    <td>
                    <p onclick="evidenceTableExcludeKeyword(${nodeId},this,event)" id="evidence_exclude_${index}" style="padding-right:10px;" class="excludeKeyword evidenceTableExcludeKeyword" title="Exclude term"></p>
                        <p onclick="evidenceTableAddKeyword(${nodeId},this,event)" id="evidence_add_${index}" class="addKeyword evidenceTableAddKeyword" title="Add term"></p>
                    </td>`;

    //link publications with pubmed
    var evidenceValue;
    if (conceptType == 'Publication')
    {
    	pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
      evidenceValue = '<a href="' + pubmedurl + name.substring(5) + '" target="_blank">' + name + '</a>';
    }
    else
      evidenceValue = name;

    tableBody += `  <td type-sort-value="${conceptType}"><div class="evidence_item evidence_item_${conceptType}" title="${conceptType}"></div></td>\n`;
    tableBody += `  <td>${evidenceValue}</td>\n`;

    // p-values
    //
    pvalue = renderEvidencePvalue(pvalue);
    
    // to tell tableBody-sorter that it's a number
    var sortedPval = pvalue == isNaN(pvalue) ? 1 : pvalue

    tableBody += `  <td actual-pvalue='${sortedPval}'>${pvalue}</td>\n`;
    // /end:p-values


    // Count of all matching genes
    tableBody += `  <td ><span style="margin-right:.5rem;">${totalGenesSize}</span> <span data-type="${conceptType}" data-description="${name}" class="accession-download" onclick="openGeneListPopup(${nodeId},this)"><i class="fas fa-file-download"></i></span> <div id="concept${nodeId}"></div></td>\n`;

    // launch evidence network with them, if they're not too many.
    tableBody += `  <td><button data-genelist="${userGenesSize}" style="${geneList == 0 ? 'text-decoration:none;': null}" onclick="evidencePath(${nodeId},this,${totalGenesSize})"  class="userGenes_evidenceNetwork" title="Display in KnetMaps" id="userGenes_evidenceNetwork_${index}">${userGenesSize}</button></td>\n`;

    var select_evidence = `<input onchange="updateSelectedGenesCount('evidences', '#evidence-count', 'Term');" id="checkboxEvidence_${index}" type="checkbox" name= "evidences" value="${nodeId}:${userGeneAccessions}">`;
    tableBody += `  <td>${select_evidence}</td>\n`; // eviView select checkbox
  })
  
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


// a helper class to manage evidenceview genes Column Popup
class AccessionPopupManager
{
    /**
     * HTML ID of the element that is being clicked on.
     * This used by the {@link createPopupHeader creates popup header}. 
     * 
     */
    #htmlNode = null

    #conceptId = null
    #accessionData = null
    #tableNode = null;
    #popupNode  =null


    constructor(htmlNode,conceptId,data){
        this.#htmlNode = htmlNode;
        this.#conceptId = conceptId;
        this.#accessionData = data;
    }


    // Shows modal popup on trigger, method is called from the outside and handles popup creation and setting up Jbox
    showPopup(){

        if(!this.#accessionData) this.#setupErrorMessage(); 

        this.#createPopup(); 
        this.#setupJbox(); 
        triggerAccessionToolTips() 

    }

    /**
     * Internal method creates HTML objects for the genes column accession popup 
     */
    #createPopup(){


        const table = document.createElement('table');
        table.setAttribute('class','tablesorter')
        this.#tableNode = table;

        const tableContainer = document.createElement("div"); 
        tableContainer.setAttribute("class", "accession-popup-table");


        const pagination = this.#getPaginationHtml(); 
        const header = this.#getPopupHeader()

        this.#setTableHeader(['ACCESSION','GENE NAME', 'CHROMOSOME']); 
        this.#setTableBody();
        tableContainer.append(this.#tableNode); 

        // div with class accession-popup-container\
        const popupContainer  = document.createElement('div'); 
        popupContainer.setAttribute("class",'accession-popup-container'); 

        this.#popupNode = popupContainer; 

        popupContainer.append(tableContainer);
        popupContainer.append(header);  
        popupContainer.append(pagination); 
    
    }

    /** 
    *   setTableHeader() & setTableBody() methods creates table header and body HTML objects
     */
    #setTableHeader(headerTitles){
        var tableHeaderNode = this.#tableNode.createTHead();
        var row = tableHeaderNode.insertRow(0); 

        for(var headerIndex = 0; headerIndex < headerTitles.length; headerIndex++){
            row.insertCell(headerIndex).textContent = headerTitles[headerIndex];
        }

        this.#tableNode.append(tableHeaderNode);
    }

    #setTableBody(){

        var tableBodyNode = this.#tableNode.createTBody();
        var genesCount = this.#setPagination()

        for(var nodeIndex = 0; nodeIndex <  genesCount; nodeIndex++){
            var [accession, geneName, chromosome]  = this.#accessionData[nodeIndex].split("\t").slice(1, 4);
            const row = tableBodyNode.insertRow(nodeIndex);
            row.insertCell(0).textContent = accession
            row.insertCell(1).textContent = geneName
            row.insertCell(2).textContent = chromosome
        }

        this.#tableNode.append(tableBodyNode);

    }


    /**
     * Method creates a div HTML object that houses action icons and descriptions used to copy and download accessions from the popup
     * @returns popupHeader 
     */
    #getPopupHeader(){

        const description = $(this.#htmlNode).attr("data-description");
        const conceptType = $(this.#htmlNode).attr("data-type");

        const popupHeader = document.createElement("div")
        popupHeader.setAttribute("class", 'accession-popup-header')

        const popupParagraph = document.createElement("p")
        popupParagraph.setAttribute("class",'acession-popup-paragraph'); 
        popupParagraph.innerHTML = conceptType + ':' + description;

        const actionIcons = this.#setupIcons();
        popupHeader.append(popupParagraph);
        popupHeader.append(actionIcons)


        return popupHeader;
    
    }

    /**
     * Util method that creates icons for popup using array of object attributes.
     */
    #setupIcons(){

        const popupIcons = document.createElement("div"); 
        popupIcons.setAttribute("class", "accession-popup-icons");
          
        const iconAttributes = [
            {
                href: "javascript:;",
                class:"accession-clipboard",
                id:"copy-"+this.#conceptId,
                alt:"copy-accession",
                imgSrc: "copy.svg"
            }, 
            {
                href:this.#encodeData(),
                class:"accession-downloadicon",
                id:"download-"+this.#conceptId,
                alt:"download-accession",
                imgSrc: "Knetdownload.png",
                download:"Acession.tsv"
            }, 

        ]

        iconAttributes.forEach(parameter => {
            const hyperLink = document.createElement("a")

            hyperLink.setAttribute("id", parameter.id)
            hyperLink.setAttribute("class", parameter.class)
            hyperLink.setAttribute("href", parameter.href)

            if(parameter.id.includes('download')){
                hyperLink.setAttribute("download", 'download.tsv');
            }

            const createIcon = document.createElement("img")
            createIcon.setAttribute("src", 'html/image/'+ parameter.imgSrc)
            createIcon.setAttribute("alt", parameter.alt); 

            hyperLink.appendChild(createIcon)
            popupIcons.append(hyperLink); 
        })

        return popupIcons; 
    }

    /**
     * Util method sets accession popup row count looking at the total number of genes present. 
     * When genes count is higher than 500, method caps Genes count to 500 and return orginal length when less than 500.
     * Method is called internally below (#getPaginationHtml())
     */ 
    #setPagination(){
        return  this.#accessionData.length > 500 ? 500 : this.#accessionData.length;
    }

    /**
     * Method returns pagination HTML object based on genes Count computed above (setPagination).
    */
    #getPaginationHtml(){
        const  genesCount = this.#setPagination(); 

        if(genesCount < 500) return ''; 

        const accessionCount = document.createElement('span'); 
        accessionCount.setAttribute('class', 'accession-count'); 

        const boldText = document.createElement("span")
        boldText.setAttribute('class','accession-bold-font')
        boldText.textContent = 'Showing 500 genes.'

        const accessionTitle = document.createElement('span')
        accessionTitle.innerHTML = `Copy or Download (top right) for the full list.`;
        
        accessionCount.append(boldText);
        accessionCount.append(accessionTitle); 

        return accessionCount;
    }

    /**
     * returns error message triggered when no accesions are present for a gene
     */
    #setupErrorMessage(){
         evidenceNotice = '<span><b>Sorry, these genes have no accessions</b></span>'
        jboxNotice(evidenceNotice, 'red', 300, 2000);
        return null
    }

    /**
     * internal method encodes genetable data to UTF8 standard string used in setupIcons(). 
     */
    #encodeData(){

        var utf8Bytes = encodeURIComponent(this.#accessionData.join("\n")).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode('0x' + p1);
        })

        return 'data:application/octet-stream;base64,' + btoa(utf8Bytes) + '';
    }

    // methods setups Jbox modal taking paramters: selected row conceptId and create Popup HTML object. 
    #setupJbox(){

        var params ={
            id: 'modal_' + this.conceptId,
            animation: 'pulse',
            title: '<span><font size="3"><font color="#51CE7B">Gene List</font></font> <span id="accessionInfo" class="hint hint-small accessionInfo"><i  class="far fa-question-circle"></i> </span>',
            content: this.#popupNode.outerHTML,
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
        };

        const accessionModal = new jBox('Modal', params); 
        accessionModal.open()
    }
}


/** 
 * function to toggle geneview evidence column popups
*/
function toggleEvidencePopUp(event,toggleDuration,toggleAction){
	if ( event.currentTarget !== event.target )
	  // The event comes from a children, we don't deal with it
	  // This fixes #777
	  return true;
	  
	event.preventDefault();
	var targetname = $(event.target).attr("id").replace(toggleAction +'_', "");
	$("#" + targetname).slideToggle(toggleDuration);
}

