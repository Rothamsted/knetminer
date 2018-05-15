
// initialize and generate the network in KnetMaps
function generateNetworkGraph(json_File) {

    // Include this file's contents on the page at runtime using jQuery and a callback function.
/*   $.getScript(json_File, function() {*/
   jQuery.getScript(json_File, function() {

     // Initialize the cytoscapeJS container for Network View.
     initializeNetworkView();

     // Highlight nodes with hidden, connected nodes using Shadowing.
     blurNodesWithHiddenNeighborhood();

     // update network stats.
     updateKnetStats();

     // dynamically populate interactive concept legend.
     populateConceptLegend();
   });
  }

// initialize the network
function initializeNetworkView() {
    
   var networkJSON= graphJSON; // using the dynamically included graphJSON object directly.

   // ToDO: modify for networkJSON to read JSON object from file and retain contents from "elements" section for nodes and edges info.

   // Define the stylesheet to be used for nodes & edges in the cytoscape.js container.
   var networkStylesheet= cytoscape.stylesheet().selector('node').css({
          'content': 'data(displayValue)',
     //     'text-valign': 'center', // to have 'content' displayed in the middle of the node.
          'text-background-color': 'data(conceptTextBGcolor)',//'black',
          'text-background-opacity': 'data(conceptTextBGopacity)',//'0', // default: '0' (disabled).
          'text-wrap': 'wrap', // for manual and/or autowrapping the label text.
//          'edge-text-rotation' : 'autorotate', // rotate edge labels as the angle of an edge changes (can be 'none' or 'autorotate').
          'border-style': 'data(conceptBorderStyle)',//'solid', // node border, can be 'solid', 'dotted', 'dashed' or 'double'.
          'border-width': 'data(conceptBorderWidth)',//'1px',
          'border-color': 'data(conceptBorderColor)',//'black',
          'font-size': '16px', // '8px',
          // Set node shape, color & display (visibility) depending on settings in the JSON var.
          'shape': 'data(conceptShape)', // 'triangle'
          'width': 'data(conceptSize)', // '18px',
          'height': 'data(conceptSize)', // '18px',
          'background-color': 'data(conceptColor)', // 'gray'
          'display': 'data(conceptDisplay)', // display: 'element' (show) or 'none' (hide).
          'text-opacity': '0' // to make the label invisible by default.
         })
      .selector('edge').css({
          'content': 'data(label)', // label for edges (arrows).
          'font-size': '16px',
          'curve-style': 'unbundled-bezier', /* options: bezier (curved) (default), unbundled-bezier (curved with manual control points), haystack (straight edges) */
          'control-point-step-size': '10px', //'1px' // specifies the distance between successive bezier edges.
          'control-point-distance': '20px', /* overrides control-point-step-size to curves single edges as well, in addition to parallele edges */
          'control-point-weight': '50'/*'0.7'*/, // '0': curve towards source node, '1': curve towards target node.
          'width': 'data(relationSize)', // 'mapData(relationSize, 70, 100, 2, 6)', // '3px',
          'line-color': 'data(relationColor)', // 'gray',
          'line-style': 'solid', // 'solid' or 'dotted' or 'dashed'
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
        });

// On startup
$(function() { // on dom ready
  // load the cytoscapeJS network
  load_reload_Network(networkJSON, networkStylesheet/*, true*/);
  
  append_visibility_and_label_classes(); // to all network nodes/ edges.
}); // on dom ready
}

 function append_visibility_and_label_classes() {
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
 }

  // Show shadow effect on nodes with connected, hidden elements in their neighborhood.
  function blurNodesWithHiddenNeighborhood() {
    var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

    cy.nodes().forEach(function( ele ) {
    var thisElement= ele;
    var eleID, connected_hiddenNodesCount= 0;
    try { // Retrieve the nodes in this element's neighborhood.
         eleID= thisElement.id(); // element ID.
         // Retrieve the directly connected nodes in this element's neighborhood.
         var connected_edges= thisElement.connectedEdges();

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
