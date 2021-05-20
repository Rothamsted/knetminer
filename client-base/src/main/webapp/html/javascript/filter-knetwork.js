 /*
  * Function to check numberOfNodes in knetwork json's metadata (allGraphData) and if over 3000, delete all nodes/edges 
  * with conceptDisplay:none and relationDisplay:none from graphJson, and also use their pid to remove same from metadata.
  * @returns revised knetwork blob for large knets before launching KnetMaps
  */
 function filterKnetworkJson(json_blob) {
	 
  eval(json_blob); // gets the 2 JS vars from it to be avilable in local scope
  console.dir(graphJSON); // graphJSON
  console.dir(allGraphData); // metadata JSON that hold numberOfCOncepts too
  
  console.dir(graphJSON);
  console.dir(allGraphData);
  console.log("numberOfConcepts= "+ allGraphData.ondexmetadata.numberOfConcepts);
  if(allGraphData.ondexmetadata.numberOfConcepts > 10/*3000*/) {
	 // filter out nodes/edges from graphJSON with conceptDisplay/relationDisplay:none, and keep their pid's to l;ater filter allGraphData
	 // for each node in nodes, check conceptDisplay:none and if yes, delete the node, and if no, retain pid.
	 // for each edge in in edges, check relationDisplay:none and yes, delete the edge and if no, retain pid.
	}
  
  // OLD
  var responseJson=json_blob;
  responseJson= responseJson.replaceAll('\n','').replaceAll('\"','"').replaceAll('\\/','/');
  //responseJson= responseJson.replace('var graphJSON= ','"graphJSON":{"elements":').replace(']};',']},').replace('var allGraphData= ','');
  ////responseJson= responseJson.substr(0,responseJson.length-1) +'}';
  var resp_array= responseJson.split("};");
  resp_array[0]=resp_array[0]+'}';
  console.log(resp_array[0]);
  console.log(resp_array[1]);
  
  // make new blob and reassign back to json_blob
  // TODO
  
  return json_blob;
 }
