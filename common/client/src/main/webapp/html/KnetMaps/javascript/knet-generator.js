
// initialize and generate the network
function generateNetworkGraph(json_File) {
   console.log("Dataset file path: "+ json_File);

    // Include this file's contents on the page at runtime using jQuery and a callback function.
/*   $.getScript(json_File, function() {*/
   jQuery.getScript(json_File, function() {
     console.log(json_File +" file included...");
     // Initialize the cytoscapeJS container for Network View.
     initializeNetworkView();

     // Highlight nodes with hidden, connected nodes using Shadowing.
     blurNodesWithHiddenNeighborhood();

     // Set the default layout.
//     setDefaultLayout();

     // update "cy" legend with some stats.
     updateCyLegend();
   });
  }

// initialize the network
function initializeNetworkView() {
   var networkJSON= graphJSON; // using the dynamically included graphJSON object directly.
   // modify for networkJSON to read JSON object from file and retain contents from "elements" section for nodes and edges info.
//   var metadataJSON= allGraphData; // using the dynamically included metadata JSON object directly.

   // Define the stylesheet to be used for nodes & edges in the cytoscape.js container.
   var networkStylesheet= cytoscape.stylesheet()
      .selector('node')
        .css({
          'content': 'data(displayValue)',
                     /*function(ele) {
                      var label= '';
                      if(ele.data('value').indexOf('<span') > -1) { // For html content from text, use html tags.
                         var txtLabel= '<html>'+ ele.data('value') +'</html>';
                         label= jQuery(txtLabel).text();
                        }
                      else {
                         label= ele.data('value');
                        }
                      // Trim the label's length.
                      if(label.length> 30) { label= label.substr(0,29)+'...'; }
                      return label;
                     },*/
     //     'text-valign': 'center', // to have 'content' displayed in the middle of the node.
          'text-background-color': 'data(conceptTextBGcolor)',//'black',
                   /*function(ele) { // text background color
                    var labelColor= '';
                    if(ele.data('value').indexOf('<span') > -1) {
                       labelColor= 'gold';
                      }
                    else {
                       labelColor= 'black';
                      }
                    return labelColor;
                   },*/
          'text-background-opacity': 'data(conceptTextBGopacity)',//'0', // default: '0' (disabled).
                   /*function(ele) { // text background opacity
                    var textBackgroundOpacity= '0';
                    if(ele.data('value').indexOf('<span') > -1) {
                       textBackgroundOpacity= '1';
                      }
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
      .selector('edge')
        .css({
          'content': 'data(label)', // label for edges (arrows).
          'font-size': '16px',
//          'min-zoomed-font-size': '8px',
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
      .selector('.highlighted')
        .css({
          'background-color': '#61bffc',
          'line-color': '#61bffc',
          'target-arrow-color': '#61bffc',
          'transition-property': 'background-color, line-color, target-arrow-color',
          'transition-duration': '0.5s'
        })
      .selector(':selected')
        .css({ // settings for highlighting nodes in case of single click or Shift+click multi-select event.
          'border-width': '4px',
          'border-color': '#CCCC33' // '#333'
        })
      .selector('.BlurNode')
        .css({ // settings for using shadow effect on nodes when they have hidden, connected nodes.
              'shadow-blur': '25', // disable for larger network graphs, use x & y offset(s) instead.
              'shadow-color': 'black', // 'data(conceptColor)',
              'shadow-opacity': '0.9'
        }).selector('.HideThis')
        .css({ // settings to hide node or edge
              'display': 'none'
        }).selector('.ShowItAll')
        .css({ // settings to show all nodes and edges
              'display': 'element'
        });

// On startup
$(function() { // on dom ready

  // load the cytoscapeJS network
  load_reload_Network(networkJSON, networkStylesheet/*, true*/);

}); // on dom ready
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
  function blurNodesWithHiddenNeighborhood() {
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
