

/**
 * Used in the evidence table, to render p-values nicely.
 */
function renderEvidencePvalue(pvalueStr) {
    const na = "N/A";

    if (!pvalueStr) return na;

    var pvalue = Number(pvalueStr);

    // -1 is usually to mark that there is no p-value
    if (pvalue < 0) return na;
    // for smaller values, use the scientific notation with a suitable no. of digit, eg, 1.1234E-8
    if (pvalue < 1E-4) return pvalue.toExponential(2).toString().toUpperCase();
    // for bigger values, just round to a good digit, eg, 0.0123
    return pvalue.toFixed(4)
}

/**
 * 
 * Renders the evidence table from API output.
 * 
 * TODO: change the param names into more meaningful names as per the following (to be kept)
 *
 * tableStringOrRows: the API-produced string that represent the table in TSV format, or
 * the rows array, which is obtained from the former during the first call and passed in 
 * upon recursive calls (when isRefreshMode == true).
 * 
 * isRefreshMode: the function is being called after the first time, to manage a refresh/redraw
 * in response to user interaction.   
 * 
 * TODO: remove rows, WHAT THE HELL!? Use the first parameter as explained.
 * TODO: treat isRefreshMode as optional (ie, might be null)
 * TODO: keyword is never used, to be removed?
 */
function createEvidenceTable(text, keyword, rows, change)
{
    var table = "";
    var summaryArr = new Array();
    var summaryText = '';
    $('#evidenceTable').html("<p>No evidence found.</p>");
    var evidenceTable = text.split("\n");
    var results = evidenceTable.length - 2;

    if (evidenceTable.length > 2) 
    {
				// TODO: until we finish testing #727, you need to sort evidenceTable
				// and with a compare function that considers p-value, user genes, total genes in order
		    
        // Evidence View: interactive legend for evidences.
        // TODO: fix the names and use Js conventions (eg, eviLegend)
        var evi_legend = getEvidencesLegend(text);
        table = '';
        table = table + '<div class="gene_header_container">' + evi_legend + '<input id="revertEvidenceView" type="button" value="" class="unhover" title= "Revert all filtering changes"></div><br>';
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
        table = table + '<tbody class="scrollTable">';

        var eviTableLimit = evidenceTable.length - 1;

        // limit evidence view table to top scored rows
        // TODO: turn 'results' into a less confusing name, eg, displayedSize
        if (results >= 100 && !change) {
            rows = 100;
            eviTableLimit = 101;
        } else if (change && rows > results) {
            rows = results
        } else if (change && rows < results) {
            eviTableLimit = rows;
        }

        for (var ev_i = 1; ev_i < eviTableLimit; ev_i++)
        {
            values = evidenceTable[ev_i].split("\t");
            [type, nodeLabel,,pvalue,genes, geneList,,conceptId,genesCount, ...nonUsedValues] = values
            table = table + '<tr>';

            table = table + '<td><p id="evidence_exclude_' + ev_i + '" style="padding-right:10px;" class="excludeKeyword evidenceTableExcludeKeyword" title="Exclude term"></p>' +
                '<p id="evidence_add_' + ev_i + '" class="addKeyword evidenceTableAddKeyword" title="Add term"></p></td>';

            //link publications with pubmed
            pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
            if (type == 'Publication')
                evidenceValue = '<a href="' + pubmedurl + nodeLabel.substring(5) + '" target="_blank">' + nodeLabel + '</a>';
            else
                evidenceValue = nodeLabel;

            table = table + '<td type-sort-value="' + type + '"><div class="evidence_item evidence_item_' + type + '" title="' + type + '"></div></td>';
            table = table + '<td>' + evidenceValue + '</td>';

            // p-values
            //
            pvalue = renderEvidencePvalue(pvalue);
            // to tell table-sorter that it's a number
            var sortedPval = pvalue == isNaN(pvalue) ? 1 : pvalue

            table += `<td actual-pvalue = '${sortedPval}'>${pvalue}</td>`;
            // /end:p-values

            // Count of all matching genes
            table = table + `<td ><span style="margin-right:.5rem;">${genes}</span> <span data-type="${type}" data-description="${nodeLabel}" class="accession-download" onclick="openGeneListPopup(${conceptId},this)"><i class="fas fa-file-download"></i></span> <div id="concept${conceptId}"></div> </td>`;

            // launch evidence network with them, if they're not too many.
            table += '<td><a href="javascript:;" class="userGenes_evidenceNetwork" title="Display in KnetMaps" id="userGenes_evidenceNetwork_' + ev_i + '">' + genesCount + '</a></td>';
            // /end:user genes

            var select_evidence = '<input id="checkboxEvidence_' + ev_i + '" type="checkbox" name= "evidences" value="' + conceptId + ':' + geneList + '">';
            table = table + '<td>' + select_evidence + '</td>'; // eviView select checkbox

        } // for ev_i in evidenceTable
        
        
        // The trailer
        //
        
        table = table + '</tbody>';
        table = table + '</table>';
        
        
        table = table + '</div><div class="evidence-footer">';
        table = table + '<div class="evidence-select"><select value="' + results + '" id="evidence-select">';
        
        // TODO: WTH? Render it with a loop on a range array (as per #726)
        table += '<option value="1000"' + (rows == 1000 ? 'selected' : '') + '>1000 </option>';
        table += '<option value="500"' + (rows == 500 ? 'selected' : '') + '>500</option>';
        table += '<option value="200"' + (rows == 200 ? 'selected' : '') + '>200</option>';
        table += '<option value="100"' + (rows == 100 ? 'selected' : '') + '>100</option>';
        table += '<option value="50"' + (rows == 50 ? 'selected' : '') + '>50</option>';
        table += '<option value="' + results + '"' + (rows == results ? 'selected' : '') + '> All (' + results + ')</option> </select></div>';
        table = table + '<div class="gene-footer-container"><div class="gene-footer-flex" ><div id="evidence-count" class="selected-genes-count"><span style="color:#51CE7B; font-size: 14px;">No terms selected</span></div>';
        table = table + '<button id="new_generateMultiEvidenceNetworkButton" class="non-active btn knet_button" title="Render a knetwork of the selected evidences">Create Network</button></div></div>';
        //  table = table + '</insert><div id="loadingNetwork_Div"></div>';


        $('#evidenceTable').html(table);

        // TODO: appending handlers at the end is poor, it forces us to retrieve per-row params
        // from the HTML and even put such values into clumsy to-be-parsed strings
        //
        // Use a different style, with this in the rows loop:
        // function evidenceExcludeButtonEvent ( conceptId )
        //   ...
        // <p onclick = evidenceExcludeButtonEvent ( $conceptId ) ...>
        // 
        // In the current implementation: 
        // - injecting the table via data object is convoluted (and what sort of name is 'x'?!?)
        // - getting the element index from an ID string that carries structure (evidence_exclude_X) is
        //   convoluted
        // - using the index to re-parse the table row is garbage, values[7] is more garbage and the
        //   function shouldn't need the whole table, as suggested above. Should it ever need
        //   more than the concept ID, just change the handler signature and pass what's needed
        //   only (possibly, the entire row, but without forcing the handler to parse it again)
        // 

        $(".evidenceTableExcludeKeyword").bind("click", { x: evidenceTable }, function (e) {

            e.preventDefault();

            var targetID = $(e.target).attr("id");
            var evidenceNum = targetID.replace("evidence_exclude_", "");
            var values = e.data.x[evidenceNum].split("\t");

            if ($(e.target).hasClass("excludeKeyword")) {
                    excludeKeyword('ConceptID:' + values[7], targetID, 'keywords');
            } else {
                    excludeKeywordUndo('ConceptID:' + values[7], targetID, 'keywords');
            }
        });

        // TODO: similar to the above notes, use evidenceIncludeButtonEvent
        $(".evidenceTableAddKeyword").bind("click", { x: evidenceTable }, function (e) {

            e.preventDefault();

            var targetID = $(e.target).attr("id");

            var evidenceNum = targetID.replace("evidence_add_", "");

            var values = e.data.x[evidenceNum].split("\t");

            if ($(e.target).hasClass("addKeyword")) {
                if ($("#keywords").val() === '') {
                    $("#keywords").val('ConceptID:' + values[7]);
                    $('#' + targetID).toggleClass('addKeywordUndo addKeyword');
                    matchCounter();
                }
                else {
                    addKeyword('ConceptID:' + values[7], targetID, 'keywords');
                }
            } else {
                if ($("#keywords").val() === '') {
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
         * TODO: if it's not used anymore, remove it, else see notes above about per-row 
         * handlers
         */
        $(".generateEvidencePath").bind("click", { x: evidenceTable }, function (e) {
            e.preventDefault();
            var evidenceNum = $(e.target).attr("id").replace("generateEvidencePath_", "");
            var values = e.data.x[evidenceNum].split("\t");
            evidencePath(values[7], []);
        });

        /*
         * click handler for generating the evidence path network for user genes (using user_genes and search keywords, passed to api_url
         * @author: Ajit Singh (19/07/2018)
         * 
         * TODO: see notes above about per-row event handlers
         *   
         */
        $(".userGenes_evidenceNetwork").bind("click", { x: evidenceTable }, function (e) {
            e.preventDefault();
            // for user genes column in evidence view
            var evidenceNum = $(e.target).attr("id").replace("userGenes_evidenceNetwork_", "");
            var values = e.data.x[evidenceNum].split("\t");
            var evi_userGenes = geneList.trim(); // user gene(s) provided
            evidencePath(values[7], evi_userGenes.split(","));
        });


        // TODO: see notes above about per-row event handlers
        //
        // This case is even worse than the others, since it has multiple parameters fit into 
        // an HTML value, with ad-hoc syntax. This technique is rubbish when not needed, since
        // it introduces error-prone unneeded marshal/unmarshal code, which depends on remembering
        // the correct syntax to use to place HTML strings. Plus, it's potentially insecure.
        //
        $("#new_generateMultiEvidenceNetworkButton").click(function (e) {
            // new multi select checkboxes in evidence view to render knetwork via 'network' api
            generateMultiEvidenceNetwork();
            getLongWaitMessage.createLoader('#'+e.target.id,'#tabviewer_content','Creating Network')
        });

        $("#tablesorterEvidence").tablesorter({
            // Initial sorting is by p-value, user genes, total genes
            // This ensures something significant if both pvalues and user genes are N/A and 0
            sortList: [[3, 0], [5, 1], [4, 1]],
            textExtraction: function (node) { // Sort TYPE column
                var attr = $(node).attr('type-sort-value');
                if (typeof attr !== 'undefined' && attr !== false) {
                    return attr;
                }
                var actualPvalue = $(node).attr('actual-pvalue');
                if (actualPvalue) return actualPvalue;
                return $(node).text();
            }
        });

        /*
         * Revert filtering changes on Evidence View table
         */
        $("#revertEvidenceView").click(function (e) {
            createEvidenceTable(text, keyword, rows); // redraw table
            $('#evidenceTable').data({ keys: [] });
        });

        $("#revertEvidenceView").mouseenter(function (e) {
            $("#revertEvidenceView").removeClass('unhover').addClass('hover');
        });

        $("#revertEvidenceView").mouseout(function (e) {
            $("#revertEvidenceView").removeClass('hover').addClass('unhover');
        });
    }
    
    // TODO: these are useless when the the table isn't rendered. So the if ( evidenceTable.length ) block above
    // should be turned into something like: 
    // if ( evidenceTable.length <= 2 ) return
    // <function body>
    // and the whole block de-dented 
    //
    
    // bind click event on all candidateGenes checkboxes in evidence view table.
    $('input:checkbox[name="evidences"]').click(function (e) {
        var viewName = "Term";
        updateSelectedGenesCount("evidences", "#evidence-count", viewName); // update selected genes count
    });

    $("#evidence-select").change(function (e) {
        createEvidenceTable(text, keyword, $("#evidence-select option:selected").val(), true);  //if number of genes to show changes, redraw table.
    });
}

/*
 * Function to get the network of all "genes" related to a given evidence
 * 
 */
function evidencePath(id, genes) {

    var params = { keyword: 'ConceptID:' + id };
    if (genes.length > 0) {
        params.list = genes;
    }
    //console.dir(params);

    // Generate the Network in KnetMaps.
    //generateCyJSNetwork(api_url + '/evidencePath', params);
    // harmonized now to use 'network' api only
    generateCyJSNetwork(api_url + '/network', params, false);
}


/*
 * Function
 * Generates multi evidence network in KnetMaps
 * @author: Ajit Singh.
 */
function generateMultiEvidenceNetwork() {
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

        // fetching data genetable data with a timeout of 1min 66secs
        $.get({ url: api_url + `/genome?keyword=ConceptID:${conceptId}`, data: '', timeout: 100000 }).done(function (data) {
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
        target: `${targetElement}`, pointer: 'center', content: '<div style="text-align:center;width:160px;padding:0.25rem;font-size:0.75rem">' + content + '</div>', position: {
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


// function countString 


