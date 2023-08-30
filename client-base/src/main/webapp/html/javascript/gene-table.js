/*
 * Function generate Geneview table and it shows once data is returned from function search keyword ajax calls
 *
 */
function createGenesTable ( tableData, keyword )
{
	var table = "";
	if (tableData.length > 0 )
	{
		genesTableScroller.setTableData ( tableData )
		const firstPageEnd = genesTableScroller.getPageEnd ()
		// Gene View: interactive summary legend for evidence types.
		var interactiveSummaryLegend = getInteractiveSummaryLegend(tableData);

		
		table += '<form name="checkbox_form">'
		table += '<div class="gene_header_container">';
		table += '<div id="filters">'+ interactiveSummaryLegend + '</div><div id="revertGeneView" class="legends-reset-button" title= "Revert all filtering changes"><i class="fas fa-undo  unhover"></i></div></div>';
		table += '</div>';
		table += '<br>';
		// dynamic Evidence Summary to be displayed above Gene View table
		table += '<div id= "geneViewTable" class = "scrollTable">';
		table += '<table id = "tablesorter" class="tablesorter">';
		table += '<thead>';
		table += '<tr>';
		table += '<th width="100"> Accession </th>';
		table += '<th width="100"> Symbol</th>';
		table += '<th width="60">Chr</th>';
		table += '<th width="70">Nt start</th>';
	
		table += '<th  width="330"><div id="evidence-filter">  <span>Evidence</span> <button type="button" id="distance-filter-button" onclick="toggleFilterIcons(this)" class="filter-button" data-id="distance"><i class="fas fa-filter"></i></button></div></th>';
		table += '<th width="200"><div id="knetscore-filter"> <div id="knetscore-container"><span>KnetScore </span><span id="knetScore" class="hint hint-small"> <i class="fas fa-info-circle"></i></span></div><button type="button" id="knetscore-filter-button" onclick="toggleFilterIcons(this)" class="filter-button" data-id="knetscore"><i class="fas fa-filter"></i></button></div></th>';
		table += '<th width="70">Select</th>';
		table += '</tr>';
		table += '</thead>';
		table += '<tbody id="geneTableBody" class="scrollTable">';
		table += '</tbody>';
		table += '</table>';
		table += '<div id="filterMessage" class="showFilter"> Your filter is returning no results.</div></div>';
		table += '</form>';
	
		table += '<div class="gene-footer-container"><div class="gene-footer-flex">';
		table += '<div class="num-genes-container"><span> Showing <span id="geneCount" class="count">'+firstPageEnd+'</span> of <span id = "geneTotal" class="limit">'+tableData.length+'</span></span></div>';
		table += '<div id="selectUser"><input class="unchecked" type="button" name="checkbox_Targets"  value="Linked Genes" title="Click to select genes with existing evidence." /> <input class="unchecked"  type="button" name="checkbox_Targets"  value="Unlinked Genes" title="Click to select genes without existing evidence." /> </div></div>';
	
		table += '<div class="gene-footer-flex"><div  id="candidate-count" class="selected-genes-count"><span style="color:#51CE7B; font-size: 14px;">No genes selected</span></div>';
	
		table += '<button id="new_generateMultiGeneNetworkButton" class="non-active btn knet_button" title="Display the network in KnetMaps"> Create Network </button></div></div>';
		$('#resultsTable').html(table);
		createGeneTableBody ( tableData );
	
		var tableSorterOpts = {}
		
		// Sort if enabled. See Notes in init-utils.js
		if ( KNET_TABLES_SORTING_ENABLED ) 
			tableSorterOpts.sortList = [ [5, 1] ]
		else {
			var disabledHeaders = Object.fromEntries ( 
				Array( tableData.length )
				.fill ( { sorter: false } )
				.map ( (x,i) => [i, x] ) 
			)
			tableSorterOpts.headers = disabledHeaders
		}
		
		$("#tablesorter").tablesorter( tableSorterOpts );

		geneTableFilterMgr.setup(tableData);





		
	} // if (tableData.length > 0 )

	// TODO: ==> Many of these steps appear to be useless when tableData.length == 0
	// Possibly, turn the whole function into the guarded style:
	// if ( len == 0 ) return
	// <actually do something with non-empty table>
	//

	// scroll down to geneTable, but show tabviewer_buttons above
	document.getElementById('pGSearch_title').scrollIntoView();

	


	// TODO: evidence dropdown functions to be refined in Knetminer 5.7 
	$("#new_generateMultiGeneNetworkButton").click(function (e) {
		var  targetElementId = e.target.id
		generateMultiGeneNetwork_forNewNetworkViewer(keyword,targetElementId);

	});


	/*
	 * Revert Evidence Filtering changes on Gene View table
	 */
	$("#revertGeneView").click(function (e) {
		createGenesTable(tableData, keyword,); // redraw table
		$("body").data("data", {resultsTable: tableData});
		$('#resultsTable').data({ keys: [] });
		
	});

	$("#revertGeneView").mouseenter(function (e) {
		$("#revertGeneView").removeClass('unhover').addClass('hover');
	});

	$("#revertGeneView").mouseout(function (e) {
		$("#revertGeneView").removeClass('hover').addClass('unhover');
	});

	/*
	 * Select all KNOWN targets: find all targets with existing Evidence & check them.
	 * Select all NOVEL targets: find all targets with no Evidence & check them.
	 */
	$('input:button[name="checkbox_Targets"]').bind("click", { x: tableData }, function (e)
	{
		e.preventDefault();
		var numResults = tableData.length;
		var targetClass = $(this).hasClass('checked')

		for (var i = 0; i < numResults; i++) {
			var {isUserGene, conceptEvidences} = e.data.x[i];


			if (isUserGene) {
				// Check which input buttons are selected.
		 // Select Known Targets.
					if (conceptEvidences && ($(this).val() === "Linked Genes") ) $("#checkboxGene_" + i + ":visible").prop('checked', !targetClass);
				

				if ($(this).val() === "Unlinked Genes") { // Select Novel Targets.
					if (!conceptEvidences) {
						$("#checkboxGene_" + i + ":visible").prop('checked', !targetClass);
					}
				}
			}
		}

		// update button style for linked and unlinked genes
		$(this).toggleClass('checked')

		// updates selected genes count 
		updateSelectedGenesCount('candidates','#candidate-count','Gene')
	});


	// initiates infinite scrolling for geneView
	if ( tableData.length > 0 )	genesTableScroller.setupScrollHandler ()
} // createGenesTable


/*
 * Function
 * Generates the network using KnetMaps
 * @author: Ajit Singh.
 */
function generateCyJSNetwork(url, requestParams, externalCall) {
	// Preloader for KnetMaps
	$("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>Loading Network, please wait...</b></div>');
	$("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div"><b>Loading Network, please wait...</b></div>');

	// Show loading spinner on 'tabviewer' div

	$.post({
		url: url,
		timeout: 1000000,
		headers: {
			"Accept": "application/json; charset=utf-8",
			"Content-Type": "application/json; charset=utf-8"
		},
		datatype: "json",
		data: JSON.stringify(requestParams)//,
	}).fail(function (xhr, status, errorlog) {
		var server_error = JSON.parse(xhr.responseText); // full error json from server
		var errorMsg = "Failed to render knetwork...\t" + server_error.statusReasonPhrase + " (" + server_error.type + "),\t" + server_error.title;
		console.log(server_error.detail);
		alert(errorMsg);
	}).success(function (data) {


		// Network graph: JSON file.
		try {
			if (!externalCall) {
				activateButton('NetworkCanvas');
				$("#NetworkCanvas_button").addClass('network-created');
				changeButtonOffSvg('NetworkCanvas_button')
			}

			// new Save button in Network View - intialise a click-to-save button with networkId (null when inside knetminer)
			var networkId = null;

			var saveBtn = externalCall ? 'image/networksave.png' : 'html/image/networksave.png'


			$('#knetSaveButton').html("<button  class='network_button' onclick='exportAsJson(" + networkId + "," + JSON.stringify(requestParams) + ");' title='Save to your workspace on KnetSpace.com'><img src=" + saveBtn + " alt='save networks' width='20'/></button>");


			// new export/download button in Network View - intialise a button to export gene info from knetwork and save locally, using networkId (null when inside knetminer)
			//genes export button
			$('#knetGeneExport').html("<button class='export_button' onclick='exportKnetworkTable(" + networkId + ");'title='Download visible genes from knetwork as a table'>Tabular Format</button>");

			//visible graph button 
			$('#visibleGraphExport').html("<button class='export_button' onclick='downloadNetwork()' title='Download visible graph'>Cytoscape JSON </button>");


			if (data.graph.includes("var graphJSON=")) { // for old/current json that contains 2 JS vars
				var knetwork_blob = data.graph;
				knetwork_blob = filterKnetworkJson(knetwork_blob); // filter large knetwork jsons
				knetmaps.drawRaw('#knet-maps', /*data.graph*/knetwork_blob/*, networkId*/);
			}
			else { // response contents (pure JSON).
				var eles_jsons = data.graph.graphJSON.elements;
				var eles_styles = data.graph.graphJSON.style;
				var metadata_json = data.graph.allGraphData;
				knetmaps.draw('#knet-maps', eles_jsons, metadata_json, eles_styles/*, networkId*/);
			}


			// Remove the preloader message in Gene View, for the Network Viewer
			$("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"></div>');
			$("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div"></div>');
			$('#new_generateMultiGeneNetworkButton').html('Create Network');
			$('#new_generateMultiEvidenceNetworkButton').html('Create Network');
			
			googleAnalytics.trackEvent (
			  "/network", // It already has a leading '/'
			  { 
				  // WARNING: keep these fields consistent with the API tracking in 
				  // KnetminerServer.java
				  'keywords': requestParams?.keyword,
				  'genesListSize': requestParams?.list?.length || 0
			})
		}
		catch (err) {
			var errorMsg = err.stack + ":::" + err.name + ":::" + err.message;
			console.log(errorMsg);
			//$("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div">' + "Error: <br/>" + "Details: " + errorMsg + '</div>');
		}
	}).always(function () { 
		resetNetworkCall()
	});
}

/*
 * Function
 * Generates multi gene network in KnetMaps
 * @author: Ajit Singh.
 */
function generateMultiGeneNetwork_forNewNetworkViewer(keyword, targetElement) {

	// adds loadings to create network button
	new WaitPopUp(`#${targetElement}`,'#tabviewer_content','Creating Network').animate(); 

	var candidatelist = [];
	var knetNotice;

	var cb_list = $("input[name=candidates");
	var cb_list_len = cb_list.length;
	for (var i = 0; i < cb_list_len; i++) {
		if (cb_list[i].checked) {
			candidatelist.push(cb_list[i].value);
		}
	}
	//console.log(candidatelist.length +" gene(s) selected.");
	if (candidatelist == "") {
		knetNotice = "Please select candidate genes."
		jboxNotice(knetNotice, 'red', 300, 2000);

	}
	else if (candidatelist.length > knetview_limit/*20*/) {
		if (enforce_genelist_limit === false) { // Pro plan user
			knetNotice = '<span></span><b>Gene networks can only be created for up to max. ' + knetview_limit + ' genes.</b></span>'

		}
		else { // Free plan user
			knetNotice = '<span></span><b>Gene networks can only be created for up to max. ' + knetview_limit + ' genes.</b></span>'
			'<span id="loadingNetworkDiv"><b>The KnetMiner Free Plan is limited to a network of ' + knetview_limit + ' genes. <a href="https://knetminer.com/pricing-plans" target="_blank">Upgrade to Pro plan now</a> to create networks for 200 genes</b></span>';

		}

		jboxNotice(knetNotice, 'red', 300, 2000);
		resetNetworkCall()

	}
	else {
		generateCyJSNetwork(api_url + '/network', { keyword: keyword, list: candidatelist, isExportPlainJSON: false }, false);
	}

}


// update selected genes count whenever a Gene View or evidence table entry is clicked or Known/ Novel targets options in gene view are selected.
// Arne 18/01/23 added viewName which requests a name (probably either Term or Gene).
function updateSelectedGenesCount(inputName, countContainer, viewName) {
	var count = knetTableUserCountSize(inputName);
	var viewCount = count > 1 ? viewName + 's' : viewName // >1 testing
	$('' + countContainer + ' span').text(count + ' ' + viewCount + ' selected'); // update
	$(countContainer).next().toggleClass('non-active', count < 1);
	changeButtonOffSvg('NetworkCanvas_button')
}

// TODO: remove after reading. Lambda expressions are normally uses only for in-line anonymous functions
// An explicit regular function uses the 'function' keyword, using lambdas here looks very weird
// and less readable.
//
// var returnCheckInputCount = (inputname) => $('input:checkbox[name=' + inputname + ']:checked').length;

/** 
 * Takes gene or evidence view checkbox input names and returns the number of checked inputs
 *
 * TODO: returnXXX is quite a silly name, every function returns something (or, we say they "returns void"), 
 * nobody states the obvious with a name like this. Choose another one, eg, knetTableUserSelectionSize,
 * (or *Count, but count is more coomonly used for a count that is updated during a loop or alike).
 * 
 */ 
function knetTableUserCountSize ( inputName )
{
	return $('input:checkbox[name=' + inputName + ']:checked').length
}


// function downloads cytoscape compatible json files
function downloadNetwork() {

	var cy = $('#cy').cytoscape('get'); // now we have a global reference to `cy`
	var exportJson = cy.json(); // full graphJSON
	var plainJson = filterJsonToExport(cy, exportJson);
	var graph = JSON.parse(plainJson);

	for (var keys in graph.graphJSON) {
		if (graph.graphJSON.hasOwnProperty(keys) && keys !== 'elements') {
			delete graph.graphJSON[keys]
		}
	}

	var isDownloaded = triggerFileDownload('knetminer_network.json', JSON.stringify(graph.graphJSON, null, "\t"));

	// ispopup stopped is set when the user clicks don't show again button
	var isPopupstopped = JSON.parse(localStorage.getItem('popup'));

	// if file is downloaded and popup is still needed (i.e user did not click 'don't show again' button)
	if (isDownloaded && !isPopupstopped) {
		// popup element 
		$('body').append("<div class='guide-popup'> <h4 style='margin: 0.5rem 0rem;'>First time downloading our Network Graphs?</h4><span>Kindly follow our <a style='color: white;' href='https://knetminer.com/tutorial/use-cases/cytoscape-tutorial' target='_blank'>guide</a> to setup KnetMiner Cytoscape styles correctly</span> <div  style='margin-top: 1rem;'> <button class='popup-btns' id='close-popup' style='background: black;color: white;margin-right: 0.5rem;' >Close</button> <button class='popup-btns' style='background:white;color:black;' id='hide-popup'>Don't show again</button> </div></div>");

		// remove element from DOM after 15 secs 
		setTimeout(function () {
			$('.guide-popup')
			.css('right', '-32pc')
			.remove();
		}, 15000);

		// close button to hide 
		$('#close-popup').click(function () {
			$('.guide-popup').css('right', '-32pc')
		})

		// not showing popup anymore
		$('#hide-popup').click(function () {
			$('.guide-popup').css('right', '-32pc');
			localStorage.setItem('popup', true);
		})
	}

}

/**
 * @desc creates the gene table body for a data window and places it in the DOM
 * @param {tableData} geneview table data, as it comes from the API and turned into a nested array (see data-utils.js:genomicViewContent()).
 * 
 * The function considers the current page available in evidenceTableScroller.getPage() and 
 * shows that window only.
 */
function createGeneTableBody ( tableData, doAppend = false )
{
	// In this case, it doesn't do anything anyway and this prevents the scroller from 
	// failing.
	if ( !( tableData && tableData.length > 0 ) ) return

	var table = ''

	const fromRow = genesTableScroller.getPageStart ()
	const toRow = genesTableScroller.getPageEnd ()

	// Main loop over the resulting genes.
	for (var row = fromRow; row < toRow; row++)
	{	
		var {ondexId, accession,chromosome, conceptEvidences, geneBeginBP,name,score} = tableData[row]; 
		table += '<tr>';

		var upperCasedAccessions = accession.toUpperCase(); // always display gene ACCESSION in uppercase

		var geneAccNorm = upperCasedAccessions.replace(".", "_");

		// Gene accession
		var geneTd = `<td class="gene_accesion"><a data-genelist="${accession}" onclick="openAccessionNetworkView(${ondexId},event)" title="Display network in KnetMaps">${upperCasedAccessions}</a></td>`;

		var geneNameTd = name.toUpperCase() == accession
			// In this case, the API has found one accession only as name, so we're sure we don't have synonyms to expand
			? '<td></td>'
			// else, gene name column, with synonym expansion
			: '<td><span class="gene_name">' + name + '</span> <span onclick="createGeneNameSynonyms(this,' + ondexId + ')" class="genename_info"><i class="fas fa-angle-down"></i></span> <div class="gene_name_synonyms"></div></td>';

		// Currently not shown
		var scoreTd = '<td>' + Number(score).toFixed(2) + '</td>';

		var chrTd = '';
		var chrStartTd = '';

		var chrTd = '<td>' + chromosome + '</td>';
		var chrStartTd = '<td>' + geneBeginBP + '</td>';



		// For each evidence show the images - start
		var evidenceTd = '<td><div class="evidence-column-container">';

		if (conceptEvidences)
		{
			for ( const [evidenceType, typeEvidencesSummary] of Object.entries ( conceptEvidences ) ) 
			{

				const thisTypeEvidences = typeEvidencesSummary.conceptEvidences

				if(thisTypeEvidences.length){
					evidenceTd += '<div class="evidence-container"><div id="evidence_box_open_' + geneAccNorm + evidenceType + '" class="evidence_item evidence_item_' + evidenceType + ' dropdown_box_open" title="' + evidenceType + '" >';
				//Builds the evidence box
				evidenceTd += '<div id="evidence_box_' + geneAccNorm + evidenceType + '" class="evidence_box"><span class="dropdown_box_close" id="evidence_box_close_' + geneAccNorm + evidenceType + '"></span>';
				evidenceTd += '<p><div class="evidence_item evidence_item_' + evidenceType + '"></div> <span>' + evidenceType + '</span></p>';
				for (const evidence of thisTypeEvidences )
				{
					let evidenceLabel = evidence.conceptLabel
					
					let evidenceValueTd = ''

					if ( evidenceType == 'Publication' ) {
						pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
						evidenceLabel = evidenceLabel.replace ( /^PMID\:/i, "" );
						evidenceValueTd = `<a href="${pubmedurl}${evidenceLabel}" target = "_blank">PMID:${evidenceLabel}</a>`;
					}
					else
						evidenceValueTd = evidenceLabel;

					evidenceTd += '<p>' + evidenceValueTd + '</p>';
				}
				evidenceTd += '</div>';
				evidenceTd += '</div> <span style="margin-right:.5rem">' + thisTypeEvidences.length + '</span></div>';
				}
			}
			// for evidenceType, typeEvidencesSummary

		} // if conceptEvidences
		evidenceTd += '</div></td>';
		// Foreach evidence show the images - end

		var selectTd = `<td><input onchange="updateSelectedGenesCount('candidates','#candidate-count','Gene');" id="checkboxGene_${row}" type="checkbox" name= "candidates" value="${accession}"></td>`;
		table += geneTd + geneNameTd + /*taxIdTd +*/ chrTd + chrStartTd + evidenceTd + scoreTd + selectTd;
		table += '</tr>';
		
	} // for row

	if(table)
	{
		const bodyContainer = $( '#geneTableBody' )
		if ( doAppend )
			bodyContainer.append ( table ) 
		else
		{ 
			bodyContainer.html ( table )

			// When it's being recreated, reset the sorting too
			$( ".tablesorter" ).trigger ( 'update' );

			/*
			 * click handlers for opening and closing the qtl and evidence column drop down boxes.
			 */
			$(".dropdown_box_open").click(function (event) {
				toggleEvidencePopUp(event,300,'open')
			});
	
			$(".dropdown_box_close").click(function (e) {
				toggleEvidencePopUp(e,100,'close')
			});
		}
		 
		// Updates "x of y" label
    $('#geneCount').html ( toRow )
    $('#geneTotal').html ( tableData.length )
	}
} // createGeneTableBody()


 /*
  * Function to create interactive legend as summary for Gene View evidences.
  * @returns the <div> containing the interactive Gene View summary legend.
  * 
  */
function getInteractiveSummaryLegend(geneViewData) {

	var evidencesArr= new Array();

	geneViewData.forEach((geneData) => {
		var keys  = Object.keys(geneData.conceptEvidences);

		for(let key of keys){
			if (!evidencesArr.includes(key)) evidencesArr.push(key)
		}
	})

  
	// Display evidence icons with count and name in legend.

	var legend= '<div id="concepts-view" class="evidenceSummary view active" title="Click to filter by type">';
	var summaryText = '';
  
	evidencesArr.forEach(function(evidence)
	{     
		var key = evidence
	  	var contype= key.trim();

			  summaryText += 
			    `<div style="font-weight:600;" 
			          onclick = "filterGeneTableByType ( event, '${contype}' );"
			          class = "evidenceSummaryItem">`
			  + `<div class="evidence-icons evidence_item evidence_item_${key}" title = "${key}"></div> ${key}</div>`;
	});
  
	legend= legend + summaryText +'</div>';

	return legend;
}



// toggles distance filter popup modal 
 function toggleFilterIcons(element){

	const targetClass = $(element).attr('data-id');


	const oppsiteClass = ['knetscore','distance'].find(view => view !== targetClass);

	closeOppositeModal(oppsiteClass)

	const view = $(`.${targetClass}-view`)
	const viewButtonId = $(`#${targetClass}-filter-button`)
	const overlay = $(`.${targetClass}-view-overlay`)

	const isDistanceFilterVisible = view.is(":visible")

	$(view).toggleClass('show-block', !isDistanceFilterVisible)
	$(viewButtonId).toggleClass('bg-gray',!isDistanceFilterVisible )
	$(overlay).toggleClass('show-block',!isDistanceFilterVisible)
	
 }

//  closes opposite modal
 function closeOppositeModal(oppsiteClass){

	$(`.${oppsiteClass}-view`).removeClass('show-block')
	$(`.${oppsiteClass}-view-overlay`).removeClass('show-block')
	$(`#${oppsiteClass}-filter-button`).removeClass('bg-gray')
 }

// TEMPORARY SOLUTION WILL BE REPLACED IN COMING DAYS
// resets geneview table
 function resetTable(){
	$("#revertGeneView").click();
 }

