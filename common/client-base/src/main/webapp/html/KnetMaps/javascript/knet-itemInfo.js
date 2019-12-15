  /** Item Info.: display information about the selected concept(s)/ relation(s) including attributes, 
   * co-accessions and evidences.
   */
var KNETMAPS = KNETMAPS || {};

KNETMAPS.ItemInfo = function() {
	
	var my = function() {};

   my.showItemInfo = function(selectedElement) {
    var itemInfo= "";
    var metadataJSON= allGraphData; // using the dynamically included metadata JSON object directly.
    var createExpressionEntries= false;
    try {
         var cy= $('#cy').cytoscape('get');
         // Display the Item Info table in its parent div.
         document.getElementById("itemInfo_Table").style.display= "inline";
         // Display item information in the itemInfo <div> in a <table>.
         var table= document.getElementById("itemInfo_Table").getElementsByTagName('tbody')[0]; // get the Item Info. table.
         // Clear the existing table body contents.
         table.innerHTML= "";
         if(selectedElement.isNode()) {
            conID= selectedElement.id(); // id
            conValue= selectedElement.data('value'); // value
            // Unselect other concepts.
            cy.$(':selected').nodes().unselect();
            // Explicity select (highlight) the concept.
            cy.$('#'+conID).select();

            var row= table.insertRow(0); // create a new, empty row.
            // Insert new cells in this row.
            var cell1= row.insertCell(0);
            var cell2= row.insertCell(1);
            // Store the necessary data in the cells.
            cell1.innerHTML= "Concept Type:";
            cell2.innerHTML= selectedElement.data('conceptType'); // concept Type
            // Concept 'Annotation'.
            if(selectedElement.data('annotation') !== "") {
               row= table.insertRow(1/*3*/);
               cell1= row.insertCell(0);
               cell2= row.insertCell(1);
               cell1.innerHTML= "Annotation:";
               cell2.innerHTML= selectedElement.data('annotation');
              }
            // Get all metadata for this concept from the metadataJSON variable.
            for(var j=0; j < metadataJSON.ondexmetadata.concepts.length; j++) {
                if(selectedElement.id() === metadataJSON.ondexmetadata.concepts[j].id) {
                    // Concept 'elementOf'.
                    row= table.insertRow(table.rows.length/* - 1*/); // new row.
                    cell1= row.insertCell(0);
                    cell2= row.insertCell(1);
                    cell1.innerHTML= "Source:";
                    cell2.innerHTML= metadataJSON.ondexmetadata.concepts[j].elementOf;

                    // Get evidence information.
                    var evidences= "";
                    row= table.insertRow(table.rows.length); // new row.
                    cell1= row.insertCell(0);
                    cell2= row.insertCell(1);
                    cell1.innerHTML= "Evidence:";
                    for(var k=0; k < metadataJSON.ondexmetadata.concepts[j].evidences.length; k++) {
                        if(metadataJSON.ondexmetadata.concepts[j].evidences[k] !== "") {
                           evidences= evidences + metadataJSON.ondexmetadata.concepts[j].evidences[k] +", ";
                          }
                       }
                    cell2.innerHTML= evidences.substring(0, evidences.length-2);
                    
                    // Concept 'Description'.
                    if(metadataJSON.ondexmetadata.concepts[j].description !== "") {
                       row= table.insertRow(table.rows.length);
                       cell1= row.insertCell(0);
                       cell2= row.insertCell(1);
                       cell1.innerHTML= "Description:";
                       cell2.innerHTML= metadataJSON.ondexmetadata.concepts[j].description;
                      }

                    // Get all Synonyms (concept names).
                    var all_concept_names= "";
                    row= table.insertRow(table.rows.length); // new row.
                    cell1= row.insertCell(0);
                    cell2= row.insertCell(1);
                    cell1.innerHTML= "<b>Synonyms:</b>";
                    for(var k=0; k < metadataJSON.ondexmetadata.concepts[j].conames.length; k++) {
                        var coname_Synonym= metadataJSON.ondexmetadata.concepts[j].conames[k].name;
                        var synonymID= coname_Synonym;
                        if(coname_Synonym !== "") {
                           if(synonymID.indexOf('<span') > -1) { // For html content within text, use html tags.
                              synonymID= '<html>'+ synonymID +'</html>';
                              synonymID= jQuery(synonymID).text(); // filter out html content from id field.
                             }
                           // Display concept synonyms along with an eye icon to use them as preferred concept name.
                           var dispSynonym= coname_Synonym +
                                   ' <input type="submit" value="" class="knetSynonym" id="'+ synonymID +'" onclick="KNETMAPS.ItemInfo().useAsPreferredConceptName(this.id);" onmouseover="KNETMAPS.Menu().onHover($(this));" onmouseout="KNETMAPS.Menu().offHover($(this));" title="Use as concept Label"/>' +'<br/>';
                           all_concept_names= all_concept_names + dispSynonym;
                          }
                       }
                    cell2.innerHTML= all_concept_names; // all synonyms.

                    // Get concept attributes.
                    row= table.insertRow(table.rows.length); // new row.
                    cell1= row.insertCell(0);
                    cell1.innerHTML= "<b>Attributes:</b>"; // sub-heading
                    for(var k=0; k < metadataJSON.ondexmetadata.concepts[j].attributes.length; k++) {
                        if((metadataJSON.ondexmetadata.concepts[j].attributes[k].attrname !== "size")
                            && (metadataJSON.ondexmetadata.concepts[j].attributes[k].attrname !== "visible")
                            && (metadataJSON.ondexmetadata.concepts[j].attributes[k].attrname !== "flagged")
                            && (!(metadataJSON.ondexmetadata.concepts[j].attributes[k].attrname.includes("exp_")))) {
                            row= table.insertRow(table.rows.length/* - 1*/); // new row.
                            cell1= row.insertCell(0);
                            cell2= row.insertCell(1);
                            attrName= metadataJSON.ondexmetadata.concepts[j].attributes[k].attrname;
                            attrValue= metadataJSON.ondexmetadata.concepts[j].attributes[k].value;
                            // For Taxonomy ID, display url (created via config>> url_mappings.json).
                            if((attrName === "TAXID") || (attrName === "TX")) {
                               for(var u=0; u < url_mappings.html_acc.length; u++) {
                                   if((url_mappings.html_acc[u].cv === attrName) || (url_mappings.html_acc[u].cv === "TX")) {
                                      attrUrl= url_mappings.html_acc[u].weblink + attrValue; // Taxonomy ID url.
                                      // open attribute url in new blank tab.
//                                        attrValue= "<a href=\""+ attrUrl +"\" target=\"_blank\">"+ attrValue +"</a>";
                                      attrValue= "<a href=\""+ attrUrl +"\" onclick=\"window.open(this.href,'_blank');return false;\">"+ attrValue +"</a>";
                                     }
                                  }
                              }
                            else if(attrName === "URL") {
                                    attrName="URL(s)";
                                    var urlAttrValue= attrValue;
                                    attrValue= "";
                                    urlAttrValue= urlAttrValue.replace(/\s/g,''); // remove spaces, if any
                                    var urls= urlAttrValue.split(",");
                                    urls.forEach(function(entry,index) {
                                         attrValue= attrValue +"<a href=\""+ entry +"\" onclick=\"window.open(this.href,'_blank');return false;\">"+ entry +"</a>,<br/>";
                                        });
                                   // attrValue= attrValue.substring(0,attrValue.length-1); // omit last comma
                                    attrValue= attrValue.substring(0,attrValue.lastIndexOf("<")-1); // omit last break & comma
                                   }
                            // For Aminoacid sequence (AA).
                            else if(attrName.includes("AA")) {
                                    attrName= "Aminoacid sequence ("+ attrName +")";
                                    aaSeq= attrValue.match(/.{1,10}/g); // split into string array of 10 characters each.
                                    counter= 0;
                                    // Have monospaced font for AA sequence.
                                    attrValue= "<span style= \"font-family: 'Courier New', Courier, monospace\">";
                                    for(var p=0; p < aaSeq.length; p++) {
                                        attrValue= attrValue + aaSeq[p] +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                                        counter= counter + 1;
                                        if(counter%3 === 0) {
                                           attrValue= attrValue +"<br/>";
                                          }
                                       }
                                    attrValue= attrValue +"</span>";
                                   }
                            cell1.innerHTML= attrName;
                            cell2.innerHTML= attrValue;
                           }
                         if(metadataJSON.ondexmetadata.concepts[j].attributes[k].attrname.includes("exp_")) { // write gene expression data later, if exists
                            createExpressionEntries= true;
                           }
                        }

                    // Get concept accessions.
                    row= table.insertRow(table.rows.length); // new row.
                    cell1= row.insertCell(0);
                    cell1.innerHTML= "<b>Accessions:</b>"; // sub-heading
                    for(var k=0; k < metadataJSON.ondexmetadata.concepts[j].coaccessions.length; k++) {
                        row= table.insertRow(table.rows.length/* - 1*/); // new row.
                        cell1= row.insertCell(0);
                        cell2= row.insertCell(1);
                        accessionID= metadataJSON.ondexmetadata.concepts[j].coaccessions[k].elementOf;
                        co_acc= metadataJSON.ondexmetadata.concepts[j].coaccessions[k].accession;
                        accession= co_acc; // retain the original accession value for the label/eye icon
                        for(var u=0; u < url_mappings.html_acc.length; u++) {
                            if(url_mappings.html_acc[u].cv === accessionID) {
                               coAccUrl= url_mappings.html_acc[u].weblink + co_acc; // co-accession url.
                               if(accessionID === "CO") { coAccUrl= coAccUrl +"/"; }
							   coAccUrl= coAccUrl.replace('TO:','').replace('PO:',''); // remove TO: or PO:, if exists
                               coAccUrl= coAccUrl.replace(/\s/g,''); // remove spaces, if any
                               // open attribute url in new blank tab.
                               co_acc= "<a href=\""+ coAccUrl +"\" onclick=\"window.open(this.href,'_blank');return false;\">"+ co_acc +"</a>";
                              }
                            }
                        // Display concept accessions along with an eye icon to use them as preferred concept name.
                        co_acc= co_acc +" <input type='submit' value='' class='knetSynonym' id='"+ accession +"' onclick='KNETMAPS.ItemInfo().useAsPreferredConceptName(this.id);' onmouseover='KNETMAPS.Menu().onHover($(this));' onmouseout='KNETMAPS.Menu().offHover($(this));' title='Use as concept Label'/>";
                        cell1.innerHTML= accessionID;
                        cell2.innerHTML= co_acc;
                       }
                    // Add Gene Expression data, if exists.
                    if(createExpressionEntries) {
                       // Create Expression header
                       row= table.insertRow(table.rows.length); // new row.
                       cell1= row.insertCell(0);
                       cell1.innerHTML= "<b>Gene Expression:</b>"; // sub-heading
                       for(var k=0; k < metadataJSON.ondexmetadata.concepts[j].attributes.length; k++) {
                           if(metadataJSON.ondexmetadata.concepts[j].attributes[k].attrname.includes("exp_")) {
                              // Insert Gene Expression Data
                              row= table.insertRow(table.rows.length/* - 1*/); // new row.
                              cell1= row.insertCell(0);
                              cell2= row.insertCell(1);
                              attrName= metadataJSON.ondexmetadata.concepts[j].attributes[k].attrname;
                              attrValue= metadataJSON.ondexmetadata.concepts[j].attributes[k].value;
                              cell1.innerHTML= attrName;
                              cell2.innerHTML= attrValue;
                             }
                          }
                      }
                   }
               }
           }
        else if(selectedElement.isEdge()) {
                var row= table.insertRow(0);
                // Insert new cells in this row.
                var cell1= row.insertCell(0);
                var cell2= row.insertCell(1);
                // Store the necessary data in the cells.
                cell1.innerHTML= "Type:";
                cell2.innerHTML= selectedElement.data('label'); // relation label
                // Relation 'source'.
                row= table.insertRow(1);
                cell1= row.insertCell(0);
                cell2= row.insertCell(1);
                cell1.innerHTML= "From:";
                var fromID= selectedElement.data('source'); // relation source ('fromConcept').
                cell2.innerHTML= cy.$('#'+fromID).data('value') +" ("+ cy.$('#'+fromID).data('conceptType').toLowerCase() +")"; // relation source.
                // Relation 'target'.
                row= table.insertRow(2);
                cell1= row.insertCell(0);
                cell2= row.insertCell(1);
                cell1.innerHTML= "To:";
                var toID= selectedElement.data('target'); // relation destination ('toConcept').
                cell2.innerHTML= cy.$('#'+toID).data('value') +" ("+ cy.$('#'+toID).data('conceptType').toLowerCase() +")"; // relation destination.
                // Get all metadata for this relation from the metadataJSON variable.
                for(var j=0; j < metadataJSON.ondexmetadata.relations.length; j++) {
                    if(selectedElement.id() === metadataJSON.ondexmetadata.relations[j].id) {
                       // Get evidence information.
                       var relationEvidences= "";
                       row= table.insertRow(table.rows.length); // new row.
                       cell1= row.insertCell(0);
                       cell2= row.insertCell(1);
                       cell1.innerHTML= "Evidence:";
                       for(var k=0; k < metadataJSON.ondexmetadata.relations[j].evidences.length; k++) {
                           if(metadataJSON.ondexmetadata.relations[j].evidences[k] !== "") {
                              var evi= metadataJSON.ondexmetadata.relations[j].evidences[k]; // evidenceType
                              if(evi.includes("ECO:")) {
                                 evi= evi.replace(/\s/g,''); // remove spaces, if any
                                 var evi_url= "http://ols.wordvis.com/q="+ evi; // ECO evidence_type url
                                 evi= "<a href=\""+ evi_url +"\" onclick=\"window.open(this.href,'_blank');return false;\">"+ evi +"</a>";
                                }
                              relationEvidences= relationEvidences + evi +", ";
                             }
                          }
                       cell2.innerHTML= relationEvidences.substring(0, relationEvidences.length-2);

                        // Get relation attributes.
                        row= table.insertRow(table.rows.length); // new row.
                        cell1= row.insertCell(0);
                        cell1.innerHTML= "<b>Attributes:</b>"; // sub-heading
                        for(var k=0; k < metadataJSON.ondexmetadata.relations[j].attributes.length; k++) {
                            if((metadataJSON.ondexmetadata.relations[j].attributes[k].attrname !== "size")
                               && (metadataJSON.ondexmetadata.relations[j].attributes[k].attrname !== "visible")) {
                                row= table.insertRow(table.rows.length/* - 1*/); // new row.
                                cell1= row.insertCell(0);
                                cell2= row.insertCell(1);
                                attrName= metadataJSON.ondexmetadata.relations[j].attributes[k].attrname;
                                attrValue= metadataJSON.ondexmetadata.relations[j].attributes[k].value;
                                // For PubMed ID's (PMID), add urls (can be multiple for same attribute name)
                                if((attrName === "PMID") || (attrName === "PubMed")) {
                                   // get PMID url from KnetMaps/config
                                   var pmidUrl= "";
                                   for(var u=0; u < url_mappings.html_acc.length; u++) {
                                       if(url_mappings.html_acc[u].cv === attrName) {
                                          pmidUrl= url_mappings.html_acc[u].weblink; // PMID url
                                         }
                                     }
                                   // for multiple PMID's for relation attribute
                                   var pmidAttrValue= "";
                                   var pmids= attrValue.split(",");
                                   pmids.forEach(function(entry,index) {
                                         entry= entry.replace(/\s/g,''); // remove spaces, if any
                                         attrUrl= pmidUrl + entry;
                                         pmidAttrValue= pmidAttrValue +"<a href=\""+ attrUrl +"\" onclick=\"window.open(this.href,'_blank');return false;\">"+ entry +"</a>,<br/>";
                                        });
                                    pmidAttrValue= pmidAttrValue.substring(0,pmidAttrValue.lastIndexOf("<")-1); // omit last break & comma
                                    attrValue= pmidAttrValue; // return urls
                                   }
                                cell1.innerHTML= attrName;
                                cell2.innerHTML= attrValue;
                               }
                           }
                       }
                   }
               }
        }
    catch(err) {
          itemInfo= "Selected element is neither a Concept nor a Relation"; 
          itemInfo= itemInfo +"<br/>Error details:<br/>"+ err.stack; // error details
          console.log(itemInfo);
         }
   }

 // Open the Item Info pane when the "Item Info" option is selected for a concept or relation.
   my.openItemInfoPane = function() {
  var effect = 'slide';
  // Set the options for the effect type chosen
  var options = { direction: 'right' };
  // Set the duration (default: 400 milliseconds)
  var duration = 500;
  if($('#itemInfo').css("display")==="none") {
     $('#itemInfo').toggle(effect, options, duration);
    // $('#itemInfo').slideToggle(500);
    }
 }

   my.closeItemInfoPane = function() {
  $("#itemInfo").hide();
 }

  // Remove shadow effect from nodes, if it exists.
   my.removeNodeBlur = function(ele) {
    var thisElement= ele;
    try {
      if(thisElement.hasClass('BlurNode')) { // Remove any shadow created around the node.
         thisElement.removeClass('BlurNode');
        }
     }
    catch(err) {
          console.log("Error occurred while removing Shadow from concepts with connected, hidden elements. \n"+"Error Details: "+ err.stack);
         }
  }

  // Show hidden, connected nodes connected to this node & also remove shadow effect from nodes, wheere needed.
   my.showLinks = function(ele) {
    var selectedNode= ele;
    // Show concept neighborhood.
    selectedNode.connectedEdges().connectedNodes().removeClass('HideEle');
    selectedNode.connectedEdges().connectedNodes().addClass('ShowEle');

    selectedNode.connectedEdges().removeClass('HideEle');
    selectedNode.connectedEdges().addClass('ShowEle');

    // Remove shadow effect from the nodes that had hidden nodes in their neighborhood.
    my.removeNodeBlur(selectedNode);

    // Remove shadow effect from connected nodes too, if they do not have more hidden nodes in their neighborhood.
    selectedNode.connectedEdges().connectedNodes().forEach(function( elem ) {
        var its_connected_hidden_nodes= elem.connectedEdges().connectedNodes().filter('node[conceptDisplay = "none"]');
        var its_connected_hiddenNodesCount= its_connected_hidden_nodes.length;
        //console.log("connectedNode: id: "+ elem.id() +", label: "+ elem.data('value') +", its_connected_hiddenNodesCount= "+ its_connected_hiddenNodesCount);
        if(its_connected_hiddenNodesCount </*<=*/ 1) {
           my.removeNodeBlur(elem);
          }
    });

    try { // Relayout the graph.
         // Set a circle layout on the neighborhood.
         var eleBBox= selectedNode.boundingBox(); // get the bounding box of thie selected concept (node) for the layout to run around it.
         // Define the neighborhood's layout.
         var mini_circleLayout= { name: 'circle', radius: 2/*0.01*/, boundingBox: eleBBox,
                avoidOverlap: true, fit: true, handleDisconnected: true, padding: 10, animate: false, 
                counterclockwise: false, rStepSize: 1/*0.01*/, ready: /*undefined*/function() { cy.center(); cy.fit(); }, 
                stop: undefined/*function() { cy.center(); cy.fit(); }*/ };

         // Set the layout only using the hidden concepts (nodes).
              selectedNode.neighborhood().filter('node[conceptDisplay = "none"]').layout(mini_circleLayout);
        }
    catch(err) { console.log("Error occurred while setting layout on selected element's neighborhood: "+ err.stack); }
  }

  // Set the given name (label) for the selected concept.
   my.useAsPreferredConceptName = function(new_conceptName) {
   try {
     var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
     cy.nodes().forEach(function(ele) {
      if(ele.selected()) {
         if(new_conceptName.length> 30) { new_conceptName= new_conceptName.substr(0,29)+'...'; }
         ele.data('displayValue', new_conceptName);
         if(ele.style('text-opacity') === '0') {
            ele.style({'text-opacity': '1'}); // show the concept Label.
           }
        }
     });
    }
   catch(err) {
          console.log("Error occurred while altering preferred concept name. \n"+"Error Details: "+ err.stack);
         }
  }
   
   return my;
};
