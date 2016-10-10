
  // Refresh network legend whenever nodes are hidden individually or in group or in case of "Show All" or "Show Links".
  function updateCyLegend() {
	var cy= $('#cy').cytoscape('get');
	var totalNodes= cy.nodes().size();
	var nodes_shown= cy.$(':visible').nodes().size();
//	var nodes_hidden= totalNodes - totalNodes_shown;
	var cyLegend= "Network: Concepts: "+ nodes_shown +" ("+ totalNodes +")";

	var totalEdges= cy.edges().size();
	var edges_shown= cy.$(':visible').edges().size();
//	var edges_hidden= totalEdges - totalEdges_shown;
	cyLegend= cyLegend +"; Relations: "+ edges_shown +" ("+ totalEdges +")";

//	console.log(cyLegend);
	$('#countsLegend span').text(cyLegend); // update
   }
