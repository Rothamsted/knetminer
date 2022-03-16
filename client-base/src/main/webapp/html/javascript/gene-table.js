
/*
 * Function generate Geneview table and it shows once data is returned from function search keyword ajax calls
 *
 */
function createGenesTable(text, keyword, rows) {
    

    var ondexIds = []; 
    var table = "";

    var candidate_genes = text.split("\n");
    
    var results = candidate_genes.length - 2;

    if (candidate_genes.length > 2) {

        table = '';

        // Gene View: interactive summary legend for evidence types.
        var interactive_summary_Legend = getInteractiveSummaryLegend(text);
        
        var utf8Bytes = "";
        utf8Bytes = encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
          });



        table = table + '<p class="margin_left"><a download="genes.tsv" href="data:application/octet-stream;base64,' + btoa(utf8Bytes) + '" target="_blank">Download as TAB delimited file</a><br />';
        table = table + 'Select gene(s) and click "Create Network" button below to see the network.<span id="hintSortableTable" class="hint hint-small"> <i class="fas fa-info-circle"></i></span></p>';
        table = table + '<form name="checkbox_form">';
        table = table + '<u>Max</u> number of genes to show: ';
        table = table + '<select value="' + /*rows*/results + '" id="numGenes">';
        table = table + '<option value="1000"' + (rows == 1000 ? 'selected' : '') + '>1000</option>';
        table = table + '<option value="500"' + (rows == 500 ? 'selected' : '') + '>500</option>';
        table = table + '<option value="200"' + (rows == 200 ? 'selected' : '') + '>200</option>';
        table = table + '<option value="100"' + (rows == 100 ? 'selected' : '') + '>100</option>';
        table = table + '<option value="50"' + (rows == 50 ? 'selected' : '') + '>50</option>';
        table = table + '<option value="' + results + '"' + (rows == results ? 'selected' : '') + '>All (' + results + ')</option>';
        table = table + '<select>';
        table = table + '<div id="selectUser">Linked genes:<input type="checkbox" name="checkbox_Targets" value="checkbox_Known" title="Click to select genes with existing evidence." /> Unlinked genes:<input type="checkbox" name="checkbox_Targets" value="checkbox_Novel" title="Click to select genes without existing evidence." />' +
            '<div id="selectedGenesCount"><span style="color:#51CE7B; font-size: 14px;">No gene(s) selected</span></div>' + '</div>';
        table = table + '<br>';
        // dynamic Evidence Summary to be displayed above Gene View table
        table = table + '<div id="evidence_Summary_Legend" class="evidenceSummary">' + interactive_summary_Legend + '</div>';

        table = table + '<div id= "geneViewTable" class = "scrollTable">';
        table = table + '<table id = "tablesorter" class="tablesorter">';
        table = table + '<thead>';
        table = table + '<tr>';
        var values = candidate_genes[0].split("\t");
        table = table + '<th width="100">' + values[1] + '</th>';
        table = table + '<th width="100" title="Show ' + values[2] + ', if not same as ' + values[1] + '">' + values[2] + '</th>'; // added Gene Name to Gene View table
        if (multiorganisms == true) {
            table = table + '<th width="60">' + values[5] + '</th>';
        }
        if (reference_genome == true) {
            table = table + '<th width="60">' + values[3] + '</th>';
            table = table + '<th width="70">' + values[4] + '</th>';
        }
        table = table + '<th width="220">' + values[9] + '</th>';
        table = table + '<th width="70">Select</th>';
        table = table + '</tr>';
        table = table + '</thead>';
        table = table + '<tbody class="scrollTable">';
        //console.log("GeneView: display " + rows + " (from " + results + ") results.");

        //this loop iterates over the full table and prints the
        //first n rows + the user provided genes
        //can be slow for large number of genes, alternatively server
        //can filter and provide smaller file for display
        for (var i = 1; i <= results; i++) {
            var values = candidate_genes[i].split("\t");

            // adding Ondexid of current gene 
            ondexIds.push(parseInt(values[0]));

            if (i > rows /*&& values[7]=="no"*/) {
                continue;
            }
            table = table + '<tr>';
            var gene_Acc = values[1];
            gene_Acc = gene_Acc.toUpperCase(); // always display gene ACCESSION in uppercase
            var gene_Name = values[2]; // display both accession & gene name.
            // Fetch preferred concept (gene) name and use the shorter name out of the two.
            var gene = '<td class="gene_accesion"><a href = "javascript:;" class="viewGeneNetwork" title="Display network in KnetMaps" id="viewGeneNetwork_' + i + '">' + gene_Acc + '</a></td>';
            var geneName = '<td> <span class="gene_name">' + gene_Name + '</span> <span class="genename_info"><i class="fas fa-angle-down"></i></span> <div class="gene_name_synonyms"></div> </td>'; // geneName

             // TODO: implementation to be added from existig branches 
	      

            if (gene_Name.toLowerCase() === gene_Acc.toLowerCase()) {
                geneName = '<td></td>'; // don't display geneName, if identical to Accession
            }

            if (multiorganisms == true) {
                var taxid = '<td><a href="http://www.uniprot.org/taxonomy/' + values[5] + '" target="_blank">' + values[5] + '</a></td>';
            } else {
                var taxid = '';
            }
            if (reference_genome == true) {
                var chr = '<td>' + values[3] + '</td>';
                var start = '<td>' + values[4] + '</td>';
            } else {
                var chr = '';
                var start = '';
            }
            var score = '<td>' + values[6] + '</td>'; // score

            // QTL column with information box
            if (reference_genome == true) {
                var withinQTL = '<td>';
                if (values[8].length > 1) {
                    var withinQTLs = values[8].split("||");
                    //Shows the icons
                    withinQTL = '<td><div class="qtl_item qtl_item_' + withinQTLs.length + '" title="' + withinQTLs.length + ' QTLs"><a href"javascript:;" class="dropdown_box_open" id="qtl_box_open_' + values[1].replace(".", "_") + withinQTLs.length + '">' + withinQTLs.length + '</a>';

                    //Builds the evidence box
                    withinQTL = withinQTL + '<div id="qtl_box_' + values[1].replace(".", "_") + withinQTLs.length + '" class="qtl_box"><span class="dropdown_box_close" id="qtl_box_close_' + values[1].replace(".", "_") + withinQTLs.length + '"></span>';
                    withinQTL = withinQTL + '<p><span>' + "QTLs" + '</span></p>';

                    var uniqueQTLs = new Object();
                    var uniqueTraits = new Object();

                    for (var count_i = 0; count_i < withinQTLs.length; count_i++) {
                        var withinQTL_elements = withinQTLs[count_i].split("//");
                        if (withinQTL_elements[1].length > 0) {
                            if (uniqueTraits[withinQTL_elements[1]] == null)
                                uniqueTraits[withinQTL_elements[1]] = 1;
                            else
                                uniqueTraits[withinQTL_elements[1]] = uniqueTraits[withinQTL_elements[1]] + 1;
                        }
                        else {
                            if (uniqueQTLs[withinQTL_elements[0]] == null)
                                uniqueQTLs[withinQTL_elements[0]] = 1;
                            else
                                uniqueQTLs[withinQTL_elements[0]] = uniqueQTLs[withinQTL_elements[0]] + 1;
                        }
                    }

                    var unique = "";
                    for (var count_i = 0; count_i < withinQTLs.length; count_i++) {
                        var withinQTL_elements = withinQTLs[count_i].split("//");
                        if (withinQTL_elements[1].length > 0) {
                            if (unique.indexOf(withinQTL_elements[1] + ";") == -1) {
                                unique = unique + withinQTL_elements[1] + ";";
                                withinQTL = withinQTL + '<p>' + uniqueTraits[withinQTL_elements[1]] + ' ' + withinQTL_elements[1] + '</p>';
                            }
                        }
                        else {
                            if (unique.indexOf(withinQTL_elements[0] + ";") == -1) {
                                unique = unique + withinQTL_elements[0] + ";";
                                withinQTL = withinQTL + '<p>' + uniqueQTLs[withinQTL_elements[0]] + ' ' + withinQTL_elements[0] + '</p>';
                            }
                        }
                    }
                }
                else {
                    withinQTL = withinQTL + '0';
                }
                withinQTL = withinQTL + '</td>';
            }
            else {
                var withinQTL = '';
            }

            // For each evidence show the images - start
            var evidence = '<td>';
            var values_evidence = values[9];
            if (values_evidence.length > 0) {
				var evidences = values_evidence.split("||");
                for (var count_i = 0; count_i < evidences.length; count_i++) {
                    //Shows the icons
                    //var evidence_elements = evidences[count_i].split("//");
                    var evidence_elements = evidences[count_i].split("__");
					var evidence_cc= evidence_elements[0];
					var evidence_size= evidence_elements[1];
					var evidences_nodes= evidence_elements[2].split("//");
					//console.log("evidence_cc: "+ evidence_cc);
                    evidence = evidence + '<div class="evidence_item evidence_item_' + evidence_cc + '" title="' + evidence_cc + '" ><span class="dropdown_box_open" id="evidence_box_open_' + values[1].replace(".", "_") + evidence_cc + '">' + evidence_size + '</span>';
                    //Builds the evidence box
                    evidence = evidence + '<div id="evidence_box_' + values[1].replace(".", "_") + evidence_cc + '" class="evidence_box"><span class="dropdown_box_close" id=evidence_box_close_' + values[1].replace(".", "_") + evidence_cc + '></span>';
                    evidence = evidence + '<p><div class="evidence_item evidence_item_' + evidence_cc + '"></div> <span>' + evidence_cc + '</span></p>';
                    for (var count_eb = 0; count_eb < evidences_nodes.length; count_eb++) {
                        //link publications with pubmed
                        pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
                        if (evidence_cc == 'Publication')
                            evidenceValue = '<a href="' + pubmedurl + evidences_nodes[count_eb].substring(5) + '" target="_blank">' + evidences_nodes[count_eb] + '</a>';
                        else
                            evidenceValue = evidences_nodes[count_eb];

                        evidence = evidence + '<p>' + evidenceValue + '</p>';
                    }
                    evidence = evidence + '</div>';
                    evidence = evidence + '</div>';
                }
            }
            evidence = evidence + '</td>';
            // Foreach evidence show the images - end

            var select = '<td><input id="checkboxGene_' + i + '" type="checkbox" name= "candidates" value="' + values[1] + '"></td>';
            table = table + gene + geneName + taxid + chr + start + /*score + /*usersList +*/ /*withinQTL +*/ evidence + select; // hide score & QTL for now (18/07/18)
            table = table + '</tr>';
        }
        table = table + '</tbody>';
        table = table + '</table></div>';
        table = table + '</form>';
        
    }


    //table = table + '<div id="networkButton"><input id="new_generateMultiGeneNetworkButton" class="knet_button button" type="button" value="View Network" title="Display the network in KnetMaps">';
    table = table + '<div id="networkButton"><button id="new_generateMultiGeneNetworkButton" class="btn knet_button" title="Display the network in KnetMaps"> Create Network </button>';
    table = table + '</insert><div id="loadingNetworkDiv"></div></div>';

    document.getElementById('resultsTable').innerHTML = table;
	// scroll down to geneTable, but show tabviewer_buttons above
	document.getElementById('pGViewer_title').scrollIntoView();

    /*
     * click Handler for viewing a network.
     */
    $(".viewGeneNetwork").bind("click", {x: candidate_genes}, function (e) {
        e.preventDefault();
        var geneNum = $(e.target).attr("id").replace("viewGeneNetwork_", "");
        var values = e.data.x[geneNum].split("\t");
		
        // Generate Network in KnetMaps.
        generateCyJSNetwork(api_url + '/network', {list: [values[1]], keyword: keyword});
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
            4: {sorter: "digit"}, /* sort by SCORE column by default */
            8: {sorter: false}
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
    $('input:checkbox[name="checkbox_Targets"]').bind("click", {x: candidate_genes}, function (e) {
        var numResults = candidate_genes.length - 2;
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

    // bind click event on all candidate_genes checkboxes in Gene View table.
    $('input:checkbox[name="candidates"]').click(function (e) {
        updateSelectedGenesCount(); // update selected genes count
    });

    // functions takes ondex IDs of current genenames and send a get request to back end
    createGeneNameSynonyms(ondexIds); 

}; 


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
        data: JSON.stringify(requestParams)//,
        //beforeSend: deactivateSpinner("#tabviewer")
    }).fail(function (xhr,status,errorlog) {
                var server_error= JSON.parse(xhr.responseText); // full error json from server
                var errorMsg= "Failed to render knetwork...\t"+ server_error.statusReasonPhrase +" ("+ server_error.type +"),\t"+ server_error.title;
		// deactivateSpinner("#tabviewer");
                console.log(server_error.detail);
                alert(errorMsg);
        }).success(function (data) {
			// Remove loading spinner from 'tabviewer' div
		//	deactivateSpinner("#tabviewer");
				// Network graph: JSON file.
				try {
					activateButton('NetworkCanvas');
                                        // new Save button in Network View - intialise a click-to-save button with networkId (null when inside knetminer)
                                        var networkId= null;
                                        $('#knetSaveButton').html("<button id='saveJSON' class='btn knet_button' style='float:right;width:60px;' onclick='exportAsJson("+networkId+","+JSON.stringify(requestParams)+");' title='Save to your workspace on KnetSpace.com'>Save</button>");
                                        // new export/download button in Network View - intialise a button to export gene info from knetwork and save locally, using networkId (null when inside knetminer)
                                        $('#knetExportButton').html("<button id='downloadKnet' class='btn knet_button' style='float:right;width:60px;margin-right:10px;' onclick='exportKnetworkTable("+networkId+");' title='Download visible genes from knetwork as a table'>Export</button>");
                                        
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
        }).always(function() { deactivateSpinner("#tabviewer"); });
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
        generateCyJSNetwork(api_url + '/network', {keyword: keyword, list: candidatelist});
    }
}


// update selected genes count whenever a Gene View table entry is clicked or Known/ Novel targets options are selected.
function updateSelectedGenesCount() {
    var count = $('input:checkbox[name="candidates"]:checked').length;
    $('#selectedGenesCount span').text(count + ' gene(s) selected'); // update
}



