// Add KnetMaps menu bar
function populateKnetMenu() {
 var knet_menu= "<input type='image' id='maximizeOverlay' src='html/KnetMaps/image/maximizeOverlay.png' title='Toggle full screen' onclick='OnMaximizeClick();' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='showAll' src='html/KnetMaps/image/showAll.png' onclick='showAll();' title='Show all the concept & relations in the Network' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='relayoutNetwork' src='html/KnetMaps/image/relayoutNetwork.png' onclick='rerunLayout();' title='Re-run the Layout' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='openItemInfoBtn' src='html/KnetMaps/image/openItemInfoBtn.png' onclick='popupItemInfo();' title='Show Info box' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<span class='knet-dropdowns'>"+
                        "<select id='layouts_dropdown' class='knet-dropdowns' onChange='rerunLayout();' title='Select network layout'>"+
                            "<option value='cose_layout' selected='selected' title='using CoSE layout algorithm (useful for larger networks with clustering)'>CoSE layout</option>"+
                            "<option value='ngraph_force_layout' title='using ngraph_force layout (works well on planar graphs)'>Force layout</option>"+
                            "<option value='circle_layout'>Circular layout</option>"+
                            "<option value='concentric_layout'>Concentric layout</option>"+
                            "<option value='coseBilkent_layout' title='using CoSE-Bilkent layout (with node clustering, but performance-intensive for larger networks)'>CoSE-Bilkent layout</option>"+
                        "</select>"+
                        "<select id='changeLabelVisibility' class='knet-dropdowns' onChange='showHideLabels(this.value);' title='Select label visibility'>"+
                            "<option value='None' selected='selected'>Labels: None</option>"+
                            "<option value='Concepts'>Labels: Concepts</option>"+
                            "<option value='Relations'>Labels: Relations</option>"+
                            "<option value='Both'>Labels: Both</option>"+
                        "</select>"+
                        "<select id='changeLabelFont' class='knet-dropdowns' onChange='changeLabelFontSize(this.value);' title='Select label font size'>"+
                            "<option value='8'>Label size: 8px</option>"+
                            "<option value='12'>Label size: 12px</option>"+
                            "<option value='16' selected='selected'>Label size: 16px</option>"+
                            "<option value='20'>Label size: 20px</option>"+
                            "<option value='24'>Label size: 24px</option>"+
                            "<option value='28'>Label size: 28px</option>"+
                            "<option value='32'>Label size: 32px</option>"+
                            "<option value='36'>Label size: 36px</option>"+
                            "<option value='40'>Label size: 40px</option>"+
                        "</select>"+
			        "</span>"+
                    "<input type='image' id='resetNetwork' src='html/KnetMaps/image/resetNetwork.png' onclick='resetGraph();' title='Reposition (reset and re-fit) the graph' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='savePNG' src='html/KnetMaps/image/savePNG.png' onclick='exportAsImage();' title='Export the network as a .png image' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='saveJSON' src='html/KnetMaps/image/saveJSON.png' onclick='exportAsJson();' title='Export the network in JSON format' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='helpURL' src='html/KnetMaps/image/help.png' onclick='openKnetHelpPage();' title='Go to help documentation' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>";

 $('#knetmaps-menu').html(knet_menu);
}

function onHover(thisBtn) {
	 var img= $(thisBtn).attr('src');
    $(thisBtn).attr('src', img.replace('.png','_hover.png'));
 }

 function offHover(thisBtn) {
	 var img= $(thisBtn).attr('src');
    $(thisBtn).attr('src', img.replace('_hover.png','.png'));
 }

 function popupItemInfo() {
 openItemInfoPane();
 showItemInfo(this);
}

   // Go to Help docs.
  function openKnetHelpPage() {
   var helpURL = 'https://github.com/Rothamsted/knetmaps.js/wiki/KnetMaps.js';
   window.open(helpURL, '_blank');
  }

  // Reset: Re-position the network graph.
  function resetGraph() {
   $('#cy').cytoscape('get').reset().fit(); // reset the graph's zooming & panning properties.
  }
  
 // Export the graph as a JSON object in a new Tab and allow users to save it.
  function exportAsJson() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

   var exportJson= cy.json(); // get JSON object for the network graph.
   //console.log("Save network JSON as: kNetwork.cyjs.json");

   // use FileSaver.js to save using file downloader
   var kNet_json_Blob= new Blob([JSON.stringify(exportJson)], {type: 'application/javascript;charset=utf-8'});
   saveAs(kNet_json_Blob, "kNetwork.cyjs.json");
  }
  
  // Export the graph as a .png image and allow users to save it.
  function exportAsImage() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

   // Export as .png image
   var png64= cy.png(); // .setAttribute('crossOrigin', 'anonymous');
   //console.log("Export network PNG as: kNetwork.png");

   // Use IFrame to open png image in a new browser tab
   var cy_width= $('#cy').width();
   var cy_height= $('#cy').height();
   //var knet_iframe_style= "border:1px solid black; top:0px; left:0px; bottom:0px; right:0px; width:"+ cy_width +"; height:"+ cy_height +";";
   var knet_iframe_style= "top:0px; left:0px; bottom:0px; right:0px; width:"+ cy_width +"; height:"+ cy_height +";";
   var knet_iframe = '<iframe src="'+ png64 +'" frameborder="0" style="'+ knet_iframe_style +'" allowfullscreen></iframe>';
   var pngTab= window.open();
   pngTab.document.open();
   pngTab.document.write(knet_iframe);
   pngTab.document.title="kNetwork_png";
   pngTab.document.close();
  }

  // Show all concepts & relations.
  function showAll() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
   cy.elements().removeClass('HideEle');
   cy.elements().addClass('ShowEle');

   // Relayout the graph.
   rerunLayout();

   // Remove shadows around nodes, if any.
   cy.nodes().forEach(function( ele ) {
       removeNodeBlur(ele);
      });

   // Refresh network legend.
   updateKnetStats();
  }
  
  // Re-run the entire graph's layout.
  function rerunLayout() {
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
   var ld_selected= $('#layouts_dropdown').val();
   if(ld_selected === "circle_layout") {
           setCircleLayout(eles);
          }
   else if(ld_selected === "cose_layout") {
           setCoseLayout(eles);
          }
   else if(ld_selected === "coseBilkent_layout") {
           setCoseBilkentLayout(eles);
          }
   else if(ld_selected === "concentric_layout") {
           setConcentricLayout(eles);
          }
   else if(ld_selected === "ngraph_force_layout") {
           setNgraphForceLayout(eles);
          }
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

  // Show/ Hide labels for concepts and relations.
  function showHideLabels(val) {
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
   cy.nodes().removeClass("LabelOff").addClass("LabelOn");
   cy.edges().removeClass("LabelOn").addClass("LabelOff");
  }

  // Show edge labels.
  function displayRelationLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().removeClass("LabelOn").addClass("LabelOff");
   cy.edges().removeClass("LabelOff").addClass("LabelOn");
  }

  // Show node & edge labels.
  function displayConRelLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().removeClass("LabelOff").addClass("LabelOn");
   cy.edges().removeClass("LabelOff").addClass("LabelOn");
  }

  // Show node labels.
  function hideConRelLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().removeClass("LabelOn").addClass("LabelOff");
   cy.edges().removeClass("LabelOn").addClass("LabelOff");
  }
