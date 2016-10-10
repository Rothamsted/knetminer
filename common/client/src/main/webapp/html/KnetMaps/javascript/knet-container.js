function load_reload_Network(network_json, network_style/*, runNetLayout*/) {

//console.log("style: "+ JSON.stringify(network_style, null, 4));
//console.log("load_reload_Network: elements: "+ JSON.stringify(network_json, null, 4));

// Initialise a cytoscape container instance on the HTML DOM using JQuery.
$('#cy').cytoscape({
  container: document.getElementById('cy')/*$('#cy')*/,

  style: network_style,

  // Using the JSON data to create the nodes.
  elements: network_json,
  
//  layout: /*defaultNetworkLayout*/ coseNetworkLayout, // layout of the Network
  // these options hide parts of the graph during interaction such as panning, dragging, etc. to enable faster rendering for larger graphs.
//  hideLabelsOnViewport: true,
//  hideEdgesOnViewport: true,

  // this is an alternative that uses a bitmap during interaction.
  textureOnViewport: false, // true,
  /* the colour of the area outside the viewport texture when initOptions.textureOnViewport === true can
   * be set by: e.g., outside-texture-bg-color: white, */

  // interpolate on high density displays instead of increasing resolution.
  pixelRatio: 1,

  // Zoom settings
  zoomingEnabled: true, // zooming: both by user and programmatically.
//  userZoomingEnabled: true, // user-enabled zooming.
  zoom: 1, // the initial zoom level of the graph before the layout is set.
//  minZoom: 1e-50, maxZoom: 1e50,
  /* mouse wheel sensitivity settings to enable a more gradual Zooming process. A value between 0 and 1 
   * reduces the sensitivity (zooms slower) & a value greater than 1 increases the sensitivity. */
  wheelSensitivity: 0.05,

  panningEnabled: true, // panning: both by user and programmatically.
//  userPanningEnabled: true, // user-enabled panning.

  // for Touch-based gestures.
//  selectionType: (isTouchDevice ? 'additive' : 'single'),
  touchTapThreshold: 8,
  desktopTapThreshold: 4,
  autolock: false,
  autoungrabify: false,
  autounselectify: false,

  // a "motion blur" effect that increases perceived performance for little or no cost.
  motionBlur: true,

  ready: function() {
   //if(runNetLayout===true) {
    //  setDefaultLayout(); // set default Layout
      rerunLayout(); // reset current layout.
     //}
   window.cy= this;
  }
});

// Get the cytoscape instance as a Javascript object from JQuery.
var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

// cy.boxSelectionEnabled(true); // enable box selection (highlight & select multiple elements for moving via mouse click and drag).
cy.boxSelectionEnabled(false); // to disable box selection & hence allow Panning, i.e., dragging the entire graph.

// Set requisite background image for each concept (node) instead of using cytoscapeJS shapes.
/* cy.nodes().forEach(function( ele ) {
  var conType= ele.data('conceptType');
  var imgName= 'Gene'; // default
  if(conType === "Biological_Process") {
     imgName= 'Biological_process';
    }
  else if(conType === "Cellular_Component") {
       imgName= 'Cellular_component';
      }
  else if(conType === "Gene") {
       imgName= 'Gene';
      }
  else if(conType === "Protein Domain") {
     imgName= 'Protein_domain';
    }
  else if(conType === "Pathway") {
     imgName= 'Pathway';
    }
  else if(conType === "Reaction") {
     imgName= 'Reaction';
    }
  else if(conType === "Publication") {
     imgName= 'Publication';
    }
  else if(conType === "Protein") {
     imgName= 'Protein';
    }
  else if(conType === "Quantitative Trait Locus") {
     imgName= 'QTL';
    }
  else if(conType === "Enzyme") {
     imgName= 'Enzyme';
    }
  else if(conType === "Molecular_Function") {
     imgName= 'Molecular_function';
    }
  else if((conType === "Enzyme_Classification") || (conType === "Enzyme Classification")) {
     imgName= 'Enzyme_classification';
    }
  else if(conType === "Trait Ontology") {
     imgName= 'Trait_ontology';
    }
  else if(conType === "Scaffold") {
     imgName= 'Scaffold';
    }
  else if((conType === "Compound") || (conType === "SNP")) {
     imgName= 'Compound';
    }
  else if(conType === "Phenotype") {
     imgName= 'Phenotype';
    }
  var eleImage= 'image/'+ imgName +'.png';
//  var eleImage= data_url +'image/'+ imgName +'.png';

  // Add these properties to this element's JSON.
  ele.data('nodeImage', eleImage);
//  console.log("data.nodeImage "+ ele.data('nodeImage'));
 });

 // Update the stylesheet for the Network Graph to show background images for Nodes.
 cy.style().selector('node').css({ // Show actual background images.
           'background-image': 'data(nodeImage)',
           'background-fit': 'none' // can be 'none' (for original size), 'contain' (to fit inside node) or 'cover' (to cover the node).
          }).update();
*/

/** Add a Qtip message to all the nodes & edges using QTip displaying their Concept Type & value when a 
 * node/ edge is clicked.
 * Note: Specify 'node' or 'edge' to bind an event to a specific type of element.
 * e.g, cy.elements('node').qtip({ }); or cy.elements('edge').qtip({ }); */
cy.elements().qtip({
  content: function() {
     var qtipMsg= "";
     try {
      if(this.isNode()) {
         qtipMsg= "Concept: "+ this.data('value') +", type: "+ this.data('conceptType') +", PID: "+ 
                  this.data('pid') +" , flagged: "+ this.data('flagged') +"<br>"+"Annotation: "+ 
                  this.data('annotation');
        }
      else if(this.isEdge()) {
              qtipMsg= "Relation: "+ this.data('label') +", From: "+ this.data('source') +", To: "+ 
                      this.data('target');
             }
      }
      catch(err) { qtipMsg= "Selected element is neither a Concept nor a Relation"; }
      return qtipMsg;
     },
  style: {
    classes: 'qtip-bootstrap',
    tip: {
      width: 12,
      height: 6
    }
  }
});

/** Event handling: mouse 'tap' event on all the elements of the core (i.e., the cytoscape container).
 * Note: Specify 'node' or 'edge' to bind an event to a specific type of element.
 * e.g, cy.on('tap', 'node', function(e){ }); or cy.on('tap', 'edge', function(e){ }); */
 cy.on('tap', function(e) {
    var thisElement= e.cyTarget;
    var info= "";
    try {
    if(thisElement.isNode()) {
       info= "Concept selected: "+ thisElement.data('value') +", type: "+ thisElement.data('conceptType')
               +", PID: "+ thisElement.data('pid');
       // Also update the Item Info table & display it.
//       showItemInfo(thisElement);
      }
      else if(thisElement.isEdge()) {
              info= "Relation selected: "+ thisElement.data('label') +", From: "+ 
                      thisElement.data('source') +", To: "+ thisElement.data('target');
             }
       // Also update the Item Info table & display it.
//       showItemInfo(thisElement);
      }
      catch(err) { info= "Selected element is neither a Concept nor a Relation"; }
    console.log(info);
    showItemInfo(thisElement);
   });
// cxttap - normalised right click or 2-finger tap event.

 /** Popup (context) menu: a circular Context Menu for each Node (concept) & Edge (relation) using the 'cxtmenu' jQuery plugin. */
 var contextMenu= {
    menuRadius: 75, // the radius of the circular menu in pixels

    // Use selector: '*' to set this circular Context Menu on all the elements of the core.
    /** Note: Specify selector: 'node' or 'edge' to restrict the context menu to a specific type of element. e.g, 
     * selector: 'node', // to have context menu only for nodes.
     * selector: 'edge', // to have context menu only for edges. */
    selector: '*',
    commands: [ // an array of commands to list in the menu
        {
         content: 'Item Info',
         select: function() {
             // Show Item Info Pane.
             openItemInfoPane();

             // Display Item Info.
             showItemInfo(this);
            }
        },
            
        {
         content: 'Show Links',
         select: function() {
             if(this.isNode()) {
                showLinks(this);
  			    // Refresh network legend.
                updateCyLegend();
               }
           }
        },

        {
         content: 'Hide',
         select: function() {
             //this.hide(); // hide the selected 'node' or 'edge' element.
			 this.removeClass('ShowItAll');
			 this.addClass('HideThis');
			 // Refresh network legend.
             updateCyLegend();
            }
        },

        {
         content: 'Hide by Type',
         select: function() { // Hide all concepts (nodes) of the same type.
             if(this.isNode()) {
                var thisConceptType= this.data('conceptType');
                console.log("Hide Concept by Type: "+ thisConceptType);
                cy.nodes().forEach(function( ele ) {
                 if(ele.data('conceptType') === thisConceptType) {
                    //ele.hide();
                    ele.removeClass('ShowItAll');
                    ele.addClass('HideThis');
                   }
                });
                // Relayout the graph.
                //rerunLayout();
               }
             else if(this.isEdge()) { // Hide all relations (edges) of the same type.
                var thisRelationType= this.data('label');
                console.log("Hide Relation (by Label type): "+ thisRelationType);
                cy.edges().forEach(function( ele ) {
                 if(ele.data('label') === thisRelationType) {
                    //ele.hide();
                    ele.removeClass('ShowItAll');
                    ele.addClass('HideIt');
                   }
                });
                // Relayout the graph.
                rerunLayout();
               }
  			// Refresh network legend.
            updateCyLegend();
           }
        },

        /*{
         content: 'Show Selections',
         select: function() {
             $("#infoDialog").dialog(); // initialize a dialog box.
             // Display details of all the selected elements: nodes & edges.
             var selections= "";
             cy.nodes().forEach(function( ele ) {
                if(ele.selected()) {
                   selections += ele.data('conceptType') +" : "+ ele.data('value') +" , PID: "+ ele.data('pid') + "<br/><br/>";
                  }
             });

             cy.edges().forEach(function( ele ) {
                if(ele.selected()) {
                   selections += "Relation: "+ ele.data('label') +" , From: "+ ele.data('source') +" , To: "+ ele.data('target') +"<br/>";
                  }
             });
             console.log("ShowSelections (Shift+click): selections= "+ selections);
             $("#infoDialog").html(selections);
            }
        },*/

        {
         content: 'Label on/ off by Type',
         select: function() {
             var thisElementType, eleType, elements;
             if(this.isNode()) {
                thisElementType= this.data('conceptType'); // get all concept Types.
                eleType= 'conceptType';
                elements= cy.nodes(); // fetch all the nodes.
               }
             else if(this.isEdge()) {
                thisElementType= this.data('label'); // get all relation Labels.
                eleType= 'label';
                elements= cy.edges(); // fetch all the edges.
               }
             console.log("Toggle Label on/ off by type: "+ thisElementType);

             if(this.isNode() || this.isEdge()) {
                if(this.style('text-opacity') === '0') {
                   elements.forEach(function( ele ) {
                    if(ele.data(eleType) === thisElementType) {
                       ele.style({'text-opacity': '1'}); // show the concept/ relation Label.
                      }
                   });
                  }
                  else {
                   elements.forEach(function( ele ) {
                    if(ele.data(eleType) === thisElementType) {
                       ele.style({'text-opacity': '0'}); // hide the concept/ relation Label.
                      }
                   });
                  }
               }
            }
        },

        {
         content: 'Label on/ off',
         select: function() {
             if(this.style('text-opacity') === '0') {
                this.style({'text-opacity': '1'}); // show the concept/ relation Label.
               }
               else {
                this.style({'text-opacity': '0'}); // hide the concept/ relation Label.
               }
            }
        }
    ], 
    fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
    activeFillColor: 'rgba(92, 194, 237, 0.75)', // the colour used to indicate the selected command
    activePadding: 2, // 20, // additional size in pixels for the active command
    indicatorSize: 15, // 24, // the size in pixels of the pointer to the active command
    separatorWidth: 3, // the empty spacing in pixels between successive commands
    spotlightPadding: 3, // extra spacing in pixels between the element and the spotlight
    minSpotlightRadius: 5, // 24, // the minimum radius in pixels of the spotlight
    maxSpotlightRadius: 10, // 38, // the maximum radius in pixels of the spotlight
    itemColor: 'white', // the colour of text in the command's content
    itemTextShadowColor: 'black', // the text shadow colour of the command's content
    zIndex: 9999 // the z-index of the ui div
 };

cy.cxtmenu(contextMenu); // set Context Menu for all the core elements.

 // Show the popup Info. dialog box.
 $('#infoDialog').click(function() {
   $('#infoDialog').slideToggle(300);
  });

}
