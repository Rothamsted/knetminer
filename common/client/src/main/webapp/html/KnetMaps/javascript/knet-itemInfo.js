  /** Item Info.: display information about the selected concept(s)/ relation(s) including attributes, 
   * co-accessions and evidences.
   * @type type
   */
   function showItemInfo(selectedElement) {
    var itemInfo= "";
    var metadataJSON= allGraphData; // using the dynamically included metadata JSON object directly.
/*    console.log("Display Item Info. for id: "+ selectedElement.id() +", isNode ?= "+ 
            selectedElement.isNode() +", isEdge ?= "+ selectedElement.isEdge());*/
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
            // Concept 'value'.
            row= table.insertRow(1);
            cell1= row.insertCell(0);
            cell2= row.insertCell(1);
            cell1.innerHTML= "Value:";
            cell2.innerHTML= conValue;
            // Concept 'PID'.
            row= table.insertRow(2);
            cell1= row.insertCell(0);
            cell2= row.insertCell(1);
            cell1.innerHTML= "PID:";
            cell2.innerHTML= selectedElement.data('pid');
            // Concept 'Annotation'.
            row= table.insertRow(3);
            cell1= row.insertCell(0);
            cell2= row.insertCell(1);
            cell1.innerHTML= "Annotation:";
            cell2.innerHTML= selectedElement.data('annotation');
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

                    // Get all Synonyms (concept names).
                    var all_concept_names= "";
                    row= table.insertRow(table.rows.length); // new row.
                    cell1= row.insertCell(0);
                    cell2= row.insertCell(1);
                    cell1.innerHTML= "<b>Synonyms:</b>";
                    for(var k=0; k < metadataJSON.ondexmetadata.concepts[j].conames.length; k++) {
                        co_name= metadataJSON.ondexmetadata.concepts[j].conames[k].name;
                        if(co_name !== "") {
                           // Display concept synonyms along with an eye icon to use them as preferred concept name.
                           all_concept_names= all_concept_names + co_name +
                                   " <a><img src='html/KnetMaps/image/labelEye.png' alt='Use' id='"+ co_name +"' onclick='useAsPreferredConceptName(this.id);' onmouseover='onHover($(this));' onmouseout='offHover($(this));' title='Use as concept Label'/></a>" +"<br/>";
                          }
                       }
                    cell2.innerHTML= all_concept_names; // all synonyms.

                    // Get concept attributes.
                    row= table.insertRow(table.rows.length); // new row.
                    cell1= row.insertCell(0);
                    cell1.innerHTML= "<b>Attributes:</b>"; // sub-heading
                    for(var k=0; k < metadataJSON.ondexmetadata.concepts[j].attributes.length; k++) {
                        if((metadataJSON.ondexmetadata.concepts[j].attributes[k].attrname !== "size")
                            && (metadataJSON.ondexmetadata.concepts[j].attributes[k].attrname !== "visible")) {
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
                            // For Aminoacid sequence (AA).
                            else if(attrName === "AA") {
                                    attrName= "Aminoacid sequence (AA)";
                                    aaSeq= attrValue.match(/.{1,10}/g); // split into string array of 10 characters each.
                                    counter= 0;
                                    // Have monospaced font for AA sequence.
//                                    attrValue= "<font size=\"1\">";
                                    attrValue= "<span style= \"font-family: 'Courier New', Courier, monospace\">";
                                    for(var p=0; p < aaSeq.length; p++) {
                                        attrValue= attrValue + aaSeq[p] +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                                        counter= counter + 1;
                                        if(counter%3 === 0) {
                                           attrValue= attrValue +"<br/>";
                                          }
                                       }
//                                    attrValue= attrValue +"</font>";
                                    attrValue= attrValue +"</span>";
                                   }
                            cell1.innerHTML= attrName;
                            cell2.innerHTML= attrValue;
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
                               // open attribute url in new blank tab.
//                               attrValue= "<a href=\""+ coAccUrl +"\" target=\"_blank\">"+ co_acc +"</a>";
                               co_acc= "<a href=\""+ coAccUrl +"\" onclick=\"window.open(this.href,'_blank');return false;\">"+ co_acc +"</a>";
                              }
                            }
                        // Display concept accessions along with an eye icon to use them as preferred concept name.
                        co_acc= co_acc +" <a><img src='html/KnetMaps/image/labelEye.png' alt='Use' id='"+ accession +"' onclick='useAsPreferredConceptName(this.id);' onmouseover='onHover($(this));' onmouseout='offHover($(this));' title='Use as concept Label'/></a>";
                        cell1.innerHTML= accessionID;
                        cell2.innerHTML= co_acc;
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
                cell1.innerHTML= "Relation Label:";
                cell2.innerHTML= selectedElement.data('label'); // relation label
                // Relation 'source'.
                row= table.insertRow(1);
                cell1= row.insertCell(0);
                cell2= row.insertCell(1);
                cell1.innerHTML= "From:";
                cell2.innerHTML= selectedElement.data('source'); // relation source ('fromConcept').
                // Relation 'target'.
                row= table.insertRow(2);
                cell1= row.insertCell(0);
                cell2= row.insertCell(1);
                cell1.innerHTML= "To:";
                cell2.innerHTML= selectedElement.data('target'); // relation target ('toConcept').
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
                              relationEvidences= relationEvidences + metadataJSON.ondexmetadata.relations[j].evidences[k] +", ";
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
                                cell1.innerHTML= metadataJSON.ondexmetadata.relations[j].attributes[k].attrname;
                                cell2.innerHTML= metadataJSON.ondexmetadata.relations[j].attributes[k].value;
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
//    $("#infoDialog").html(itemInfo); // display in the dialog box.
   }

 // Open the Item Info pane when the "Item Info" option is selected for a concept or relation.
 function openItemInfoPane() {
//  myLayout.show('east', true); // to unhide (show) and open the pane.
//  myLayout.slideOpen('east'); // open the (already unhidden) Item Info pane.

  // $("#itemInfo").css("display","block"); // show the Item Infon div
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

 /*$("#btnCloseItemInfoPane").click(function() {
     console.log("Close ItemInfo pane...");
     $("#itemInfo").hide();
 });*/
 
 function closeItemInfoPane() {
  //   console.log("Close ItemInfo pane...");
     $("#itemInfo").hide();
 }

  // Remove shadow effect from nodes, if it exists.
  function removeNodeBlur(ele) {
    var thisElement= ele;
    try {
      if(thisElement.hasClass('BlurNode')) {
         // Remove any shadow created around the node.
         thisElement.removeClass('BlurNode');
        }
/*      thisElement.neighborhood().nodes().style({'opacity': '1'});
      thisElement.neighborhood().edges().style({'opacity': '1'});*/
     }
    catch(err) {
          console.log("Error occurred while removing Shadow from concepts with connected, hidden elements. \n"+"Error Details: "+ err.stack);
         }
  }

  // Show hidden, connected nodes connected to this node & also remove shadow effect from nodes, wheere needed.
  function showLinks(ele) {
    var selectedNode= ele;
    // Remove css style changes occurring from a 'tapdragover' ('mouseover') event.
//    resetRelationCSS(selectedNode);

    // Show concept neighborhood.
//    selectedNode.neighborhood().nodes().show();
//    selectedNode.neighborhood().edges().show();
    selectedNode.connectedEdges().connectedNodes().show();
    selectedNode.connectedEdges().show();

    // Remove shadow effect from the nodes that had hidden nodes in their neighborhood.
    removeNodeBlur(selectedNode);

    // Remove shadow effect from connected nodes too, if they do not have more hidden nodes in their neighborhood.
    selectedNode.connectedEdges().connectedNodes().forEach(function( elem ) {
        var its_connected_hidden_nodes= elem.connectedEdges().connectedNodes().filter('node[conceptDisplay = "none"]');
        var its_connected_hiddenNodesCount= its_connected_hidden_nodes.length;
        console.log("connectedNode: id: "+ elem.id() +", label: "+ elem.data('value') +", its_connected_hiddenNodesCount= "+ its_connected_hiddenNodesCount);
        if(its_connected_hiddenNodesCount </*<=*/ 1) {
//        if(its_connected_hiddenNodesCount /*<*/=== 0/*1*/) {
           removeNodeBlur(elem);
//           elem.connectedEdges().show();
          }
    });

    try { // Relayout the graph.
//         rerunGraphLayout(/*selectedNode.neighborhood()*/selectedNode.connectedEdges().connectedNodes());
         // Set a circle layout on the neighborhood.
         var eleBBox= selectedNode.boundingBox(); // get the bounding box of thie selected concept (node) for the layout to run around it.
         // Define the neighborhood's layout.
         var mini_circleLayout= { name: 'circle', radius: 2/*0.01*/, boundingBox: eleBBox,
                avoidOverlap: true, fit: true, handleDisconnected: true, padding: 10, animate: false, 
                counterclockwise: false, rStepSize: 1/*0.01*/, ready: /*undefined*/function() { cy.center(); cy.fit(); }, 
                stop: undefined/*function() { cy.center(); cy.fit(); }*/ };

         // Set the layout only using the hidden concepts (nodes).
//         console.log("Node neighborhood.filter(visible) size: "+ selectedNode.neighborhood().filter('node[conceptDisplay = "none"]').length);
//         if(selectedNode.neighborhood().length > 5/*2*/) {
              selectedNode.neighborhood().filter('node[conceptDisplay = "none"]').layout(mini_circleLayout);
//             }
        }
    catch(err) { console.log("Error occurred while setting layout on selected element's neighborhood: "+ err.stack); }
  }

  // Set the given name (label) for the selected concept.
  function useAsPreferredConceptName(new_conceptName) {
   try {
     var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
     cy.nodes().forEach(function(ele) {
      if(ele.selected()) {
         console.log("Selected concept: "+ ele.data('displayValue')/*ele.data('value')*/ +"; \t Use new preferred name (for concept Label): "+ new_conceptName);
         /*ele.data('Value', new_conceptName);*/
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
