

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
     if ( pvalue < 1E-4 ) return pvalue.toExponential ( 2 ).toString ().toUpperCase();
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
         table = '';
         table = table + '<div class="gene_header_container">' + evi_legend + '<input id="revertEvidenceView" type="button" value="" class="unhover" title= "Revert all filtering changes"></div><br>';
         table = table + '<div id= "evidenceViewTable" class = "scrollTable">';
         table = table + '<table id="tablesorterEvidence" class="tablesorter">';
         table = table + '<thead>';
         table = table + '<tr>';
         var header = evidenceTable[0].split("\t");

         table = table + '<th width="75">Omit/Add</th>';
         table = table + '<th width="50">Type</th>';
         table = table + '<th width="212">Description</th>';
         //table = table + '<th width="78">LUCENE ' + header[2] + '</th>';
         table = table + '<th width="78"> P-Value</th>';
         table = table + '<th width="70">Genes</th>';
         table = table + '<th width="103">Gene List</th>';
         table = table + '<th width="70">Select</th>';
         table = table + '</tr>';
         table = table + '</thead>';
         table = table + '<tbody class="scrollTable">';
 
         var eviTableLimit= evidenceTable.length-1;
 
         // limit evidence view table to top 1000 evidences
         if(eviTableLimit > 1000) eviTableLimit= 1001;
        
         for (var ev_i = 1; ev_i < eviTableLimit; ev_i++)
         {
           values = evidenceTable[ev_i].split("\t");
           table = table + '<tr>';
         
           table = table + '<td><p id="evidence_exclude_' + ev_i + '" style="padding-right:10px;" class="excludeKeyword evidenceTableExcludeKeyword" title="Exclude term"></p>' +
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
         
           // p-values
           var pvalue = values[3];
           pvalue = renderEvidencePvalue(pvalue);
           // to tell table-sorter that it's a number
           var sortedPval = pvalue == isNaN(pvalue) ? 1 : pvalue
         
           table += `<td actual-pvalue = '${sortedPval}'>${pvalue}</td>`;
           // /end:p-values
         
           // Count of all matching genes
           table = table + `<td ><span style="margin-right:.5rem;">${values[4]}</span> <span data-type="${values[0]}" data-description="${values[1]}" class="accession-download" onclick="openGeneListPopup(${values[7]},this)"><i class="fas fa-file-download"></i></span> <div id="concept${values[7]}"></div> </td>`;
         
           // Matching User Genes 
           var userGenes = values[5]; // The array of user genes, if any, else []
         
           if (userGenes)
           {
             userGenes = userGenes.trim();
             // The old code that returned "N/A" was fixed, now the API yields always an empty string if
             // it has no genes. So, this split works fine for 1-gene case too
             userGenes = userGenes.split(",");
           }
           else
             userGenes = [];
         
           if (userGenes.length == 0 || userGenes.length >= 500)
             // If they're too many, just yield the count
             table += '<td>' + userGenes.length + '</td>'; // user genes
           else
             // launch evidence network with them, if they're not too many.
             table += '<td><a href="javascript:;" class="userGenes_evidenceNetwork" title="Display in KnetMaps" id="userGenes_evidenceNetwork_' + ev_i + '">' + userGenes.length + '</a></td>';
         
           // /end:user genes
         
           var select_evidence = '<input id="checkboxEvidence_' + ev_i + '" type="checkbox" name= "evidences" value="' + values[7] + ':' + values[5] + '">';
           table = table + '<td>' + select_evidence + '</td>'; // eviView select checkbox
         
         } // for ev_i in evidenceTable
 
         
         table = table + '</tbody>';
         table = table + '</table>';
         table = table + '</div>';
         table = table + '<div class="gene-footer-container" style="justify-content:flex-end"><div class="gene-footer-flex" ><div id="evidence-count" class="selected-genes-count"><span style="color:#51CE7B; font-size: 14px;">No terms selected</span></div>'; 
         table = table + '<button id="new_generateMultiEvidenceNetworkButton" class="non-active btn knet_button" title="Render a knetwork of the selected evidences">Create Network</button></div></div>';
        //  table = table + '</insert><div id="loadingNetwork_Div"></div>';

 
         $('#evidenceTable').html(table);
 
         $(".evidenceTableExcludeKeyword").bind("click", {x: evidenceTable}, function (e)
         {
 
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
             // Initial sorting is by p-value, user genes, total genes
             // This ensures something significant if both pvalues and user genes are N/A and 0
             sortList: [ [3, 0], [5, 1], [4, 1]],
             textExtraction: function (node) { // Sort TYPE column
                 var attr = $(node).attr('type-sort-value');
                 if (typeof attr !== 'undefined' && attr !== false) {
                     return attr;
                 }
                 var actualPvalue = $(node).attr ( 'actual-pvalue' );
                 if ( actualPvalue ) return actualPvalue;
                 return $(node).text();
             }
         });
 
         /*
          * Revert filtering changes on Evidence View table
          */
         $("#revertEvidenceView").click(function (e) {
             createEvidenceTable(text, keyword); // redraw table
             $('#evidenceTable').data({keys:[]}); 
         });
         
         $("#revertEvidenceView").mouseenter(function (e) {
             $("#revertEvidenceView").removeClass('unhover').addClass('hover');
         });
         
         $("#revertEvidenceView").mouseout(function (e) {
             $("#revertEvidenceView").removeClass('hover').addClass('unhover');
         });
     }
    // bind click event on all candidateGenes checkboxes in evidence view table.
    $('input:checkbox[name="evidences"]').click(function (e) {
        var viewName = "Term";
        updateSelectedGenesCount("evidences","#evidence-count", viewName); // update selected genes count
    });

 }
 
 
 
 /*
  * Function to get the network of all "genes" related to a given evidence
  * 
  */
 function evidencePath(id, genes){
     
     var params = {keyword: 'ConceptID:'+id};
     if (genes.length > 0) {
         params.list = genes;
     }
     //console.dir(params);
     
     // Generate the Network in KnetMaps.
     //generateCyJSNetwork(api_url + '/evidencePath', params);
     // harmonized now to use 'network' api only
     generateCyJSNetwork(api_url + '/network', params,false);
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
 
        var evidenceNotice; 
     
     if (evidences_ondexid_list === "") {
         evidenceNotice = '<span><b>Please select evidence terms.</b></span>'
         jboxNotice(evidenceNotice, 'red', 300, 2000);
     }
     else {
         var params = {keyword: evidences_ondexid_list};
     params.list = geneids;
         if(geneids.length>0 && geneids[0].length>1) { 
           // Generate the evidence knetwork in KnetMaps.
           generateCyJSNetwork(api_url + '/network', params,false);
     }
        else {
            evidenceNotice = '<span><b>Search with a genelist to view network.</b></span>'
            new jBox('Notice', {
                content: evidenceNotice,
                color: 'red',
                autoClose: 2000,
                position: {
                    x: 45,
                    y: 252.9
                },
                target:'#revertEvidenceView',
                reposition:true
            });
        }
     }
 }
 

//  Function creates popup showing table of accessions associated to a genes concept
 function openGeneListPopup(conceptId, element){

    var modalElement = $(`#Modal_${conceptId}`); 

    // tooltips components 
    var accessionToolTip = accessionToolTips(`#copy-${conceptId}`,'Copy accession codes for KnetMiner genelist search');
    var downloadToolTip = accessionToolTips(`#download-${conceptId}`,'Download full accession data for internal or external use');

	// Checking if modal element is already created for current conceptID
    if(modalElement.length){

				// display already existed modal
        modalElement.css({
            "display":'block',
            "opacity": 1,
            "margin":'0 auto'
        });

        var ModalOverlay =  $(`#Modal_${conceptId}-overlay`)	

				ModalOverlay.css({
						"display":'block',
						"opacity": 1
				})

				// close modals with Overlay
				ModalOverlay.bind("click", function(e){
					e.preventDefault();
					modalElement.hide();
					ModalOverlay.hide();
				})

				// close Modals with cancel button
				$('.jBox-closeButton').bind("click", function(e){
					e.preventDefault();
					modalElement.hide();
					ModalOverlay.hide();
				})


    }else{
        
        // add a loader here 
        activateSpinner("#tabviewer");

        var description = $(element).attr("data-description");
        var type = $(element).attr("data-type");
        var getTaxIdFrag = multiSpeciesFeature.getTaxId();
        var associateArr = [];
        
        // fetching data genetable data 
        $.get(api_url + `/genome?keyword=ConceptID:${conceptId}`,'').done( function(data){
            if(data.geneTable !== null ){

            var geneTable = data.geneTable.split("\n");
            var headers = geneTable[0].split("\t").slice(1,4); 

            associateArr.push(headers.join("\t"));
            var accessionTable = "";
            accessionTable += '<div class="accession-popup-container">';
            accessionTable += '<div class="accession-popup-table"><table class="tablesorter">';
            accessionTable += '<thead>';
            accessionTable += '<tr>'
            accessionTable += '<th> ACCESSION </th>';
            accessionTable += '<th> GENE NAME</th>';
            accessionTable += '<th> CHROMOSOME </th></tr></thead><tbody>';

            var genesCount = geneTable.length >= 501 ? 501 : geneTable.length

            var genesCountMessage = geneTable.length >= 501 ? '<div style="display;flex; align-items:center; justify-items:center; order:4;"><span><b>First 500 genes</b></span>:<span> download or copy accession codes to see full list</span></div>' : '';


            for (var geneValue = 1; geneValue < (genesCount -1) ; geneValue++){
                var value = geneTable[geneValue].split("\t").slice(1,4);
                associateArr.push(value.join("\t"));
                accessionTable += '<tr><td>'+ value[0] +'</td>';
                accessionTable += '<td>'+ value[1] +'</td>';
                accessionTable += '<td>'+ value[2] +'</td></tr>';
            };

            accessionTable += '</tbody></table></div>';
        
            if(associateArr.length > 0)
            {
            var result = associateArr.join("\n");

            var utf8Bytes = encodeURIComponent(result).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            })
            
            var delimiterAttr = 'data:application/octet-stream;base64,' + btoa(utf8Bytes)+''; 
            accessionTable += genesCountMessage;
            accessionTable += '<div class="accession-popup-header"><div><p style="margin-bottom: 0.5rem; margin-top:0.5rem;">TaxID: '+ getTaxIdFrag.replace('?taxId=', "")+ '</p>';
            accessionTable +=  '<p style="margin-top: 0;"> '+ type +': '+ description +'</p></div>'; 
            accessionTable +=  '<div class="accession-popup-icons">'; 
            accessionTable +=  '<a id="copy-'+conceptId+'" class="accession-clipboard" href="javascript:;"><img src="html/image/copy.svg" alt="copy-accession"/></a>'; 
            accessionTable += '<a id="download-'+conceptId+'" class="accession-downloadicon" download="Accession.tsv" href="'+delimiterAttr+'"><img src="html/image/Knetdownload.png" alt="download-accession"/></a></div></div>';
            accessionTable +=  '</div>';
    
            // creating Jbox accession element
            var  accessionModal = new jBox('Modal', {
                id: `Modal_${conceptId}`,
                class:'accessionModal',
                animation: 'pulse',
                title: '<span><font size="3"><font color="#51CE7B">Gene List</font></font> <span id="accession-info" class="hint hint-small accession-info"><i  class="far fa-question-circle"></i> </span>',
                content: accessionTable,
                cancelButton: 'Exit',
                draggable: 'title',
                attributes: {
                    x: 'center',
                    y: 'center'
                },
                delayOpen: 50,
            });

            deactivateSpinner("#tabviewer");
            accessionModal.open()
        
            }

            }else{
                evidenceNotice = '<span><b>Sorry, these genes have no accessions</b></span>'
                jboxNotice(evidenceNotice, 'red', 300, 2000);
                deactivateSpinner("#tabviewer");
            }


            // copy clipboard event that allows users to copy accessions as comma seperated string.
            $(".accession-clipboard").bind("click", {x:data.geneTable}, function(e){
                e.preventDefault();
                var currentData = e.data.x.split("\n");
                accessionList = []

                for(var accessionColumn = 1; accessionColumn < (currentData.length -1); accessionColumn++){
                        var accessionItem = currentData[accessionColumn].split("\t").slice(1,2);
                        accessionList.push(accessionItem.join("\t"));
                }

                if(accessionList.length > 0 ){
                    navigator.clipboard.writeText(accessionList.join("\n")); 
                }

                evidenceNotice = '<span><b>Acession Copied to clipboard</b></span>'
                jboxNotice(evidenceNotice, 'green', 300, 2000);
                deactivateSpinner("#tabviewer");
                accessionModal.close();
                // remove 
                accessionToolTip.destroy();
                downloadToolTip.destroy();


            })


            // Popup icons mouseover and mouse leave events

            $(".accession-clipboard").mouseover(function(e){
                e.preventDefault();
                accessionToolTip.open()
            })

            $(".accession-clipboard").mouseout(function(e){
                e.preventDefault();
                accessionToolTip.close()
            })

            $(".accession-downloadicon").mouseover(function(e){
                e.preventDefault();
                downloadToolTip.open()
            })

            $(".accession-downloadicon").mouseout(function(e){
                e.preventDefault();
                downloadToolTip.close()
            })
            
        }).fail(function(xhr,status,errolog){
            jboxNotice('An error occured, kindly try again', 'red', 300, 2000); 
            deactivateSpinner("#tabviewer");

        }) 

    }
}

// Function creates tooltips for icons in genelist popup
function accessionToolTips(targetElement,content){
    return  new jBox('Tooltip', {target:`${targetElement}`, pointer: 'center', content:'<div style="text-align:center;width:160px;padding:0.25rem;font-size:0.75rem">'+content+'</div>',position:{
        x:'center',
        y:'top'
    }});
}

