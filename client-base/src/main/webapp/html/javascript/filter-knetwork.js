 /*
  * Function to check numberOfNodes in knetwork json's metadata (allGraphData) and if over 3000, delete all nodes/edges 
  * with conceptDisplay:none and relationDisplay:none from graphJson, and also use their pid to remove same from metadata.
  * @returns revised knetwork blob for large knets before launching KnetMaps
  */
 function filterKnetworkJson(json_blob) {
	 
  console.log("knetworkJSON from server..."+ json_blob);
  eval(json_blob); // gets the 2 JS vars from it to be avilable in local scope
  console.dir(graphJSON); // graphJSON
  console.dir(allGraphData); // metadata JSON that hold numberOfCOncepts too
  
  var graphjson2_nodes= [], graphjson2_edges=[], graphJSON2= {}; // 2 empty new jsonArrays and 1 jsonObject
  var retained_ids= [];
  console.log("numberOfConcepts= "+ allGraphData.ondexmetadata.numberOfConcepts);
  if(allGraphData.ondexmetadata.numberOfConcepts > 100/*3000*/) {
	 console.log("filter knetwork json...");
	 // filter out nodes/edges from graphJSON with conceptDisplay/relationDisplay:none, and keep their id's to later filter allGraphData too.
	 // for each node in nodes, check conceptDisplay:none and if yes, delete the node, and if no, retain id.
	 // for each edge in in edges, check relationDisplay:none and yes, delete the edge and if no, retain id.
	 for(var i=0; i < graphJSON.nodes.length; i++) {
		 if(graphJSON.nodes[i].data.conceptDisplay === "element") {
			graphjson2_nodes.push(graphJSON.nodes[i]); // insert node in new jsonArray
			retained_ids.push(graphJSON.nodes[i].data.id); // retain ID
		   }
		}
	 for(var j=0; j < graphJSON.edges.length; j++) {
		 if(graphJSON.edges[j].data.relationDisplay === "element") {
			graphjson2_edges.push(graphJSON.edges[j]); // insert edge in new jsonArray
			retained_ids.push(graphJSON.edges[j].data.id); // retain ID
		   } 
	    }
	 // make new graphJSON object with only visible nodes/edges.
	 graphJSON2= {"nodes": graphjson2_nodes, "edges": graphjson2_edges };
	 
	 console.log("retained_ids to filter allGraphData: "+ retained_ids);
	 
	 // now filter metadata json (allGraphData).
	 var allGraphData2= {}, omd= {}, agd2_nodes=[], agd2_edges= []; // 3 empty new jsonArrays and 1 jsonObject
	 for(var k=0; k < allGraphData.ondexmetadata.concepts.length; k++) {
		 if(retained_ids.includes(allGraphData.ondexmetadata.concepts[k].id)) { // insert concept in new jsonArray
		    agd2_nodes.push(allGraphData.ondexmetadata.concepts[k]);
		   }
		}
	 for(var l=0; l < allGraphData.ondexmetadata.relations.length; l++) {
		 if(retained_ids.includes(allGraphData.ondexmetadata.relations[l].id)) { // insert relation in new jsonArray
		    agd2_edges.push(allGraphData.ondexmetadata.relations[l]);
		   }
		}
	 // make new allGraphData object with only visible nodes/edges metadata.
	 omd= {"graphName": allGraphData.ondexmetadata.graphName, "concepts": agd2_nodes, "relations": agd2_edges, "numberOfConcepts": allGraphData.ondexmetadata.numberOfConcepts, "numberOfRelations": allGraphData.ondexmetadata.numberOfRelations, "version": allGraphData.ondexmetadata.version };
	 allGraphData2= {"ondexmetadata": omd};
	 
	 console.log("filtered new knetworkJSON...");
	 console.dir(graphJSON2);
	 console.dir(allGraphData2);
	 // new filtered output knetwork blob
     json_blob= "var graphJSON= "+ JSON.stringify(graphJSON2) +";\n\n"+"var allGraphData= "+ JSON.stringify(allGraphData2) +";";
     console.log(json_blob); // new json contents with nested JS vars
	}
    
    return json_blob;
 };