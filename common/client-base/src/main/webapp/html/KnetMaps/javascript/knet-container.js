var KNETMAPS = KNETMAPS || {};

KNETMAPS.Container = function() {

	var stats = KNETMAPS.Stats();
	var iteminfo = KNETMAPS.ItemInfo();
	var conceptLegend = KNETMAPS.ConceptsLegend();
	var layouts = KNETMAPS.Layouts();

	var my = function() {};
	
my.load_reload_Network = function(network_json, network_style, isReloaded) {
  console.log("load the cytoscapeJS network... isJSON: "+ isReloaded);

 // Initialise a cytoscape container instance on the HTML DOM using JQuery.
 //var cy = cytoscape({
 var cy = window.cy = cytoscape({
  container: document.getElementById('cy')/*$('#cy')*/,
  style: network_style,
  // Using the JSON data to create the nodes.
  elements: network_json,
  
  // layout of the Network: isReloaded (set preset layout), else (for JS vars, do nothing).
  layout: isReloaded ? { name: 'preset' } : '',

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
	  if(isReloaded === false) {
		 /* when rendering new knetwork or maximize/minimize, then run selected (default) layout. For reloaded knetworks, skip this. */
		 KNETMAPS.Menu().rerunLayout(); // reset current layout.
	    }
	  window.cy= this;
  }
});

// Get the cytoscape instance as a Javascript object from JQuery.
//var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

// cy.boxSelectionEnabled(true); // enable box selection (highlight & select multiple elements for moving via mouse click and drag).
cy.boxSelectionEnabled(false); // to disable box selection & hence allow Panning, i.e., dragging the entire graph.

// Set requisite background image for each concept (node) instead of using cytoscapeJS shapes.
/* cy.nodes().forEach(function( ele ) {
  var conType= ele.data('conceptType');
  var imgName= 'Gene'; // default
  if(conType === "Biological_Process") { imgName= 'Biological_process'; }
  else if(conType === "Cellular_Component") { imgName= 'Cellular_component'; }
  else if(conType === "Gene") { imgName= 'Gene'; }
  else if(conType === "Protein Domain") { imgName= 'Protein_domain'; }
  else if(conType === "Pathway") { imgName= 'Pathway'; }
  else if(conType === "Reaction") { imgName= 'Reaction'; }
  else if(conType === "Publication") { imgName= 'Publication'; }
  else if(conType === "Protein") { imgName= 'Protein'; }
  else if(conType === "Quantitative Trait Locus") { imgName= 'QTL'; }
  else if(conType === "Enzyme") { imgName= 'Enzyme'; }
  else if(conType === "Molecular_Function") { imgName= 'Molecular_function'; }
  else if((conType === "Enzyme_Classification") || (conType === "Enzyme Classification")) { imgName= 'Enzyme_classification'; }
  else if(conType === "Trait Ontology") { imgName= 'Trait_ontology'; }
  else if(conType === "Scaffold") { imgName= 'Scaffold'; }
  else if((conType === "Compound") || (conType === "SNP")) { imgName= 'Compound'; }
  else if(conType === "Phenotype") { imgName= 'Phenotype'; }
  var eleImage= 'image/'+ imgName +'.png';
//  var eleImage= data_url +'image/'+ imgName +'.png';
  // Add these properties to this element's JSON.
  ele.data('nodeImage', eleImage);
//  console.log("set data.nodeImage "+ ele.data('nodeImage'));
 });

 // Update the stylesheet for the Network Graph to show background images for Nodes.
 cy.style().selector('node').css({ // Show actual background images.
           'background-image': 'data(nodeImage)',
           'background-fit': 'none' // can be 'none' (for original size), 'contain' (to fit inside node) or 'cover' (to cover the node).
          }).update();
*/

/** Add a Qtip message to all the nodes & edges using QTip displaying their Concept Type & value when a node/ edge is clicked.
 * Note: Specify 'node' or 'edge' to bind an event to a specific type of element.
 * e.g, cy.elements('node').qtip({ }); or cy.elements('edge').qtip({ }); */
cy.elements().qtip({
  content: function() {
     var qtipMsg= "";
     try {
      if(this.isNode()) {
         qtipMsg= "<b>Concept:</b> "+ this.data('value') +"<br/><b>Type:</b> "+ this.data('conceptType');
        }
      else if(this.isEdge()) {
              qtipMsg= "<b>Relation:</b> "+ this.data('label');
              var fromID= this.data('source'); // relation source ('fromConcept')
              qtipMsg= qtipMsg +"<br/><b>From:</b> "+ cy.$('#'+fromID).data('value') +" ("+ cy.$('#'+fromID).data('conceptType').toLowerCase() +")";
              var toID= this.data('target'); // relation source ('toConcept')
              qtipMsg= qtipMsg +"<br/><b>To:</b> "+ cy.$('#'+toID).data('value') +" ("+ cy.$('#'+toID).data('conceptType').toLowerCase() +")";
             }
      }
      catch(err) { qtipMsg= "Selected element is neither a Concept nor a Relation"; }
      return qtipMsg;
     },
  style: {
    classes: 'qtip-bootstrap',
    tip: { width: 12, height: 6 }
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
       info= "<b>Concept:</b> "+ thisElement.data('value') +"<br/><b>Type:</b> "+ thisElement.data('conceptType');
      }
      else if(thisElement.isEdge()) {
              info= "<b>Relation:</b> "+ this.data('label');
              var fromID= this.data('source'); // relation source ('fromConcept')
              info= info +"<br/><b>From:</b> "+ cy.$('#'+fromID).data('value') +" ("+ cy.$('#'+fromID).data('conceptType').toLowerCase();
              var toID= this.data('target'); // relation source ('toConcept')
              info= info +"<br/><b>To:</b> "+ cy.$('#'+toID).data('value') +" ("+ cy.$('#'+toID).data('conceptType').toLowerCase() +")";
             }
      }
    catch(err) { info= "Selected element is neither a Concept nor a Relation"; }
    console.log(info);
    iteminfo.showItemInfo(thisElement);
   });
// cxttap - normalised right click or 2-finger tap event.

 /** Popup (context) menu: a circular Context Menu for each Node (concept) & Edge (relation) using the 'cxtmenu' jQuery plugin. */
 var contextMenu= {
    menuRadius: 80, // the radius of the circular menu in pixels

    // Use selector: '*' to set this circular Context Menu on all the elements of the core.
    /** Note: Specify selector: 'node' or 'edge' to restrict the context menu to a specific type of element. e.g, 
     * selector: 'node', // to have context menu only for nodes.
     * selector: 'edge', // to have context menu only for edges. */
    selector: '*',
    commands: [ // an array of commands to list in the menu
        {
         content: 'Show Info',
         select: function() {
             // Show Item Info Pane.
        	 iteminfo.openItemInfoPane();
             // Display Item Info.
        	 iteminfo.showItemInfo(this);
            }
        },
            
        {
         content: 'Show Links',
         select: function() {
             if(this.isNode()) {
            	 iteminfo.showLinks(this);
                // Refresh network legend.
                stats.updateKnetStats();
               }
           }
        },

        {
         content: 'Hide',
         select: function() {
             //this.hide(); // hide the selected 'node' or 'edge' element.
             this.removeClass('ShowEle');
             this.addClass('HideEle');
             // Refresh network legend.
             stats.updateKnetStats();
             conceptLegend.populateConceptLegend();
            }
        },
        
        // disabled Hide by Type feature (Jan. 2020)
    /*    {
         content: 'Hide by Type',
         select: function() { // Hide all concepts (nodes) of the same type.
             if(this.isNode()) {
                var thisConceptType= this.data('conceptType');
        //        console.log("Hide Concept by Type: "+ thisConceptType);
                cy.nodes().forEach(function( ele ) {
                 if(ele.data('conceptType') === thisConceptType) {
                    //ele.hide();
                    ele.removeClass('ShowEle');
                    ele.addClass('HideEle');
                   }
                });
                // Relayout the graph.
                //rerunLayout();
               }
             else if(this.isEdge()) { // Hide all relations (edges) of the same type.
                var thisRelationType= this.data('label');
        //        console.log("Hide Relation (by Label type): "+ thisRelationType);
                cy.edges().forEach(function( ele ) {
                 if(ele.data('label') === thisRelationType) {
                    //ele.hide();
                    ele.removeClass('ShowEle');
                    ele.addClass('HideEle');
                   }
                });
                // Relayout the graph.
               // rerunLayout();
               }
            // Refresh network Stats.
            stats.updateKnetStats();
            conceptLegend.populateConceptLegend();
           }
        }, */
        
        {
	  // Turn the highlighter on or off, respectively. 
          content: 'Highlighter on/off',
          select: function () {
              if (this.isNode() && this.css('text-background-opacity') == '1') {
                  this.css({
                      'text-background-opacity': '0'
                  });
              }
              else if (this.isNode() && this.css('text-background-opacity') == '0') {
                    this.css({
                        'text-background-opacity': '1'
                    });
              }
          }
        },

//        {
//         content: 'Hide by Type',
//         select: function() { // Hide all concepts (nodes) of the same type.
//             if(this.isNode()) {
//                var thisConceptType= this.data('conceptType');
//        //        console.log("Hide Concept by Type: "+ thisConceptType);
//                cy.nodes().forEach(function( ele ) {
//                 if(ele.data('conceptType') === thisConceptType) {
//                    //ele.hide();
//                    ele.removeClass('ShowEle');
//                    ele.addClass('HideEle');
//                   }
//                });
//                // Relayout the graph.
//                //rerunLayout();
//               }
//             else if(this.isEdge()) { // Hide all relations (edges) of the same type.
//                var thisRelationType= this.data('label');
//        //        console.log("Hide Relation (by Label type): "+ thisRelationType);
//                cy.edges().forEach(function( ele ) {
//                 if(ele.data('label') === thisRelationType) {
//                    //ele.hide();
//                    ele.removeClass('ShowEle');
//                    ele.addClass('HideEle');
//                   }
//                });
//                // Relayout the graph.
//               // rerunLayout();
//               }
//            // Refresh network Stats.
//            stats.updateKnetStats();
//            conceptLegend.populateConceptLegend();
//           }
//        },

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

                if(this.hasClass("LabelOff")) {  // show the concept/ relation Label.
                   elements.forEach(function( ele ) {
                    if(ele.data(eleType) === thisElementType) { // for same concept or relation types
                       if(ele.hasClass("LabelOff")) {
                          ele.removeClass("LabelOff");
                          ele.addClass("LabelOn");
                         }
                      }
                   });
                  }
                  else if(this.hasClass("LabelOn")) { // hide the concept/ relation Label.
                      elements.forEach(function( ele ) {
                       if(ele.data(eleType) === thisElementType) { // for same concept or relation types
                          if(ele.hasClass("LabelOn")) {
                             ele.removeClass("LabelOn");
                             ele.addClass("LabelOff");
                            }
                         }
                      });
                    }
            }
        },

        {
         content: 'Label on/ off',
         select: function() {
             if(this.hasClass("LabelOff")) {  // show the concept/ relation Label.
                this.removeClass("LabelOff");
                this.addClass("LabelOn");
               }
             else if(this.hasClass("LabelOn")) {  // hide the concept/ relation Label.
                this.removeClass("LabelOn");
                this.addClass("LabelOff");
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

};

return my;
};
