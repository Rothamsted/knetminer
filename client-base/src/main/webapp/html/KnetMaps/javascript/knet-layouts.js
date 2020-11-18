/**
 * @name Network layouts
 * @description using cytoscapeJS layouts & 3rd party layout algorithms.
 **/

var KNETMAPS = KNETMAPS || {};

KNETMAPS.Layouts = function() {
	
	var defaults = KNETMAPS.LayoutDefaults();

	var my = function() {};
	
   var animate_layout= true; // global variable for layout animation setting (default: true).

   my.setLayoutAnimationSetting = function() { // Toggle layout animation On/ Off.
    if(document.getElementById("animateLayout").checked) {
       animate_layout= true;
      }
    else {
     animate_layout= false;
    }
   }

  // Set Cose layout.
  /* Useful for larger networks with clustering. */
   my.setCoseLayout = function(eles) {
   eles.layout(defaults.coseNetworkLayout); // run the CoSE layout algorithm.
  }

  // Set Force layout.
   my.setNgraphForceLayout = function(eles) {
   eles.layout(defaults.ngraph_forceNetworkLayout); // run the Force layout.
  }

  // Set Circle layout.
   my.setCircleLayout = function(eles) {
   eles.layout(defaults.circleNetworkLayout); // run the Circle layout.
  }

  // Set Concentric layout.
   my.setConcentricLayout = function(eles) {
   eles.layout(defaults.concentricNetworkLayout); // run the Concentric layout.
  }

  // Set CoSE-Bilkent layout.
  /* with node clustering, but performance-intensive for larger networks */
   my.setCoseBilkentLayout = function(eles) {
   eles.layout(defaults.coseBilkentNetworkLayout);
  }

  // Set Preset layout.
   my.setPresetLayout = function(eles) {
	// test...
	/* var cy= $('#cy').cytoscape('get');
	cy.nodes().forEach(function(n) {
    var x = n.position("x");
    var y = n.position("y");
	console.log("x,y: "+ x +","+ y); }); */
	
	console.log("use preset layout...");
    eles.layout(defaults.presetLayout); // run the preset layout for reloaded knetworks.
  }

  // Set default (CoSE) layout for the network graph.
   my.setDefaultLayout = function() {
   //console.log("cyJS container initialized... set default layout (on visible).");
   // Get the cytoscape instance as a Javascript object from JQuery.
   var cy= $('#cy').cytoscape('get');
   my.setCoseLayout(cy.$(':visible')); // run the layout only on the visible elements.
   cy.reset().fit();
  }
   
   return my;
};