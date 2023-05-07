
/*
 * Function generate Geneview table and it shows once data is returned from function search keyword ajax calls
 *
 */
function createGenesTable(text, keyword){
	var table = "";
 	var {totalPage,itemsLength} = tableHandler.saveTableData(text); 
	
	if (text.length > 0 ){
	// Gene View: interactive summary legend for evidence types.
	var interactiveSummaryLegend = getInteractiveSummaryLegend(text);

	table += '<form name="checkbox_form"><div class="gene_header_container">';
	table += '' + interactiveSummaryLegend + '<input id="revertGeneView" type="button" value="" class="unhover" title= "Revert all filtering changes"></div>';
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

	table += '<th width="330">Evidence</th>';
	table += '<th width="150"> KnetScore <span id="knetScore" class="hint hint-small"> <i class="fas fa-info-circle"></i></span> </th>';
	table += '<th width="70">Select</th>';
	table += '</tr>';
	table += '</thead>';
	table += '<tbody id="geneTableBody" class="scrollTable">';

	var tableBody = createGeneTableBody(text,1,totalPage); 
	table = table + tableBody; 
	table += '</tbody>';
	table += '</table>';
	table += '<div id="filterMessage" class="showFilter"> Your filter is returning no results. Try increasing the amount of genes visible (bottom left).</div></div>';
	table += '</form>';

	table += '<div class="gene-footer-container"><div class="gene-footer-flex">';
	table += '<div class="num-genes-container"><span> Showing <span id="geneCount" class="count">'+itemsLength+'</span> of <span class="limit">'+text.length+'</span></span></div>';
	table += '<div id="selectUser"><input class="unchecked" type="button" name="checkbox_Targets"  value="Linked Genes" title="Click to select genes with existing evidence." /> <input class="unchecked"  type="button" name="checkbox_Targets"  value="Unlinked Genes" title="Click to select genes without existing evidence." /> </div></div>';

	table += '<div class="gene-footer-flex"><div  id="candidate-count" class="selected-genes-count"><span style="color:#51CE7B; font-size: 14px;">No genes selected</span></div>';

	table += '<button id="new_generateMultiGeneNetworkButton" class="non-active btn knet_button" title="Display the network in KnetMaps"> Create Network </button></div></div>';

	$('#resultsTable').html(table);

	}
	

	// scroll down to geneTable, but show tabviewer_buttons above
	document.getElementById('pGSearch_title').scrollIntoView();

	/*
	 * click Handler for viewing a network.
	 */
	$(".viewGeneNetwork").bind("click", { x: text }, function (e) {
		e.preventDefault();
		var geneNum = $(e.target).attr("id").replace("viewGeneNetwork_", "");
		var values = e.data.x[geneNum];

		// Generate Network in KnetMaps.
		generateCyJSNetwork(api_url + '/network', { list: [values[1]], keyword: keyword, exportPlainJSON: false }, false);
	});


	// TODO: evidence dropdown functions to refined in Knetminer 5.7 

	/*
	 * click handlers for opening and closing the qtl and evidence column drop down boxes.
	 */
	// $(".dropdown_box_open").click(function (e) {
	// 	e.preventDefault();
	// 	var targetname = $(e.target).attr("id").replace("open_", "");
	// 	$("#" + targetname).slideDown(300);
	// });

	// $(".dropdown_box_close").click(function (e) {
	// 	e.preventDefault();
	// 	var targetname = $(e.target).attr("id").replace("close_", "");
	// 	$("#" + targetname).slideUp(100);
	// });

	$("#new_generateMultiGeneNetworkButton").click(function (e) {
		generateMultiGeneNetwork_forNewNetworkViewer(keyword);
		getLongWaitMessage.createLoader('#'+e.target.id,'#tabviewer_content','Creating Network'); 
	});

	$("#tablesorter").tablesorter({
		// sorting column 5 in descending order
		// you can add sort columns in the array below [column number, sorting direction]
		// sorting direction 1 is descending and 0 is ascending. 
		sortList: [[5, 1]],
		// headers: {
		// 	// do not sort "select" column
		// 	// 6: { sorter: false },
		// }
	});


	/*
	 * Revert Evidence Filtering changes on Gene View table
	 */
	$("#revertGeneView").click(function (e) {
		createGenesTable(text, keyword,); // redraw table
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
	$('input:button[name="checkbox_Targets"]').bind("click", { x: text }, function (e) {
		e.preventDefault();
		var numResults = text.length;
		var targetClass = $(this).hasClass('checked')

		for (var i = 1; i < numResults; i++) {
			var values = e.data.x[i];

			if (values[7] === "yes") {
				// Check which input buttons are selected.
				if ($(this).val() === "Linked Genes") { // Select Known Targets.
					if (values[9].length > 0) {
						$("#checkboxGene_" + i + ":visible").prop('checked', !targetClass);
					}
				}
				else if ($(this).val() === "Unlinked Genes") { // Select Novel Targets.
					if (values[9].length === 0) {
						$("#checkboxGene_" + i + ":visible").prop('checked', !targetClass);
					}
				}
			}
		}

		// update button style for linked and unlinked genes
		$(this).toggleClass('checked')

		// update selected genes count
		updateSelectedGenesCount("candidates", "#candidate-count",'Gene');
	});

	tableHandler.scrollTable('geneViewTable');

}


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
		}
		catch (err) {
			var errorMsg = err.stack + ":::" + err.name + ":::" + err.message;
			console.log(errorMsg);
			//$("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div">' + "Error: <br/>" + "Details: " + errorMsg + '</div>');
		}
	}).always(function () { $('.overlay').remove() });
}

/*
 * Function
 * Generates multi gene network in KnetMaps
 * @author: Ajit Singh.
 */
function generateMultiGeneNetwork_forNewNetworkViewer(keyword) {
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
	}
	else {
		generateCyJSNetwork(api_url + '/network', { keyword: keyword, list: candidatelist, exportPlainJSON: false }, false);
	}



}


// update selected genes count whenever a Gene View or evidence table entry is clicked or Known/ Novel targets options in gene view are selected.
// Arne 18/01/23 added viewName which requests a name (probably either Term or Gene).
function updateSelectedGenesCount(inputName, countContainer, viewName) {
	var count = returnCheckInputCount(inputName);
	var viewCount = count > 1 ? viewName + 's' : viewName // >1 testing
	$('' + countContainer + ' span').text(count + ' ' + viewCount + ' selected'); // update
	$(countContainer).next().toggleClass('non-active', count < 1);
	changeButtonOffSvg('NetworkCanvas_button')
}

// takes gene or evidence view checkbox input names and returns the number of checked inputs 
function returnCheckInputCount(inputname) { return $('input:checkbox[name=' + inputname + ']:checked').length }


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

	var isDownloaded = downloadFunction('knetminer_network.json', JSON.stringify(graph.graphJSON, null, "\t"));

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
 * @desc function creates calculates and return pagination values for gene view and evidence table
 */


/**
 * @desc function creates and returns geneview table body
 
 TODO: I can read the parameter list on the signature, do not
 report them here without telling what they are
 
 * @param {*} results geneview table data, as it comes from the API and turned into a nested array (see data-utils.js:genomicViewContent()).
 * @param {*} pageIndex number is used compute the geneview's data starting and ending range.
 * @param {*} rowSize number of data rows to be created, defaults to number geneViewData if length is less than 30 see(getTablePaginationData()).
 * @param {*} totalPage total number of pages that can be rendered, results from dividing geneView data length by rowSize. see (getTablePaginationData())
 * @returns 
 */
function createGeneTableBody(results, pageIndex,totalPage){
	var table = ''

	// Main loop over the resulting genes.
	var pageStart = (pageIndex - 1) * 30;
    var pageEnds = pageIndex == totalPage ? results.length : pageIndex * 30; 
	for (var row = pageStart; row < pageEnds; row++)
	{
		var [geneId, geneAccessions,geneName,chr,chrStart,taxId,score,,withinQTLs,evidence ] = results[row]

		// if (row > rows /*&& values[7]=="no"*/) continue;
		table += '<tr>';

		geneAccessions = geneAccessions.toUpperCase(); // always display gene ACCESSION in uppercase

		var geneAccNorm = geneAccessions.replace(".", "_");

		// Gene accession
		var geneTd = '<td class="gene_accesion"><a href = "javascript:;" class="viewGeneNetwork" title="Display network in KnetMaps" id="viewGeneNetwork_' + row + '">' + geneAccessions + '</a></td>';

		var geneNameTd = geneName.toUpperCase() == geneAccessions
			// In this case, the API has found one accession only as name, so we're sure we don't have synonyms to expand
			? '<td></td>'
			// else, gene name column, with synonym expansion
			: '<td><span class="gene_name">' + geneName + '</span> <span onclick="createGeneNameSynonyms(this,' + geneId + ')" class="genename_info"><i class="fas fa-angle-down"></i></span> <div class="gene_name_synonyms"></div></td>';

		var taxIdTd = ''

		var taxIdTd = '<td><a href="http://www.uniprot.org/taxonomy/' + taxId + '" target="_blank">' + taxId + '</a></td>';

		// Currently not shown
		var scoreTd = '<td>' + score + '</td>';


		var chrTd = '';
		var chrStartTd = '';

		var chrTd = '<td>' + chr + '</td>';
		var chrStartTd = '<td>' + chrStart + '</td>';

		// QTL column with information box
		var qtlTd = '<td>';
		if (withinQTLs.length > 1) {
			var withinQTLs = withinQTLs.split("||");
			//Shows the icons
			qtlTd = '<td><div class="qtl_item qtl_item_' + withinQTLs.length + '" title="' + withinQTLs.length + ' QTLs"><a href"javascript:;" class="dropdown_box_open" id="qtl_box_open_' + geneAccNorm + withinQTLs.length + '">' + withinQTLs.length + '</a>';

			//Builds the evidence box
			qtlTd += '<div id="qtl_box_' + geneAccNorm + withinQTLs.length + '" class="qtl_box"><span class="dropdown_box_close" id="qtl_box_close_' + geneAccNorm + withinQTLs.length + '"></span>';
			qtlTd += '<p><span>' + "QTLs" + '</span></p>';

			var uniqueQTLs = new Object();
			var uniqueTraits = new Object();

			for (var iqtl = 0; iqtl < withinQTLs.length; iqtl++) {
				var withinQTLElems = withinQTLs[iqtl].split("//");
				if (withinQTLElems[1].length > 0) {
					if (uniqueTraits[withinQTLElems[1]] == null)
						uniqueTraits[withinQTLElems[1]] = 1;
					else
						uniqueTraits[withinQTLElems[1]]++;
				}
				else {
					if (uniqueQTLs[withinQTLElems[0]] == null)
						uniqueQTLs[withinQTLElems[0]] = 1;
					else
						uniqueQTLs[withinQTLElems[0]]++;
				}
			}

			var unique = "";
			for (var iqtl = 0; iqtl < withinQTLs.length; iqtl++) {
				var withinQTLElems = withinQTLs[iqtl].split("//");
				if (withinQTLElems[1].length > 0) {
					if (unique.indexOf(withinQTLElems[1] + ";") == -1) {
						unique += withinQTLElems[1] + ";";
						qtlTd += '<p>' + uniqueTraits[withinQTLElems[1]] + ' ' + withinQTLElems[1] + '</p>';
					}
				}
				else {
					if (unique.indexOf(withinQTLElems[0] + ";") == -1) {
						unique = unique + withinQTLElems[0] + ";";
						qtlTd += '<p>' + uniqueQTLs[withinQTLElems[0]] + ' ' + withinQTLElems[0] + '</p>';
					}
				}
			}
		} // if ( withinQTLs.length )
		qtlTd += '</td>';


		// For each evidence show the images - start
		var evidenceTd = '<td><div class="evidence-column-container">';
		if (evidence.length > 0) {
			var evidences = evidence.split("||");
			for (var iev = 0; iev < evidences.length; iev++) {
				//Shows the icons
				var evidenceElems = evidences[iev].split("__");
				var evidenceCC = evidenceElems[0];
				var evidenceSize = evidenceElems[1];
				var evidenceNodes = evidenceElems[2].split("//");
				evidenceTd += '<div class="evidence-container"><div  class="evidence_item evidence_item_' + evidenceCC + '" title="' + evidenceCC + '" >';
				//Builds the evidence box

				evidenceTd += '</div> <span style="margin-right:.5rem">' + evidenceSize + '</span></div>';
			} // for iev
		} // if evidence.length
		evidenceTd += '<div></td>';
		// Foreach evidence show the images - end

		var selectTd = `<td><input onchange="updateSelectedGenesCount('candidates','#candidate-count','Gene');" id="checkboxGene_${row}" type="checkbox" name= "candidates" value="${geneAccessions}" /></td>`;
		table = table + geneTd + geneNameTd + /*taxIdTd +*/ chrTd + chrStartTd + evidenceTd + /*usersList +*/ /*qtlTd +*/ scoreTd + selectTd;
		// table += '</tr>';
	}// for row

	if(table)
	{
	 if(pageIndex == 1)return table; 

	$('#geneTableBody').append(table); 
    $('#geneCount').html(pageEnds)

	}
}


 /*
  * Function to create interactive legend as summary for Gene View evidences.
  * @returns the <div> containing the interactive Gene View summary legend.
  * 
  */
 function getInteractiveSummaryLegend(geneViewData) {

	var evidencesArr= new Array();
	for(var i=1; i < geneViewData.length; i++) {
		var evi_value= geneViewData[i][9].trim();
		if(evi_value !== "") {
		   evidencesArr.push(evi_value);
		  }
	  }
  
	var con_legend= new Map();
	// Iterate through evidences and get counts for each evidence Concept Type.
	evidencesArr.forEach(function(evi) {
		var row_values= evi.trim().split("||");
		row_values.forEach(function(rv) {
			var conType= rv.trim().split("__")[0].trim();
			var conCount= Number(rv.trim().split("__")[1].trim());
			// check/add unique concept types to Map
			if(con_legend.has(conType)) {
			   // update if this count is greater than old, stored count
			   var old_count= con_legend.get(conType);
			   if(Number(conCount) > Number(old_count)) { con_legend.set(conType, conCount); }
			  }
			else { // add new conType to Map
				con_legend.set(conType, conCount);
			}
		  });
	   });
  
	// Display evidence icons with count and name in legend.
	//var legend= '<div id="evidence_Summary_Legend" class="evidenceSummary">'+ '<div id="evidenceSummary2" class="evidenceSummary" title="Click to filter by type">';
	var legend= '<div id="evidenceSummary2" class="evidenceSummary" title="Click to filter by type">';
	var summaryText = '';
  
	con_legend.forEach(function(value, key, map)
	{     
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
  

