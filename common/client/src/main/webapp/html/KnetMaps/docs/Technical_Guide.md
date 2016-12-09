# Installation Guide

**KnetMaps** is a web application that uses cytoscapeJS, jQuery and other javascript libraries to visualize network graphs and allow users to interact with them. It accepts a JSON dataset from the user as input and visualizes it within a container on your web page.

### KnetMaps components

* Menubar: A menubar that combines a host of useful features to filter, toggle, re-layout, export and interact with the network
* cytoscapeJS container: A core cytoscapeJS container to visualize animated, inter-connected nodes and edges as a network graph.
* ItemInfo: A sliding overlay panel to display additional (optional) metadata associated with nodes and edges.
* Counts legend: A nifty legend to list the number of total and visible nodes (and edges) within the currently visualized network.

### Using KnetMaps in your web application

A simple way to have **KnetMaps** on your web application (hosted via Apache, Tomcat, etc) is shown in `index.html`, i.e., using the code snippet below. This code in the `<body>` of the `index.html` page will create the KnetMaps menubar, the cytoscapeJS core container, ItemInfo panel and a counts legend:
```
<!-- KnetMaps -->
   <div id="knet-maps">
	<div id="itemInfo" class="infoDiv" style="display:none;"><!-- Item Info pane -->
          <table id="itemInfo_Table" class="infoTable" cellspacing=1>
	        <thead><th>Item Info:</th><th><button id="btnCloseItemInfoPane" onclick="closeItemInfoPane();">Close</button>
		</th></thead><tbody></tbody></table>
         </div>
         <!-- KnetMaps Menubar -->
         <div id="knetmaps-menu"></div>
        <!-- The core cytoscapeJS container -->
        <div id="cy"></div><br/>
	<div id="countsLegend"><span>KnetMaps</span></div><!-- legend -->
        <div id="infoDialog"></div><!-- popup dialog -->
  </div>
```

In the example page: `index.html`, KnetMaps is launched by default when the page loads using a dataset selected from the dropdown menu and is later invoked whenever users select a new dataset to visualize from the dropdown menu (invoked via the `onchange` event of the dropdown menu). The `launchNetwork(datasetName)` method in `launchNetwork.js` populates the menubar, loads the JSON dataset object and initializes the cytoscapeJS container.

### Input JSON Dataset

To use **KnetMaps** out-of-the-box in your web application, all you need to provide is a JSON dataset (with a nested JSON syntax as shown below) containing information about the nodes and edges in the network and (optional) visual attributes for them:
```
var graphJSON= { "nodes": [
        { "data": { "id": "1", "conceptType": "Gene", "flagged": "true", "conceptColor": "lightBlue", "annotation": "", "conceptSize": "26px", "value": "c1", "pid": "c1", "conceptDisplay": "element", "conceptShape": "triangle"} , "group": "nodes"} , 
        { "data": { "id": "2", "conceptType": "Protein", "flagged": "false","conceptColor": "red", "annotation": "",  "conceptSize": "22px", "value": "POTRI.002G046500", "pid": "POTRI.002G046500.1", "conceptDisplay": "element", "conceptShape": "ellipse"} , "group": "nodes"} , 
		{ "data": { "id": "3", "conceptType": "Protein", "flagged": "false", "conceptColor": "red", "annotation": "Version:  55", "conceptSize": "26px", "value": "AT1G03055", "pid": "AT1G03055.1;Q7XA78", "conceptDisplay": "element", "conceptShape": "ellipse"} , "group": "nodes"} , 
		{ "data": { "id": "4", "conceptType": "Publication", "flagged": "false", "conceptColor": "orange", "annotation": "", "conceptSize": "26px", "value": "PMID: 22623516", "pid": "22623516;PMID: 22623516", "conceptDisplay": "element", "conceptShape": "rectangle"} , "group": "nodes"} , 
		{ "data": { "id": "5", "conceptType": "Molecular_Function", "flagged": "false", "conceptColor": "purple", "annotation": "Elemental activities...", "conceptSize": "18px", "value": "molecular function", "pid": "GO: 0003674", "conceptDisplay": "none", "conceptShape": "pentagon"} , "group": "nodes"} , 
		{ "data": { "id": "6", "conceptType": "Cellular_Component", "flagged": "false", "conceptColor": "springGreen", "annotation": "common type", "conceptSize": "18px", "value": "plastid", "pid": "GO: 0009536", "conceptDisplay": "none", "conceptShape": "pentagon"} , "group": "nodes"} 
		],
    "edges": [
        { "data": { "id": "e1", "source": "1", "relationColor": "grey", "relationSize": "3px", "relationDisplay": "element", "target": "2", "label": "encodes"} , "group": "edges"} , 
        { "data": { "id": "e2", "source": "2", "relationColor": "red", "relationSize": "3px", "relationDisplay": "element", "target": "3", "label": "has_similar_sequence"} , "group": "edges"} , 
        { "data": { "id": "e3", "source": "4", "relationColor": "grey", "relationSize": "3px", "relationDisplay": "element", "target": "3", "label": "encodes"} , "group": "edges"} , 
        { "data": { "id": "e5", "source": "4", "relationColor": "orange", "relationSize": "3px", "relationDisplay": "element", "target": "5", "label": "published_in"} , "group": "edges"} , 
        { "data": { "id": "e6", "source": "1", "relationColor": "teal", "relationSize": "3px", "relationDisplay": "element", "target": "6", "label": "participates_in"} , "group": "edges"} , 
        { "data": { "id": "e8", "source": "4", "relationColor": "springGreen", "relationSize": "1px", "relationDisplay": "none", "target": "6", "label": "located_in"} , "group": "edges"} 
		]};
```

The basic required attributes for most networks using cytoscapeJS are:

* nodes: id, type, value
* edges: id, source (from), target (to), label

For **KnetMaps** used in QTLNetMiner, we use a few additional visual attributes as well to ensure that all nodes and edges have distinctive visual attributes depending on the type of node or edge. In general, all network in QTLNetMiner have the following attributes in the dataset:

* nodes: id, type, value, flagged, color, shape, size, annotation, pid, display (in cytoscapeJS: element= show, none= hide)
* edges: id, source, target, label, color, size, display

In QTLNetMiner, the dataset generated also provides an additional JSON object: ```var allGraphData``` that provides additional metadata about nodes (synonyms, accessions, evidences) and edges (scores for weighted edges, e.g, p-value, BLAST scores, etc). This information is displayed in a sliding overlay panel called **ItemInfo** when a node or edge is clicked within the network.

### Initializing the network

The network initialization and rendering code is done in `knet-container.js` and `knet-generator.js`. The network is first invoked via the `generateNetworkGraph(jsonFile)` method within `knet-generator.js`. This method is provided with the server-side path/ url to the file and it reads the file's contents via a JQuery `.getScript()` and callback function before invoking the `initializeNetworkView()` method which defines the dataset and stylesheet for the network as shown below:
```
function initializeNetworkView() {
   var networkJSON= graphJSON; // JSON dataset
   // Define the network stylesheet to be used for nodes & edges in the cytoscape.js container.
   var networkStylesheet= cytoscape.stylesheet()
      .selector('node')
        .css({
          'content': 'data(displayValue)',
          'text-background-color': 'data(conceptTextBGcolor)',
          'text-background-opacity': 'data(conceptTextBGopacity)', // default: '0' (disabled).
          'text-wrap': 'wrap', // for manual and/or autowrapping the label text.
          'border-style': 'data(conceptBorderStyle)', // node border, can be 'solid', 'dotted', 'dashed' or 'double'.
          'border-width': 'data(conceptBorderWidth)',
          'border-color': 'data(conceptBorderColor)',
          'font-size': '16px', // '8px',
          'shape': 'data(conceptShape)',
          'width': 'data(conceptSize)',
          'height': 'data(conceptSize)',
          'background-color': 'data(conceptColor)',
          /** Using 'data(conceptColor)' leads to a "null" mapping error if that attribute is not defined 
           * in cytoscapeJS. Using 'data[conceptColor]' is hence preferred as it limits the scope of 
           * assigning a property value only if it is defined in cytoscapeJS as well. */
          'display': 'data(conceptDisplay)', // 'element' (show) or 'none' (hide).
          'text-opacity': '0' // to make the label invisible by default.
         })
      .selector('edge')
        .css({
          'content': 'data(label)', // label for edges.
          'font-size': '16px',
          'curve-style': 'unbundled-bezier',
          'control-point-step-size': '10px',
          'control-point-distance': '20px',
          'control-point-weight': '50',
          'width': 'data(relationSize)',
          'line-color': 'data(relationColor)',
          'line-style': 'solid', // 'solid' or 'dotted' or 'dashed'
          'target-arrow-shape': 'triangle',
          'target-arrow-color': 'gray',
          'display': 'data(relationDisplay)', // 'element' (show) or 'none' (hide).
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
        });

// On startup
$(function() { // on dom ready
  // load the cytoscapeJS network
  load_reload_Network(networkJSON, networkStylesheet/*, true*/);
  
}); // on dom ready
}
```

As seen above, the **network stylesheet** can be as fine-grained as required by the user and can either use visual attributes from the JSON dataset or simply use standard shapes, sizes and colors for all attributes or even use function callbacks. `Selector` classes can be added for advanced visual rendering such as blurring certain nodes, showing/ hiding nodes and edges, etc.

The above code, upon completion, moves to `knet-container.js` to initialize the core cytopscapeJS container (`cy`) with this specific dataset and network stylesheet.

**Note:** This code has been modularized to ensure network styles are retained when toggling between full screen and tab mode.

### Customizing the network stylesheet

Examples of **network stylesheet** customization to define attributes for nodes and edges can be done in 3 different ways:

- Using fixed attributes hard-coded in the network stylesheet:
```
   var networkStylesheet= cytoscape.stylesheet().selector('node').css({
          'content': 'demo_NodeLabel',
          'text-wrap': 'wrap',
          'border-style': 'dashed', // node border, can be 'solid', 'dotted', 'dashed' or 'double'.
          'border-width': '1px',
          'border-color': 'black',
          'font-size': '16px',
          'shape': 'ellipse',
          'width': '3px',
          'height': '3px',
          'background-color': 'red',
          'display': 'element', // 'element' (show) or 'none' (hide).
          'text-opacity': '0' // to make the label invisible by default.
         })
      .selector('edge')
        .css({
          'content': 'demo_EdgeLabel', // label for edges.
          'font-size': '16px',
          'curve-style': 'unbundled-bezier',
          'control-point-step-size': '10px',
          'control-point-distance': '20px',
          'control-point-weight': '50',
          'width': 'data(relationSize)',
          'line-color': 'red',
          'line-style': 'solid', // 'solid' or 'dotted' or 'dashed'
          'target-arrow-shape': 'triangle',
          'target-arrow-color': 'gray',
          'display': 'element', // 'element' (show) or 'none' (hide).
          'text-opacity': '0' // to make the label invisible by default.
        });
```

- Using attributes from the JSON dataset via `data()` assignment in the network stylesheet:
```
   var networkStylesheet= cytoscape.stylesheet().selector('node').css({
          'content': 'data(displayValue)', // node label from JSON dataset
          'text-wrap': 'wrap',
          'border-style': 'data(conceptBorderStyle)',
          'border-width': 'data(conceptBorderWidth)',
          'border-color': 'data(conceptBorderColor)',
          'font-size': '16px',
          'shape': 'data(conceptShape)',
          'width': 'data(conceptSize)',
          'height': 'data(conceptSize)',
          'background-color': 'data(conceptColor)',
          'display': 'data(conceptDisplay)',
          'text-opacity': '0' // to make the label invisible by default.
         })
      .selector('edge')
        .css({
          'content': 'data(label)', // edge label from JSON dataset
          'font-size': '16px',
          'curve-style': 'unbundled-bezier',
          'control-point-step-size': '10px',
          'control-point-distance': '20px',
          'control-point-weight': '50',
          'width': 'data(relationSize)',
          'line-color': 'data(relationColor)',
          'line-style': 'solid', // 'solid' or 'dotted' or 'dashed'
          'target-arrow-shape': 'triangle',
          'target-arrow-color': 'gray',
          'display': 'data(relationDisplay)',
          'text-opacity': '0' // to make the label invisible by default.
        });
```

- Using functions in the network stylesheet:
```
   var networkStylesheet= cytoscape.stylesheet().selector('node').css({
          'content': function(ele) {
                      var label= ele.data('value');
                      // Trim the label's length.
                      if(label.length> 30) { label= label.substr(0,29)+'...'; }
                      return label;
                     },
          'text-wrap': 'wrap',
          'border-style': function(ele) {
                              var node_borderStyle= 'solid';
                              // Check if the node was flagged or not
                              if(ele.data('flagged') === "true") {
                                 node_borderStyle= 'double';
                                }
                              return node_borderStyle;
                          },
          'border-width': function(ele) {
                              var node_borderWidth= '1px';
                              // Check if the node was flagged or not
                              if(ele.data('flagged') === "true") {
                                 node_borderWidth= '3px';
                                }
                              return node_borderWidth;
                          },
          'border-color': function(ele) {
                              var node_borderColor= 'black';
                              // Check if the node was flagged or not
                              if(ele.data('flagged') === "true") {
                                 node_borderColor= 'navy';
                                }
                              return node_borderColor;
                           },
          'font-size': '16px',
          'shape': 'data(conceptShape)',
          'width': 'data(conceptSize)',
          'height': 'data(conceptSize)',
          'background-color': 'data(conceptColor)',
          'display': 'data(conceptDisplay)', // 'element' (show) or 'none' (hide).
          'text-opacity': '0' // to make the label invisible by default.
         })
      .selector('edge')
        .css({
          'content': 'data(label)',
          'font-size': '16px',
          'curve-style': 'unbundled-bezier',
          'control-point-step-size': '10px',
          'control-point-distance': '20px',
          'control-point-weight': '50',
          'width': 'data(relationSize)',
          'line-color': 'data(relationColor)',
          'line-style': 'solid', // 'solid' or 'dotted' or 'dashed'
          'target-arrow-shape': 'triangle',
          'target-arrow-color': 'gray',
          'display': 'data(relationDisplay)', // 'element' (show) or 'none' (hide).
          'text-opacity': '0' // to make the label invisible by default.
        });
```

### Layouts
