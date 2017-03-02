  // Dynamically populate interactive concept legend.
  function populateConceptLegend() {
      var cy= $('#cy').cytoscape('get');
      var conNodes= cy.nodes();
      var conceptTypes= []; // get a unique Array with all concept Types in current network.
      conNodes.forEach(function( ele ) {
          if(conceptTypes.indexOf(ele.data('conceptType')) === -1 ) {
             conceptTypes.push(ele.data('conceptType'));
            }
      });
//      console.log("\t conceptTypes in this network: "+ conceptTypes +"\n");

      var conceptsHashmap= {};
      conceptTypes.forEach(function(conType,index){
          var conCount= conNodes.filterFn(function( ele ) {
              return ele.data('conceptType') === conType;
             }).size();
          // Push count of concepts of this Type to concepts hashmap
          conceptsHashmap[conType]= conCount;
      });
/*      console.log("conceptsHashmap: ");
      for(var con in conceptsHashmap) { console.log(con +": "+ conceptsHashmap[con]); }*/

      // update knetLegend.
      var knetLegend= '<b>Interactive Legend:</b>&nbsp;&nbsp;&nbsp;';
   //   var cnt= 0;
      // Show concept Type icons (with total count displayed alongside).
      for(var con in conceptsHashmap) {
          knetLegend= knetLegend +'<input type="image" id="'+ con +/*'" class="knetLegend_'+ con +*/'" title="Show All '+ con +'(s)" src="html/KnetMaps/image_legend/'+ con +'.png'+'" style="vertical-align:middle" onclick="showConnectedByType(this.id);">'+ conceptsHashmap[con] +'&nbsp;&nbsp;&nbsp;';
        /*  cnt= cnt+1;
          if(cnt%10===0) { knetLegend= knetLegend +'<br/>'; }*/
         }
	$('#knetLegend').html(knetLegend); // update knetLegend
   }

 // OLD
/* function showByType(conType) {
  var cy= $('#cy').cytoscape('get');
//  console.log("ShowByType: "+ conType);
  cy.nodes().forEach(function( ele ) {
      if(ele.data('conceptType') === conType) {
         ele.removeClass('HideEle');
         ele.addClass('ShowItAll');
      //   ele.connectedEdges().connectedNodes().show();
      //   ele.connectedEdges().show();
         showLinks(ele);
        }
    });
  updateKnetStats(); // Refresh network Stats.
 }
*/

 function showConnectedByType(conType) {
  var cy= $('#cy').cytoscape('get');
//  console.log("showConnectedByType: "+ conType);

//  var hiddenNodes_ofSameType= cy.nodes().filter('node[conceptDisplay="none"]').filter('node[conceptType="'+conType+'"]');
  /*hiddenNodes_ofSameType.forEach(function( ele ) { console.log("hiddenNodes_ofSameType: "+ ele.data('conceptType') +": "+ ele.data('value')); });*/

//  var currently_visibleNodes= cy.nodes().filter('node[conceptDisplay="element"]');
  /*currently_visibleNodes.forEach(function( ele ) { console.log("currently_visibleNodes: "+ ele.data('value') +", type: "+ ele.data('conceptType')); });*/

//  console.log("hiddenNodes_ofSameType size: "+ hiddenNodes_ofSameType.size() +", \t currently_visibleNodes size: "+ currently_visibleNodes.size());

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
//  console.log("hiddenNodes_ofSameType size: "+ hiddenNodes_ofSameType.size() +", \t currently_visibleNodes size: "+ currently_visibleNodes.size());

  // Display hidden nodes of same Type which are connected to currently visible Nodes.
  hiddenNodes_ofSameType.edgesWith(currently_visibleNodes).connectedNodes().addClass('ShowEle').removeClass('HideEle');
  // Display edges between such connected Nodes too.
  hiddenNodes_ofSameType.edgesWith(currently_visibleNodes).addClass('ShowEle').removeClass('HideEle');

  updateKnetStats(); // Refresh network Stats.
 }
