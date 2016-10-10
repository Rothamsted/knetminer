function onHover(thisBtn) {
	 var img= $(thisBtn).attr('src');
//    $("#"+img).attr('src', 'image/'+img+'_hover.png');
    $(thisBtn).attr('src', img.replace('.png','_hover.png'));
 }

 function offHover(thisBtn) {
	 var img= $(thisBtn).attr('src');
//    $("#"+img).attr('src', 'image/'+img+'.png');
    $(thisBtn).attr('src', img.replace('_hover.png','.png'));
 }

   // Go to Help docs.
  function openKnetHelpPage() {
   var helpURL = 'https://github.com/KeywanHP/QTLNetMiner/wiki/New-QTLNetMiner-Network-Viewer';
   window.open(helpURL, '_blank');
  }

  // Reset: Re-position the network graph.
  function resetGraph() {
   //console.log("resetGraph...");
   /*cy*/$('#cy').cytoscape('get').reset().fit(); // reset the graph's zooming & panning properties.
//   /*cy*/$('#cy').cytoscape('get').fit();
  }
  
  // Open advanced KnetMaps (using Twitter Bootstrap) menu.
  
  // Layouts dropdown: onChange
  /*$("#layouts_dropdown").selectmenu({
	change: function( event, data ) {
         console.log("layouts_dropdown:"+ data.item.value);
		 rerunLayout();
       }
   });
  
  // Label visibility  dropdown: onChange
  $("#changeLabelVisibility").selectmenu();
  $("#changeLabelVisibility").on( "selectmenuchange", function( event, data ) {console.log("changeLabelVisibility:"+ data.item.value);
		 showHideLabels(this.value);} );

  // Label font dropdown: onChange
  $("#changeLabelFont").selectmenu({
	change: function( event, data ) {
         console.log("changeLabelFont:"+ data.item.value);
		 changeLabelFontSize(this.value);
       }
   });*/

   // Search the graph for a concept using BFS: breadthfirst search
  function findConcept(conceptName) {
   console.log("Search for concept value: "+ conceptName);
   var foundID;
   var cy= $('#cy').cytoscape('get');
   cy.nodes().forEach(function( ele ) {
       if(ele.data('conceptDisplay') === 'element') {
          if(ele.data('value').indexOf(conceptName) > -1) {
             console.log("Search found: "+ ele.data('value'));
             foundID= ele.id(); // the found node

             // select the matched concept.
             cy.$('#'+foundID).select();
            }
        }
      });
  }

 // Export the graph as a JSON object in a new Tab and allow users to save it.
  function exportAsJson() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
   var exportJson= cy.json(); // get JSON object for the network graph.

   // Display in a new blank browser tab.
//   window.open().document.write(exportJson); // for text data
   window.open('data:application/json;' + (window.btoa?'base64,'+btoa(JSON.stringify(exportJson)):JSON.stringify(exportJson))); // for JSON data
  }
  
  // Export the graph as a .png image and allow users to save it.
  function exportAsImage() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
   // Export as .png image
   var png64= cy.png(); // .setAttribute('crossOrigin', 'anonymous');

   // Display the exported image in a new blank browser window instead of having it in the same window.
   window.open(png64,'Image','width=1200px,height=600px,resizable=1');
  }

  // Remove hidden effect from nodes/ edges, if hidden.
  function removeHiddenEffect(ele) {
    var thisElement= ele;
    try {
      if(thisElement.hasClass('HideIt')) {
         thisElement.removeClass('HideIt');
        }
     }
    catch(err) {
          console.log("Error occurred while unhiding concepts/ relations. \n"+"Error Details: "+ err.stack);
         }
  }

  // Show all concepts & relations.
  function showAll() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
//   cy.elements('node').show(); // show all nodes using eles.show().
//   cy.elements('edge').show(); // show all edges using eles.show().
   cy.elements().removeClass('HideThis');
   cy.elements().addClass('ShowItAll');

   // Relayout the graph.
   rerunLayout();

   // Remove shadows around nodes, if any.
   cy.nodes().forEach(function( ele ) {
       removeNodeBlur(ele);
      });

   // Refresh network legend.
   updateCyLegend();
  }
  
  // Re-run the entire graph's layout.
  function rerunLayout() {
   //console.log("rerunLayout...");
   // Get the cytoscape instance as a Javascript object from JQuery.
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
   var selected_elements= cy.$(':visible'); // get only the visible elements.

  // Re-run the graph's layout, but only on the visible elements.
   rerunGraphLayout(selected_elements);
   
   // Reset the graph/ viewport.
   resetGraph();
  }

  // Re-run the graph's layout, but only on the visible elements.
  function rerunGraphLayout(eles) {
   //  var ld= document.getElementById("layouts_dropdown");
   var ld_selected= /*ld.options[ld.selectedIndex].value*/$('#layouts_dropdown').val();
   //console.log("layouts_dropdown selectedOption: "+ ld_selected)
   if(ld_selected === "Circle_layout") {
           setCircleLayout(eles);
          }
   else if(ld_selected === "Cose_layout") {
           setCoseLayout(eles);
          }
   else if(ld_selected === "Cose_Bilkent_layout") {
           setCoseBilkentLayout(eles);
          }
   else if(ld_selected === "Concentric_layout") {
           setConcentricLayout(eles);
          }
   else if(ld_selected === "ngraph_force_layout") {
           setNgraphForceLayout(eles);
          }
   //console.log("Re-run layout complete...");
  }

  // Update the label font size for all the concepts and relations.
  function changeLabelFontSize(new_size) {
   try {
     var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
     console.log("changeLabelFontSize>> new_size: "+ new_size);
     cy.style().selector('node').css({ 'font-size': new_size }).update();
     cy.style().selector('edge').css({ 'font-size': new_size }).update();
    }
   catch(err) {
          console.log("Error occurred while altering label font size. \n"+"Error Details: "+ err.stack);
         }
  }

/*
  // Show all node labels.
  function showConceptLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   if(document.getElementById("show_ConceptLabels").checked) {
      console.log("Show Concept labels...");
      cy.nodes().style({'text-opacity': '1'});
     }
   else {
      console.log("Hide Concept labels...");
      cy.nodes().style({'text-opacity': '0'});
     }
  }

  // Show all edge labels.
  function showRelationLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   if(document.getElementById("show_RelationLabels").checked) {
      console.log("Show Relation labels...");
      cy.edges().style({'text-opacity': '1'});
     }
   else {
      console.log("Hide Relation labels...");
      cy.edges().style({'text-opacity': '0'});
     }
  }
*/

  // Show/ Hide labels for concepts and relations.
  function showHideLabels(val) {
   //console.log("cy.hideLabelsOnViewport= "+ $('#cy').cytoscape('get').hideLabelsOnViewport);
   if(val === "Concepts") {
      displayConceptLabels();
     }
   else if(val === "Relations") {
      displayRelationLabels();
     }
   else if(val === "Both") {
      displayConRelLabels();
     }
   else if(val === "None") {
      hideConRelLabels();
     }
  }

  // Show node labels.
  function displayConceptLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().style({'text-opacity': '1'});
   cy.edges().style({'text-opacity': '0'});
  }

  // Show edge labels.
  function displayRelationLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().style({'text-opacity': '0'});
   cy.edges().style({'text-opacity': '1'});
  }

  // Show node & edge labels.
  function displayConRelLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().style({'text-opacity': '1'});
   cy.edges().style({'text-opacity': '1'});
  }

  // Show node labels.
  function hideConRelLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().style({'text-opacity': '0'});
   cy.edges().style({'text-opacity': '0'});
  }
