var KNETMAPS = KNETMAPS || {};
var graphJSON = graphJSON  || '';
var allGraphData = allGraphData || '';

KNETMAPS.Generator = function() {

	var stats = KNETMAPS.Stats();
	var iteminfo = KNETMAPS.ItemInfo();
	var container = KNETMAPS.Container();
	var legend = KNETMAPS.ConceptsLegend();

	var my = function() {};
	
 // initialize and generate the network from default global vars
 my.generateNetworkGraph=function(eles_jsons, metadata_json, eles_styles) {
   //console.log("Dataset file path: "+ json_File);
	 graphJSON = eles_jsons; // set graphJSON to reloaded JSON.
	 allGraphData = metadata_json;

     // Initialize the cytoscapeJS container for Network View.
	 // NB graphJSON and allGraphData should be declared outside this script
	   my.initializeNetworkView(graphJSON, allGraphData, eles_styles);

     // Highlight nodes with hidden, connected nodes using Shadowing.
	   my.blurNodesWithHiddenNeighborhood();
	   
	   // re-color gene labels using various shades of blue, based on TAXID
	   my.colorGeneLabelsByTaxID(allGraphData);

     // Set the default layout.
//     setDefaultLayout();
     // update network stats <div>.
     stats.updateKnetStats();

     // dynamically populate interactive concept legend.
     legend.populateConceptLegend();
  }

//initialize and generate the network from provided JSON blob
 my.generateNetworkGraphRaw=function(json_blob) {
   //console.log("Dataset file path: "+ json_File);
   eval(json_blob+'; my.initializeNetworkView(graphJSON, allGraphData); my.blurNodesWithHiddenNeighborhood(); my.colorGeneLabelsByTaxID(allGraphData); stats.updateKnetStats(); legend.populateConceptLegend();');
  };

// initialize the network
 my.initializeNetworkView=function(networkJSON, metadataJSON, existing_styles) {
	graphJSON = networkJSON;
	allGraphData = metadataJSON;
   // modify for networkJSON to read JSON object from file and retain contents from "elements" section for nodes and edges info.
//   var metadataJSON= allGraphData; // using the dynamically included metadata JSON object directly.

	var networkStylesheet= '';
	var isReloaded= false;
	if(existing_styles != null || existing_styles != undefined) {
	   // load existing node x,y & style classes/selectors.
	   networkStylesheet= existing_styles;
	   isReloaded= true;
	  }
	else {
   // Define the stylesheet to be used for nodes & edges in the cytoscape.js container.
   networkStylesheet= cytoscape.stylesheet().selector('node').css({
          'content': 'data(displayValue)',
                     /*function(ele) {
                      var label= '';
                      if(ele.data('value').indexOf('<span') > -1) { // For html content from text, use html tags.
                         var txtLabel= '<html>'+ ele.data('value') +'</html>';
                         label= jQuery(txtLabel).text();
                        }
                      else { label= ele.data('value'); }
                      // Trim the label's length.
                      if(label.length> 30) { label= label.substr(0,29)+'...'; }
                      return label;
                     },*/
     //     'text-valign': 'center', // to have 'content' displayed in the middle of the node.
          'text-background-color': 'data(conceptTextBGcolor)',
          'text-background-opacity': 'data(conceptTextBGopacity)',//'0', // default: '0' (disabled).
                   /*function(ele) { // text background opacity
                    var textBackgroundOpacity= '0';
                    if(ele.data('value').indexOf('<span') > -1) { textBackgroundOpacity= '1'; }
                    return textBackgroundOpacity;
                   },*/
          'text-wrap': 'wrap', // for manual and/or autowrapping the label text.
//          'edge-text-rotation' : 'autorotate', // rotate edge labels as the angle of an edge changes: can be 'none' or 'autorotate'.
          'border-style': 'data(conceptBorderStyle)',//'solid', // node border, can be 'solid', 'dotted', 'dashed' or 'double'.
                          /*function(ele) {
                              var node_borderStyle= 'solid';
                              try { // Check if the node was flagged or not
                              if(ele.data('flagged') === "true") {
                                 node_borderStyle= 'double'; // can be 'solid', 'dotted', 'dashed' or 'double'.
//                                 console.log("node Flagged= "+ ele.data('flagged') +" , node_borderStyle: "+ node_borderStyle);
                                }
                              }
                              catch(err) { console.log(err.stack); }
                              return node_borderStyle;
                          },*/
          'border-width': 'data(conceptBorderWidth)',//'1px',
                          /*function(ele) {
                              var node_borderWidth= '1px';
                              try { // Check if the node was flagged or not
                              if(ele.data('flagged') === "true") {
                                 node_borderWidth= '3px';
//                                 console.log("node Flagged= "+ ele.data('flagged') +" , node_borderWidth: "+ node_borderWidth);
                                }
                              }
                              catch(err) { console.log(err.stack); }
                              return node_borderWidth;
                          },*/
          'border-color': 'data(conceptBorderColor)',//'black',
                          /*function(ele) {
                              var node_borderColor= 'black';
                              try { // Check if the node was flagged or not
                              if(ele.data('flagged') === "true") {
                                 node_borderColor= 'navy';
//                                 console.log("node Flagged= "+ ele.data('flagged') +" , node_borderColor: "+ node_borderColor);
                                }
                              }
                              catch(err) { console.log(err.stack); }
                              return node_borderColor;
                          },*/
          'font-size': '16px', // '8px',
//          'min-zoomed-font-size': '8px',
          // Set node shape, color & display (visibility) depending on settings in the JSON var.
          'shape': 'data(conceptShape)', // 'triangle'
          'width': 'data(conceptSize)', // '18px',
          'height': 'data(conceptSize)', // '18px',
          'background-color': 'data(conceptColor)', // 'gray'
          /** Using 'data(conceptColor)' leads to a "null" mapping error if that attribute is not defined 
           * in cytoscapeJS. Using 'data[conceptColor]' is hence preferred as it limits the scope of 
           * assigning a property value only if it is defined in cytoscapeJS as well. */
          'display': 'data(conceptDisplay)', // display: 'element' (show) or 'none' (hide).
          'text-opacity': '0' // to make the label invisible by default.
         })
      .selector('edge').css({
          'content': 'data(label)', // label for edges (arrows).
          'font-size': '16px',
//          'min-zoomed-font-size': '8px',
          'curve-style': 'unbundled-bezier', /* options: bezier (curved) (default), unbundled-bezier (curved with manual control points), haystack (straight edges) */
          'control-point-step-size': '10px', //'1px' // specifies the distance between successive bezier edges.
          'control-point-distance': '20px', /* overrides control-point-step-size to curves single edges as well, in addition to parallele edges */
          'control-point-weight': '50'/*'0.7'*/, // '0': curve towards source node, '1': curve towards target node.
          'width': 'data(relationSize)', // 'mapData(relationSize, 70, 100, 2, 6)', // '3px',
          //'line-color': 'data(relationColor)', // e.g., 'grey',
          'line-color': 'data(relationColor)',
          'line-style': 'solid', // 'solid' (or 'dotted', 'dashed')
          'target-arrow-shape': 'triangle',
          'target-arrow-color': 'gray',
          'display': 'data(relationDisplay)', // display: 'element' (show) or 'none' (hide).
          'text-opacity': '0' // to make the label invisible by default.
        })
      .selector('.highlighted').css({
          'background-color': '#61bffc',
          'line-color': '#61bffc',
          'target-arrow-color': '#61bffc',
          'transition-property': 'background-color, line-color, target-arrow-color',
          'transition-duration': '0.5s'
        })
      .selector(':selected').css({ // settings for highlighting nodes in case of single click or Shift+click multi-select event.
          'border-width': '4px',
          'border-color': '#CCCC33' // '#333'
        })
      .selector('.BlurNode').css({ // settings for using shadow effect on nodes when they have hidden, connected nodes.
              'shadow-blur': '25', // disable for larger network graphs, use x & y offset(s) instead.
              'shadow-color': 'black', // 'data(conceptColor)',
              'shadow-opacity': '0.9'
        })
      .selector('.HideEle').css({ // settings to hide node/ edge
              'display': 'none'
        })
      .selector('.ShowEle').css({ // settings to show node/ edge
              'display': 'element'
        })
      .selector('.LabelOn').css({ // settings to show Label on node/ edge
              'text-opacity': '1'
        })
      .selector('.LabelOff').css({ // settings to show Label on node/ edge
              'text-opacity': '0'
        })
      .selector('.darkgreyEdge').css({
              'line-color': 'darkGrey'
        })
      .selector('.orangeEdge').css({
              'line-color': 'orange'
        })
      .selector('.dashedEdge').css({ // dashed edge
              'line-style': 'dashed'
        })
      .selector('.FlaggedGene').css({ // to show highlighed label on flagged gene
              'text-background-color': '#FFFF00',
              'text-background-opacity': '1'
        });
	}

// On startup
$(function() { // on dom ready
  console.log("initialising...");
  // load the cytoscapeJS network to render
  container.load_reload_Network(networkJSON, networkStylesheet, isReloaded);
  
  my.append_visibility_and_label_classes(); // to all network nodes/ edges.
}); // on dom ready
}

 my.append_visibility_and_label_classes=function() {
  var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

    cy.nodes().forEach(function( conc ) { // for concepts
       // Add relevant Concept visibility class
       if(conc.data('conceptDisplay') === 'element') {
          conc.addClass('ShowEle');
         }
       else {
         conc.addClass('HideEle');
        }
       // Add relevant label visibility class
       if(conc.style('text-opacity') === '0') { conc.addClass('LabelOff'); }
       else { conc.addClass('LabelOn'); }
       // show flagged gene's labels
       if(conc.data('flagged') === 'true') {
       	  conc.removeClass('LabelOff').addClass('LabelOn');
          conc.addClass('FlaggedGene');
       	 }
    });
    cy.edges().forEach(function( rel ) { // for relations
       // Add relevant Relation visibility class
       if(rel.data('relationDisplay') === 'element') {
          rel.addClass('ShowEle');
         }
       else {
         rel.addClass('HideEle');
        }
       // Add relevant label visibility class
       if(rel.style('text-opacity') === '0') { rel.addClass('LabelOff'); }
       else { rel.addClass('LabelOn'); }
    });

    // new: also show labels for all Genes, Biological Process and Trait nodes.
    cy.nodes().forEach(function( conc ) { // for concepts/nodes
      if((conc.data('conceptType') === "Gene") || (conc.data('conceptType') === "Biological_Process") || (conc.data('conceptType') === "Trait") || (conc.data('conceptType') === "Trait Ontology")) {
      	// then display labels for these nodes if they are visble already.
      	if(conc.data('conceptDisplay') === 'element') {
          conc.removeClass('LabelOff').addClass('LabelOn');
         }
      }
    });
	
	// fix any nodes with black conceptTextBGcolor in json
	cy.nodes().forEach(function( conc ) {
       if(conc.data('conceptTextBGcolor') === 'black') {
          conc.data('conceptTextBGcolor','lightGreen'); // set new color (lightGreen)
         }
	  });

	// modify to dashed edges (line-style) for certain cases, and assign new line-color in some cases too
     cy.edges().forEach(function( rel ) {
	  if(rel.data('label') === "xref") { rel.addClass('darkgreyEdge'); }
	  if(rel.data('label') === "associated_with") { rel.addClass('darkgreyEdge'); }
	  if(rel.data('label') === "occurs_in") { rel.addClass('orangeEdge'); }
	  // use dashed line style for relation type: cooccurs_with, occurs_in, regulates, has_similar_sequence, enriched_for.
	  var special_edges= [ "cooccurs_with", "occurs_in", "regulates", "has_similar_sequence", "enriched_for" ];
	  if(special_edges.includes(rel.data('label'))) { rel.addClass('dashedEdge'); }
    });
 }

  // Show concept neighbourhood.
/*  function showNeighbourhood() {
   console.log("Show neighborhood: Display concepts in the neighbourhood of the selected concept (node)...");
   var selectedNodes= cy.nodes(':selected');
   selectedNodes.neighborhood().nodes().show();
   selectedNodes.neighborhood().edges().show();

   // Remove shadow effect from the nodes that had hidden nodes in their neighborhood.
   selectedNodes.forEach(function( ele ) {
    removeNodeBlur(ele);
   });

  }*/
  
  // Show shadow effect on nodes with connected, hidden elements in their neighborhood.
 my.blurNodesWithHiddenNeighborhood=function() {
    var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

    cy.nodes().forEach(function( ele ) {
    var thisElement= ele;
    var eleID, connected_hiddenNodesCount= 0;
    try { // Retrieve the nodes in this element's neighborhood.
//         var neighborhood_nodes= thisElement.neighborhood().nodes();

         eleID= thisElement.id(); // element ID.
         // Retrieve the directly connected nodes in this element's neighborhood.
         var connected_edges= thisElement.connectedEdges();
         // Get all the relations (edges) with this concept (node) as the source.
//         var connected_edges= thisElement.connectedEdges().filter('edge[source = '+eleID+']');

         var connected_hidden_nodes= connected_edges.connectedNodes().filter('node[conceptDisplay = "none"]');
         // Find the number of hidden, connected nodes.
         connected_hiddenNodesCount= connected_hidden_nodes.length;

         if(connected_hiddenNodesCount > 1) {
            // Show shadow around nodes that have hidden, connected nodes.
            thisElement.addClass('BlurNode');
          }
      }
    catch(err) { 
          console.log("Error occurred while adding Shadow to concepts with connected, hidden elements. \n"+"Error Details: "+ err.stack);
         }
   });
  }
 
 my.colorGeneLabelsByTaxID=function(metadata_json) {
    var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
	
	// re-color genes based on different taxid (range of 7 blues)
	var gene_colors= ['#e6f5fe','#82cbfc','#50b7fb','lightBlue','#0598fa','#74b9e7','#64bcf7'];
	var all_taxids= [];
	
	// get all gene taxID's and make a list[] of them
	cy.nodes().forEach(function( conc ) {
        if(conc.data('conceptType') === "Gene") {
	   var this_taxid="";
	   for(var i=0; i<metadata_json.ondexmetadata.concepts.length;i++) {
	       // if matching concept ID found, traverse attributes to get TAXID
               if(conc.data('id') === metadata_json.ondexmetadata.concepts[i].id) {
                  for(var j=0; j<metadata_json.ondexmetadata.concepts[i].attributes.length; j++) {
                      if((metadata_json.ondexmetadata.concepts[i].attributes[j].attrname === "TAXID") || (metadata_json.ondexmetadata.concepts[i].attributes[j].attrnameName === "TX")) {
			  this_taxid= metadata_json.ondexmetadata.concepts[i].attributes[j].value;
			  // store unique taxID in list[]
			  if(all_taxids.indexOf(this_taxid) === -1) { all_taxids.push(this_taxid); }
			 }
                     }
		 }
	     }
           }
	  });
	  
	//console.log("all_taxids: "+ all_taxids);
	var genes_taxid = new Map();
	var k=0;
	// make k,v map of all taxID and blue shades/colors for gene labels
	for(var j=0; j<all_taxids.length;j++) { 
	    genes_taxid.set(all_taxids[j], gene_colors[j]);
		k= k+1;
		// reset color counter if no. of taxID's exceedes our label blue shades range (though unlikely)
		if(k > gene_colors.length) { k=0; }
	   }
	
	// now change label color for genes accordingly
     cy.nodes().forEach(function( conc ) {
       if(conc.data('conceptType') === "Gene") {
	  var this_taxid="";
	  // fetch TAXID again
	  for(var i=0; i<metadata_json.ondexmetadata.concepts.length;i++) {
              if(conc.data('id') === metadata_json.ondexmetadata.concepts[i].id) {
                 for(var j=0; j<metadata_json.ondexmetadata.concepts[i].attributes.length; j++) {
                     if((metadata_json.ondexmetadata.concepts[i].attributes[j].attrname === "TAXID") || (metadata_json.ondexmetadata.concepts[i].attributes[j].attrnameName === "TX")) {
			 this_taxid= metadata_json.ondexmetadata.concepts[i].attributes[j].value;
                        }
                    }
		 }
	     }
	       
	  // get color (which shade of blue) from map
	  var genelabel_color= genes_taxid.get(this_taxid);
	  // set new label blue color/shade accordingly
	  conc.data('conceptTextBGcolor',genelabel_color);
	  conc.css({ 'text-background-opacity': '1' });
	 }
    });
 }
 
 return my;
};
