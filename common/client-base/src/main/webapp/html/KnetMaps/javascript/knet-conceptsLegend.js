var KNETMAPS = KNETMAPS || {};

KNETMAPS.ConceptsLegend = function() {

	var stats = KNETMAPS.Stats();
	
	var my = function() {};
	
  // Dynamically populate interactive concept legend.
  my.populateConceptLegend = function() {
      var cy= $('#cy').cytoscape('get');
      var conNodes= cy.nodes();
      var conceptTypes= []; // get a unique Array with all concept Types in current network.
      conNodes.forEach(function( ele ) {
          if(conceptTypes.indexOf(ele.data('conceptType')) === -1 ) {
             conceptTypes.push(ele.data('conceptType'));
            }
      });
//      conceptTypes.sort(); // sort alpabetically, fails as "Trait" is displayed as "GWAS"

      var conceptsHashmap= {};
      conceptTypes.forEach(function(conType,index){
          var conCount= conNodes.filterFn(function( ele ) {
              return ele.data('conceptType') === conType;
             }).size();
          // Push count of concepts of this Type to concepts hashmap
          conceptsHashmap[conType]= conCount;
      });

      // update knetLegend.
      var knetLegend= '<div class="knetInteractiveLegend"><div class="knetLegend_row">'+'<div class="knetLegend_cell"><b>Interactive Legend:</b></div>';
      // Show concept Type icons (with total count displayed alongside).
      for(var con in conceptsHashmap) {
          var conText= con;
          if(conText === "Biological_Process") {
             conText= "BioProc";
            }
          else if(conText === "Molecular_Function") {
                  conText= "MolFunc";
                 }
	  else if(conText === "Cellular_Component") {
		  conText= "CellComp";
		 }
	  else if(conText === "Trait Ontology") {
		  conText= "TO";
		 }
		  else if(conText === "PlantOntologyTerm") {
			      conText= "PO";
		      }
	  else if(conText === "Trait") {
		  conText= "GWAS";
		 }
	  else if(conText === "Enzyme Classification") {
		  conText= "EC";
		 }
	  else if(conText === "Quantitative Trait Locus") {
		  conText= "QTL";
		 }
	  else if(conText === "Protein Domain") {
		  conText= "Domain";
		 }
          knetLegend= knetLegend +'<div class="knetLegend_cell"><input type="submit" value="" id="'+ con +'" title="Show All '+ con +'(s)" class="knetCon_'+con.replace(/ /g,'_')+'" style="vertical-align:middle" onclick="showConnectedByType(this.id);">'+ 
		                conceptsHashmap[con] +'<span class="icon_caption">'+ conText +'</span></div>';
         }
        knetLegend= knetLegend +'</div></div>';
	$('#knetLegend').html(knetLegend); // update knetLegend
   }

  my.showConnectedByType = function(conType) {
  var cy= $('#cy').cytoscape('get');

  var hiddenNodes_ofSameType= cy.collection();
  cy.nodes().filter('node[conceptType="'+conType+'"]').forEach(function( conc ) {
       if(conc.hasClass('HideEle')) {
          hiddenNodes_ofSameType= hiddenNodes_ofSameType.add(conc);
         }
    });

  var currently_visibleNodes= cy.collection();
  cy.nodes().forEach(function( conc ) {
       if(conc.hasClass('ShowEle')) {
          currently_visibleNodes= currently_visibleNodes.add(conc);
         }
    });

  // Display hidden nodes of same Type which are connected to currently visible Nodes.
  hiddenNodes_ofSameType.edgesWith(currently_visibleNodes).connectedNodes().addClass('ShowEle').removeClass('HideEle');
  // Display edges between such connected Nodes too.
  hiddenNodes_ofSameType.edgesWith(currently_visibleNodes).addClass('ShowEle').removeClass('HideEle');

  stats.updateKnetStats(); // Refresh network Stats.
 }
  
  return my;
};
