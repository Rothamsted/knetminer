
/*
 * Function generate Geneview table and it shows once data is returned from function search keyword ajax calls
 *
 */
function createGenesTable(text, keyword, rows) 
{
	var table = "";
	var candidateGenes = text.split("\n");
	var results = candidateGenes.length - 2;

	if (candidateGenes.length > 2)
	{
		// Gene View: interactive summary legend for evidence types.
		var interactiveSummaryLegend = getInteractiveSummaryLegend(text);
		var utf8Bytes = "";
		utf8Bytes = encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, function (match, p1) {
			return String.fromCharCode('0x' + p1);
		});
		table += '<p class="margin_left"><a download="genes.tsv" href="data:application/octet-stream;base64,' + btoa(utf8Bytes) + '" target="_blank">Download as TAB delimited file</a><br />';
		table += 'Select gene(s) and click "Create Network" button below to see the network.<span id="hintSortableTable" class="hint hint-small"> <i class="fas fa-info-circle"></i></span></p>';
		table += '<form name="checkbox_form">';
		table += '<u>Max</u> number of genes to show: ';
		table += '<select value="' + /*rows*/results + '" id="numGenes">';
		table += '<option value="1000"' + (rows == 1000 ? 'selected' : '') + '>1000</option>';
		table += '<option value="500"' + (rows == 500 ? 'selected' : '') + '>500</option>';
		table += '<option value="200"' + (rows == 200 ? 'selected' : '') + '>200</option>';
		table += '<option value="100"' + (rows == 100 ? 'selected' : '') + '>100</option>';
		table += '<option value="50"' + (rows == 50 ? 'selected' : '') + '>50</option>';
		table += '<option value="' + results + '"' + (rows == results ? 'selected' : '') + '>All (' + results + ')</option>';
		table += '</select>';

		table += '<div id="selectUser">Linked genes:<input type="checkbox" name="checkbox_Targets" value="checkbox_Known" title="Click to select genes with existing evidence." /> Unlinked genes:<input type="checkbox" name="checkbox_Targets" value="checkbox_Novel" title="Click to select genes without existing evidence." />' +
			'<div id="selectedGenesCount"><span style="color:#51CE7B; font-size: 14px;">No gene(s) selected</span></div>' + '</div>';
		table += '<br>';
		// dynamic Evidence Summary to be displayed above Gene View table
		table += '<div id="evidence_Summary_Legend" class="evidenceSummary">' + interactiveSummaryLegend + '</div>';

		table += '<div id= "geneViewTable" class = "scrollTable">';
		table += '<table id = "tablesorter" class="tablesorter">';
		table += '<thead>';
		table += '<tr>';

		var headers = candidateGenes[0].split("\t");
		var hAcc = headers[1];
		var hName = headers[2];
		var hChromosome = headers[3];
		var hChrStart = headers[4];
		var hTaxId = headers[5];
		var hEvidence = headers[9];

		table += '<th width="100">' + hAcc + '</th>';
		table += '<th width="100" title="Show ' + hName + ', if not same as ' + hAcc + '">' + hName + '</th>'; // added Gene Name to Gene View table
		
		// TODO: is there a reason for these amateur tests against true?
		// TODO: what does this flag mean?! 
	
			table += '<th width="60">' + hTaxId + '</th>';
	
		
		
			table += '<th width="60">' + hChromosome + '</th>';
			table += '<th width="70">' + hChrStart + '</th>';
		
		table += '<th width="220">' + hEvidence + '</th>';
		table += '<th width="70">Select</th>';
		table += '</tr>';
		table += '</thead>';
		table += '<tbody class="scrollTable">';

		// Main loop over the resulting genes.
		// 
		for (var row = 1; row <= results; row++)
		{
			var values = candidateGenes[row].split("\t");

			if (row > rows /*&& values[7]=="no"*/) continue;
			table += '<tr>';

			var geneId = values[0];

			var geneAcc = values[1];
			geneAcc = geneAcc.toUpperCase(); // always display gene ACCESSION in uppercase
			
			var geneAccNorm = geneAcc.replace(".", "_");

			var geneName = values[2]; // display both accession & gene name.

			// Gene accession
			var geneTd = '<td class="gene_accesion"><a href = "javascript:;" class="viewGeneNetwork" title="Display network in KnetMaps" id="viewGeneNetwork_' + row + '">' + geneAcc + '</a></td>';

			var geneNameTd = geneName.toUpperCase() == geneAcc
				// In this case, the API has found one accession only as name, so we're sure we don't have synonyms to expand
				? '<td></td>'
				// else, gene name column, with synonym expansion
				: '<td><span class="gene_name">' + geneName + '</span> <span onclick="createGeneNameSynonyms(this,' + geneId + ')" class="genename_info"><i class="fas fa-angle-down"></i></span> <div class="gene_name_synonyms"></div></td>';


			var taxId = values[5];
			var taxIdTd = ''
		
				var taxIdTd = '<td><a href="http://www.uniprot.org/taxonomy/' + taxId + '" target="_blank">' + taxId + '</a></td>';

			// Currently not shown
			var score = values[6];
			var scoreTd = '<td>' + score + '</td>';


			var chrTd = '';
			var chrStartTd = '';
			
			
				var chr = values[3];
				var chrStart = values[4];
				var chrTd = '<td>' + chr + '</td>';
				var chrStartTd = '<td>' + chrStart + '</td>';

				// QTL column with information box
				var qtlTd = '<td>';
				var withinQTLs = values[8];
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
			var evidenceTd = '<td>';
			var evidence = values[9];
			if (evidence.length > 0)
			{
				var evidences = evidence.split("||");
				for (var iev = 0; iev < evidences.length; iev++) {
					//Shows the icons
					var evidenceElems = evidences[iev].split("__");
					var evidenceCC = evidenceElems[0];
					var evidenceSize = evidenceElems[1];
					var evidenceNodes = evidenceElems[2].split("//");
					evidenceTd += '<div class="evidence_item evidence_item_' + evidenceCC + '" title="' + evidenceCC + '" ><span class="dropdown_box_open" id="evidence_box_open_' + geneAccNorm + evidenceCC + '">' + evidenceSize + '</span>';
					//Builds the evidence box
					evidenceTd += '<div id="evidence_box_' + geneAccNorm + evidenceCC + '" class="evidence_box"><span class="dropdown_box_close" id=evidence_box_close_' + geneAccNorm + evidenceCC + '></span>';
					evidenceTd += '<p><div class="evidence_item evidence_item_' + evidenceCC + '"></div> <span>' + evidenceCC + '</span></p>';
					for (var ievNode = 0; ievNode < evidenceNodes.length; ievNode++)
					{
						if (evidenceCC == 'Publication')
						{
							pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
							evidenceValueTd = '<a href="' + pubmedurl + evidenceNodes[ievNode].substring(5) + '" target="_blank">' + evidenceNodes[ievNode] + '</a>';
						}
						else
							evidenceValueTd = evidenceNodes[ievNode];

						evidenceTd += '<p>' + evidenceValueTd + '</p>';
					}
					evidenceTd += '</div>';
					evidenceTd += '</div>';
				} // for iev
			} // if evidence.length
			evidenceTd += '</td>';
			// Foreach evidence show the images - end

			var selectTd = '<td><input id="checkboxGene_' + row + '" type="checkbox" name= "candidates" value="' + geneAcc + '"></td>';
			table += geneTd + geneNameTd + taxIdTd + chrTd + chrStartTd + /*scoreTd + /*usersList +*/ /*qtlTd +*/ evidenceTd + selectTd;
			table += '</tr>';
		} // for row
		table += '</tbody>';
		table += '</table></div>';
		table += '</form>';
	} // if ( candidateGenes.length > 2 )

	table += '<div id="networkButton"><button id="new_generateMultiGeneNetworkButton" class="btn knet_button" title="Display the network in KnetMaps"> Create Network </button>';
	table += '</insert><div id="loadingNetworkDiv"></div></div>';

	document.getElementById('resultsTable').innerHTML = table;
	// scroll down to geneTable, but show tabviewer_buttons above
	document.getElementById('pGViewer_title').scrollIntoView();

	/*
	 * click Handler for viewing a network.
	 */
	$(".viewGeneNetwork").bind("click", { x: candidateGenes }, function (e) {
		e.preventDefault();
		var geneNum = $(e.target).attr("id").replace("viewGeneNetwork_", "");
		var values = e.data.x[geneNum].split("\t");

		// Generate Network in KnetMaps.
		generateCyJSNetwork(api_url + '/network', { list: [values[1]], keyword: keyword,  exportPlainJSON:false});
	});

	/*
	 * click handlers for opening and closing the qtl and evidence column drop down boxes.
	 */
	$(".dropdown_box_open").click(function (e) {
		e.preventDefault();
		var targetname = $(e.target).attr("id").replace("open_", "");
		$("#" + targetname).slideDown(300);
	});

	$(".dropdown_box_close").click(function (e) {
		e.preventDefault();
		var targetname = $(e.target).attr("id").replace("close_", "");
		$("#" + targetname).slideUp(100);
	});

	$("#new_generateMultiGeneNetworkButton").click(function (e) {
		generateMultiGeneNetwork_forNewNetworkViewer(keyword);
	});

	$("#tablesorter").tablesorter({
		headers: {
			// do not sort "select" column
			/*  5: {sorter:"digit"},*/
			4: { sorter: "digit" }, /* sort by SCORE column by default */
			8: { sorter: false }
		}
	});

	$("#numGenes").change(function (e) {
		createGenesTable(text, keyword, $("#numGenes").val());	//if number of genes to show changes, redraw table.
	});

	/*
	 * Revert Evidence Filtering changes on Gene View table
	 */
	$("#revertGeneView").click(function (e) {
		createGenesTable(text, keyword, $("#numGenes").val()); // redraw table
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
	$('input:checkbox[name="checkbox_Targets"]').bind("click", { x: candidateGenes }, function (e) {
		var numResults = candidateGenes.length - 2;
		for (var i = 1; i <= numResults; i++) {
			var values = e.data.x[i].split("\t");
			if (values[7] === "yes") {
				// Check which checkbox button option was selected.
				if ($(this).val() === "checkbox_Known") { // Select Known Targets.
					if (values[9].length > 0) {
						$("#checkboxGene_" + i).prop('checked', $(this).prop('checked'));
					}
				}
				else if ($(this).val() === "checkbox_Novel") { // Select Novel Targets.
					if (values[9].length === 0) {
						$("#checkboxGene_" + i).prop('checked', $(this).prop('checked'));
					}
				}
			}
		}
		// update selected genes count
		updateSelectedGenesCount();
	});

	// bind click event on all candidateGenes checkboxes in Gene View table.
	$('input:checkbox[name="candidates"]').click(function (e) {
		updateSelectedGenesCount(); // update selected genes count
	});

}


/*
 * Function
 * Generates the network using KnetMaps
 * @author: Ajit Singh.
 */
function generateCyJSNetwork(url, requestParams) {
    // Preloader for KnetMaps
    $("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>Loading Network, please wait...</b></div>');
    $("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div"><b>Loading Network, please wait...</b></div>');
    
    // Show loading spinner on 'tabviewer' div
    activateSpinner("#tabviewer");
    //console.log("network: start spinner...");
        
    $.post({
        url: url,
        timeout: 1000000,
        headers: {
          "Accept": "application/json; charset=utf-8",
          "Content-Type": "application/json; charset=utf-8"
        },
        datatype: "json",
        data: JSON.stringify(requestParams),
        fail: function (xhr,status,errorlog) {
          var server_error= JSON.parse(xhr.responseText); // full error json from server
          var errorMsg= "Failed to render knetwork...\t"+ server_error.statusReasonPhrase +" ("+ server_error.type +"),\t"+ server_error.title;
          console.log(server_error.detail);
          alert(errorMsg);
        },
				success: function (data) {
					// Network graph: JSON file.
					try {
						activateButton('NetworkCanvas');
						$("NetworkCanvas_button").removeClass('.network-default'); 

            // new Save button in Network View - intialise a click-to-save button with networkId (null when inside knetminer)
            var networkId= null;

            $('#knetSaveButton').html("<button class='network_button' onclick='exportAsJson("+networkId+","+JSON.stringify(requestParams)+");' title='Save to your workspace on KnetSpace.com'><img src='html/image/networksave.png' alt='save networks' width='20'/></button>");

            // new export/download button in Network View - intialise a button to export gene info from knetwork and save locally, using networkId (null when inside knetminer)
						//genes export button
						$('#knetGeneExport').html("<button class='export_button' onclick='exportKnetworkTable("+networkId+");'title='Download visible genes from knetwork as a table'>Tabular Format</button>");
								
						//visible graph button 
						$('#visibleGraphExport').html("<button class='export_button' onclick='downloadNetwork()' title='Download visible graph'>Cytoscape JSON </button>");
                                        
            if(data.graph.includes("var graphJSON=")) { // for old/current json that contains 2 JS vars
               var knetwork_blob= data.graph;
               knetwork_blob= filterKnetworkJson(knetwork_blob); // filter large knetwork jsons
               knetmaps.drawRaw('#knet-maps', /*data.graph*/knetwork_blob/*, networkId*/);
              }
            else { // response contents (pure JSON).
              var eles_jsons= data.graph.graphJSON.elements;
              var eles_styles= data.graph.graphJSON.style;
              var metadata_json= data.graph.allGraphData;
              knetmaps.draw('#knet-maps', eles_jsons, metadata_json, eles_styles/*, networkId*/);
            }

						// Remove the preloader message in Gene View, for the Network Viewer
						$("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"></div>');
						$("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div"></div>');
				  }
					catch (err) {
						var errorMsg = err.stack + ":::" + err.name + ":::" + err.message;
						console.log(errorMsg);
						//$("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div">' + "Error: <br/>" + "Details: " + errorMsg + '</div>');
				  }
        }, // success:
        always:
          function() { deactivateSpinner("#tabviewer"); } 
    }); // post()
}

/*
 * Function
 * Generates multi gene network in KnetMaps
 * @author: Ajit Singh.
 */
function generateMultiGeneNetwork_forNewNetworkViewer(keyword) {
    var candidatelist = [];
    //var cb_list = document.checkbox_form.candidates;
    var cb_list = $("input[name=candidates");
    var cb_list_len = cb_list.length;
    for (var i = 0; i < cb_list_len; i++) {
        if (cb_list[i].checked) {
            candidatelist.push(cb_list[i].value);
        }
    }
    //console.log(candidatelist.length +" gene(s) selected.");
    if (candidatelist == "") {
        $("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>Please select candidate genes.</b></div>');
    }
    else if (candidatelist.length > knetview_limit/*20*/) {
        if(enforce_genelist_limit === false) { // Pro plan user
           $("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>Gene networks can only be created for up to max. '+knetview_limit+' genes.</b></div>');
          }
          else { // Free plan user
            $("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>The KnetMiner Free Plan is limited to a network of '+knetview_limit+' genes. <a href="https://knetminer.com/pricing-plans" target="_blank">Upgrade to Pro plan now</a> to create networks for 200 genes</b></div>');
          }
    }
    else {
        generateCyJSNetwork(api_url + '/network', {keyword: keyword, list: candidatelist,exportPlainJSON:false});
    }
}


// update selected genes count whenever a Gene View table entry is clicked or Known/ Novel targets options are selected.
function updateSelectedGenesCount() {
    var count = $('input:checkbox[name="candidates"]:checked').length;
    $('#selectedGenesCount span').text(count + ' gene(s) selected'); // update
	if(count < 1){
		$("#NetworkCanvas_button").addClass('network-default'); 
	}
}


// function downloads cytoscape compactible json files
function downloadNetwork(){

    var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
    var exportJson = cy.json(); // full graphJSON
    var plainJson = filterJsonToExport(cy, exportJson);
	var graph = JSON.parse(plainJson);

	for(var keys in graph.graphJSON){
		if(graph.graphJSON.hasOwnProperty(keys) && keys !== 'elements'){
			delete graph.graphJSON[keys]
		}
	}

	var isDownloaded = downloadFunction('knetminer_network.json',JSON.stringify(graph.graphJSON, null,"\t")); 

	// ispopup stopped is set when the user clicks don't show again button
	var isPopupstopped = JSON.parse(localStorage.getItem('popup')); 

	// if file is downloaded and popup is still needed (i.e user did not click 'don't show again' button)
	if(isDownloaded && !isPopupstopped){
			// popup element 
			$('body').append("<div class='guide-popup'> <h4 style='margin: 0.5rem 0rem;'>First time downloading our Network Graphs?</h4><span>Kindly follow our <a style='color: white;' href='https://knetminer.com/tutorial/cytoscape' target='_blank'>guide</a> to setup KnetMiner Cytoscape styles correctly</span> <div  style='margin-top: 1rem;'> <button class='popup-btns' id='close-popup' style='background: black;color: white;margin-right: 0.5rem;' >Close</button> <button class='popup-btns' style='background:white;color:black;' id='hide-popup'>Don't show again</button> </div></div>");
			
			// remove element from DOM after 15 secs 
			setTimeout(function() {$('.guide-popup')
			.css('right','-32pc') 
			.remove(); 
			}, 15000);
			
			// close button to hide 
			$('#close-popup').click(function(){
				$('.guide-popup').css('right','-32pc')
			})

			// not showing popup anymore
			$('#hide-popup').click(function(){
				$('.guide-popup').css('right','-32pc'); 
				localStorage.setItem('popup', true); 
			})
		}
	
   
   
}




