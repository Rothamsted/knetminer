/**
 * @name Network layouts
 * @description using cytoscapeJS layouts & 3rd party layout algorithms.
 **/
   var animate_layout= true; // global variable for layout animation setting (default: true).

   function setLayoutAnimationSetting() { // Toggle layout animation On/ Off.
    if(document.getElementById("animateLayout").checked) {
       animate_layout= true;
      }
    else {
     animate_layout= false;
    }
   }

  // Set Cose layout.
  /* Useful for larger networks with clustering. */
  function setCoseLayout(eles) {
   eles.layout(coseNetworkLayout); // run the CoSE layout algorithm.
  }

  // Set Force layout.
  function setNgraphForceLayout(eles) {
   eles.layout(ngraph_forceNetworkLayout); // run the Force layout.
  }

  // Set Circle layout.
  function setCircleLayout(eles) {
   eles.layout(circleNetworkLayout); // run the Circle layout.
  }

  // Set Concentric layout.
  function setConcentricLayout(eles) {
   eles.layout(concentricNetworkLayout); // run the Concentric layout.
  }

  // Set CoSE-Bilkent layout.
  /* with node clustering, but performance-intensive for larger networks */
  function setCoseBilkentLayout(eles) {
   eles.layout(coseBilkentNetworkLayout);
  }

  // Set default (CoSE) layout for the network graph.
  function setDefaultLayout() {
   //console.log("cytoscapeJS container (cy) initialized... set default layout (on visible elements)...");
   // Get the cytoscape instance as a Javascript object from JQuery.
   var cy= $('#cy').cytoscape('get');
   setCoseLayout(cy.$(':visible')); // run the layout only on the visible elements.
   cy.reset().fit();
  }
