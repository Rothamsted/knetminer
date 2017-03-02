  // Refresh network stats <div> whenever nodes are hidden individually or in group or in case of "Show All" or "Show Links".
  function updateKnetStats() {
	var cy= $('#cy').cytoscape('get');
	var totalNodes= cy.nodes().size();
	var nodes_shown= cy.$(':visible').nodes().size();
	var cyLegend= "Concepts: "+ nodes_shown +" ("+ totalNodes +")";

	var totalEdges= cy.edges().size();
	var edges_shown= cy.$(':visible').edges().size();
	cyLegend= cyLegend +"; Relations: "+ edges_shown +" ("+ totalEdges +")";

//	console.log(cyLegend);
	$('#statsLegend span').text(cyLegend); // update
   }
