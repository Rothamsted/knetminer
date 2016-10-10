/**
 * @name Network View layouts
 * @description code for Network View using CytoscapeJS layouts such as breadthfirst, grid, cose, circle 
 * & concentric & third party layout algorithms such as WebCola, arbor, springy, spread & dagre (tree).
 * @returns
 **/
   var animate_layout= true; // global variable for layout animation setting (default: true).

   function setLayoutAnimationSetting() { // Toggle layout animation On/ Off.
    if(document.getElementById("animateLayout").checked) {
       animate_layout= true;
      }
    else {
     animate_layout= false;
    }
    console.log("setLayoutAnimationSetting()>> checkbox checked: "+ document.getElementById("animateLayout").checked +" --> animate_layout= "+ animate_layout);
   }

  // Set Cose layout.
  /* Useful for larger networks with clustering. */
  function setCoseLayout(eles) {
   //console.log("setCoseLayout()>> animate_layout= "+ animate_layout);
   eles.layout(coseNetworkLayout); // run the CoSE layout algorithm.
  }

  // Set Force layout.
  function setNgraphForceLayout(eles) {
   //console.log("setNgraphForceLayout()>> animate_layout= "+ animate_layout);
   eles.layout(ngraph_forceNetworkLayout); // run the Force layout.
  }

  // Set Circle layout.
  function setCircleLayout(eles) {
   //console.log("setCircleLayout()>> animate_layout= "+ animate_layout);
   eles.layout(circleNetworkLayout); // run the Circle layout.
  }

  // Set Concentric layout.
  function setConcentricLayout(eles) {
   //console.log("setConcentricLayout()>> animate_layout= "+ animate_layout);
   eles.layout(concentricNetworkLayout); // run the Concentric layout.
  }

  // Set CoSE-Bilkent layout.
  /* with node clustering, but performance-intensive for larger networks */
  function setCoseBilkentLayout(eles) {
   //console.log("setCoseLayout()>> animate_layout= "+ animate_layout);
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
