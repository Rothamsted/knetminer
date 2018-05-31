var KNETMAPS = KNETMAPS || {};

KNETMAPS.Menu = function() {

	var iteminfo = KNETMAPS.ItemInfo();
	var container = KNETMAPS.Container();
	var stats = KNETMAPS.Stats();

	var my=function() {};
	
 my.onHover = function(thisBtn) {
    $(thisBtn).removeClass('unhover').addClass('hover');
 }

 my.offHover = function(thisBtn) {
	    $(thisBtn).removeClass('hover').addClass('unhover');
 }

 my.popupItemInfo = function() {
	 iteminfo.openItemInfoPane();
	 iteminfo.showItemInfo(this);
 }

   // Go to Help docs.
 my.openKnetHelpPage = function() {
   var helpURL = 'https://github.com/Rothamsted/knetmaps.js/wiki/KnetMaps.js';
   window.open(helpURL, '_blank');
  }

  // Reset: Re-position the network graph.
 my.resetGraph = function() {
   $('#cy').cytoscape('get').reset().fit(); // reset the graph's zooming & panning properties.
  }
  
 // Export the graph as a JSON object in a new Tab and allow users to save it.
 my.exportAsJson = function() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

   var exportJson= cy.json(); // get JSON object for the network graph.
   //console.log("Save network JSON as: kNetwork.cyjs.json");

   // use FileSaver.js to save using file downloader
   var kNet_json_Blob= new Blob([JSON.stringify(exportJson)], {type: 'application/javascript;charset=utf-8'});
   saveAs(kNet_json_Blob, "kNetwork.cyjs.json");
  }
  
  // Export the graph as a .png image and allow users to save it.
 my.exportAsImage = function() {
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
 my.showAll = function() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
   cy.elements().removeClass('HideEle');
   cy.elements().addClass('ShowEle');

   // Relayout the graph.
   my.rerunLayout();

   // Remove shadows around nodes, if any.
   cy.nodes().forEach(function( ele ) {
       iteminfo.removeNodeBlur(ele);
      });

   // Refresh network legend.
   stats.updateKnetStats();
  }
  
  // Re-run the entire graph's layout.
 my.rerunLayout = function() {
   // Get the cytoscape instance as a Javascript object from JQuery.
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
   var selected_elements= cy.$(':visible'); // get only the visible elements.

   // Re-run the graph's layout, but only on the visible elements.
   my.rerunGraphLayout(selected_elements);
   
   // Reset the graph/ viewport.
   my.resetGraph();
  }

  var layouts = KNETMAPS.Layouts();
  
  // Re-run the graph's layout, but only on the visible elements.
  my.rerunGraphLayout = function(eles) {
   var ld_selected= $('#layouts_dropdown').val();
   if(ld_selected === "circle_layout") {
	   layouts.setCircleLayout(eles);
          }
   else if(ld_selected === "cose_layout") {
	   layouts.setCoseLayout(eles);
          }
   else if(ld_selected === "coseBilkent_layout") {
	   layouts.setCoseBilkentLayout(eles);
          }
   else if(ld_selected === "concentric_layout") {
	   layouts.setConcentricLayout(eles);
          }
   else if(ld_selected === "ngraph_force_layout") {
	   layouts.setNgraphForceLayout(eles);
          }
  }

  // Update the label font size for all the concepts and relations.
  my.changeLabelFontSize = function(new_size) {
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
  my.showHideLabels = function(val) {
   if(val === "Concepts") {
      my.displayConceptLabels();
     }
   else if(val === "Relations") {
	   my.displayRelationLabels();
     }
   else if(val === "Both") {
	   my.displayConRelLabels();
     }
   else if(val === "None") {
	   my.hideConRelLabels();
     }
  }

  // Show node labels.
  my.displayConceptLabels = function() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().removeClass("LabelOff").addClass("LabelOn");
   cy.edges().removeClass("LabelOn").addClass("LabelOff");
  }

  // Show edge labels.
  my.displayRelationLabels = function() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().removeClass("LabelOn").addClass("LabelOff");
   cy.edges().removeClass("LabelOff").addClass("LabelOn");
  }

  // Show node & edge labels.
  my.displayConRelLabels = function() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().removeClass("LabelOff").addClass("LabelOn");
   cy.edges().removeClass("LabelOff").addClass("LabelOn");
  }

  // Show node labels.
  my.hideConRelLabels = function() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
   cy.nodes().removeClass("LabelOn").addClass("LabelOff");
   cy.edges().removeClass("LabelOn").addClass("LabelOff");
  }

	// Full screen: Maximize/ Minimize overlay
  my.OnMaximizeClick = function() {
   var cy_target= $('#cy').cytoscape('get');
   var currentEles_jsons= cy_target.elements().jsons();
   var currentStylesheet_json= cy_target.style().json(); //cy_target.style().json();
   if(!$('#knet-maps').hasClass('full_screen')) {
      $('#maximizeOverlay').removeClass('max').addClass('min'); // toggle image
	// Maximize
      $('#knet-maps').addClass('full_screen');

	// reload the network
	container.load_reload_Network(currentEles_jsons, currentStylesheet_json/*, false*/);

      // Show Item Info table
	iteminfo.openItemInfoPane();
     }
     else {
      $('#maximizeOverlay').removeClass('min').addClass('max'); // toggle image
	// Minimize
      $('#knet-maps').removeClass('full_screen');

      // reload the network
	container.load_reload_Network(currentEles_jsons, currentStylesheet_json/*, false*/);

      // Hide Item Info table
	iteminfo.closeItemInfoPane();
     }
}
  return my;
};
