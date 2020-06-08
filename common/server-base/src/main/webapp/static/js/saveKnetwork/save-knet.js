/* 
 * Utils to extract the rendered kNetwork in KnetMaps (Network View), fetch back-end API summary/metadata and upload/save to knetspace via API.
 * Authors: singha, hearnshawj
 */

/* Function to save knetwork rendered in knetmaps (cyJS) to knetspace via POST. */
 function exportAsJson(networkId, requestParams) {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

   var exportJson= cy.json(); // full graphJSON
   
   var exportedJson= filterJsonToExport(cy, exportJson); // the final "graph" to export
   var thumbnail_image= exportThumbnail(cy); // fetch knetwork thumbnail as well.
   // fetch total node & edge count for this knetwork.
   var totalNodes= cy.$(':visible').nodes().size();
   var totalEdges= cy.$(':visible').edges().size();
   // formatted date: yyyy-mm-dd hh:mm (mm: January=0)
   var currentDate= new Date();
   var knet_date= currentDate.getFullYear() +'-'+ String(currentDate.getMonth() + 1).padStart(2, '0') +'-'+ String(currentDate.getDate()).padStart(2, '0') 
           +' '+ currentDate.getHours() +':'+ ('0'+currentDate.getMinutes()).slice(-2);
   
   console.log("knet-save.js: networkId= "+ networkId); // test
   var knet_name= "knetwork", apiGraphSummary= null;
   if(networkId === null) { // for a new knetwork, fetch graphSummary from KnetMiner server API.
      //console.log("fetch graphSummary from KnetMiner server API..."); // test
      apiGraphSummary= getGraphDBSummary();
     }

   // add api_graphSummary to the above as well, if exists.
   var speciesTaxid= null, speciesName= null, dbVersion= null, dbDateCreated= null, sourceOrganization= null, provider= null;
   if(apiGraphSummary !== null && apiGraphSummary.size > 0) {
      speciesTaxid= apiGraphSummary.get("speciesTaxid");
      speciesName= apiGraphSummary.get("speciesName");
      dbVersion= apiGraphSummary.get("dbVersion");
      dbDateCreated= apiGraphSummary.get("dbDateCreated");
      sourceOrganization= apiGraphSummary.get("sourceOrganization");
      provider= apiGraphSummary.get("provider");
      //console.log(speciesTaxid +","+ speciesName +","+ dbVersion +","+ dbDateCreated +","+ sourceOrganization +","+ provider); // test
     }

   // get keyword and gene list too (if found) to save.
   var keywords= null, gene_list= null;
   if(requestParams !== null) { // for a new knetwork, fetch graphSummary from KnetMiner server API.
      gene_list= JSON.stringify(requestParams.list);
      if(requestParams.keyword !== null) { keywords= requestParams.keyword; }
     // console.log("gene_list: "+ gene_list +", keywords: "+ keywords); // test
     }
   
   // default knetName & knetDesc for modal (jBox)
   var knetName= knet_name;
   var knetDesc= knetName;
   
   // POST to knetspace via /api/v1/networks/
  // var knetspace_api_host= "http://babvs72.rothamsted.ac.uk:8000"; //or "http://localhost:8000";
   var knetspace_api_host; // relative domain
   getKsAPI().then(function(ksAddress) { 
       knetspace_api_host = ksAddress;
      // console.log("fetched knetspace_api_host: "+ knetspace_api_host); // test
    });
    isLoggedIn().then(function (bool) {
        if (bool) {
            if (networkId === null) {
                //if(typeof api_url !== "undefined") { // if it's within knetminer (DISABLED: as it breaks genepage api)
                userPlan().then(function (userBool) {
                    if (!userBool) {
                        // jBox modal to let users enter knetName & knetDesc and save when POSTing a new kNetwork.
                        var uploadHtml = "<form class='form' method='post' action='#'>"
                                + "<label><font size='4'>Knetwork name</font></label>" + "<p></p>"
                                + "<input style='height:20px;width:450px;' maxlength='30' placeholder="+knet_name+" type='text' name='knetName' id='kNetName'>" + "<p></p>"
                                + "<label><font size='4'>Description</font></label>" + "<p></p>"
                                + "<textarea style='height:100px;width:450px;' placeholder='Enter your description here...' name='knetDesc' id='knetDescription'></textarea>" + "<p></p>"
                                + "<div style='display:flex;'><label id='priv-lab'><font size='3'><b>Private:</b></font></label>"
                                + "<label class='switch'>"
                                + "<input type='checkbox' id='privateCheck'>"
                                + "<span class='slider round'></span></label></div>" + "<p></p>"
                                + "<input type='button' name='KnetSubmit' id='KnetSubmit' value='Save'>" + "</form>";
                    } else {
                            var uploadHtml = "<form class='form' method='post' action='#'>"
                                + "<label><font size='4'>Knetwork name</font></label>" + "<p></p>"
                                + "<input style='height:20px;width:450px;' maxlength='30' placeholder="+knet_name+" type='text' name='knetName' id='kNetName'>" + "<p></p>"
                                + "<label><font size='4'>Description</font></label>" + "<p></p>"
                                + "<textarea style='height:100px;width:450px;' placeholder='Enter your description here...' name='knetDesc' id='knetDescription'></textarea>" + "<p></p>"
                                + "<div style='display:flex;'><label id='priv-lab'><font size='3'><b>Private:</b></font></label>"
                                + "<label class='switch-off'>"
                                + "<input type='checkbox' id='privateCheck'>"
                                + "<span class='slider-off round'></span></label></div>" + "<p></p>"
                                + "<input type='button' name='KnetSubmit' id='KnetSubmit' value='Save'>" + "</form>";
                    }

                var uploadModal = new jBox('Modal', {
                    title: '<font size="5"><font color="white">Save to </font><font color="#51CE7B">Knet</font><font size="5"><font color="white">Space</font>',
                    animation: 'pulse', content: uploadHtml, width: 500, cancelButton: 'Exit', draggable: 'title', 
                    position: {x: 'center', y: 'top'}, offset: {x: 0, y: 150}, delayOpen: 50
                });
                uploadModal.open(); // open
                if (userBool) { 
                    new jBox('Tooltip', {
                        attach: '#priv-lab', 
                        pointer: 'center', 
                        content: "This Knetwork is visible to others. Upgrade to a Pro plan to have private Knetworks."
                    });
                } else {
                    new jBox('Tooltip', {
                        attach: '#priv-lab', 
                        pointer: 'center', 
                        content: "Turn this toggle on to make this Knetwork private"
                    });
                }
                
                
                $('#KnetSubmit').on('keypress click', function (e) {
                    if (e.which === 13 || e.type === 'click') {
                        //console.log("user inputs: "+ $('input[name=knetName]').val() +", "+ $('textarea#knetDescription').val());
                        if ($('input[name=knetName]').val()) {
                            knetName = $('input[name=knetName]').val();
                        } else {
                            knetName = knet_name;
                        }

                        if ($('textarea#knetDescription').val()) {
                            knetDesc = $.trim($('textarea#knetDescription').val());
                        } else {
                            knetDesc = "Network for " + knetName;
                        }
                        if (!userBool) {
                            var privateBool = document.getElementById('privateCheck').checked;
                            if(privateBool === true) {privateBool = false;} else {privateBool = true;}
                        } else {
                            var privateBool = true;
                        }   
                        console.log("Public Knetwork? : " + privateBool);
                        // console.log("from user: knetName: "+ knetName + ", desc: "+ knetDesc); // test

                        // POST a new knetwork to knetspace with name, date_created, apiGraphSummary fields plus this graph, image, numNodes, numEdges.
                        var post_json = JSON.stringify({name: knetName, dateCreated: knet_date, numNodes: totalNodes, numEdges: totalEdges, graph: JSON.parse(exportedJson),
                            image: thumbnail_image, speciesTaxid: speciesTaxid, speciesName: speciesName, dbVersion: dbVersion, dbDateCreated: dbDateCreated,
                            sourceOrganization: sourceOrganization, provider: provider, description: knetDesc, gene: gene_list, keyword: keywords, is_public: privateBool });
                        if (keywords === null || keywords === "") { // for non-keyword search
                            post_json = JSON.stringify({name: knetName, dateCreated: knet_date, numNodes: totalNodes, numEdges: totalEdges, graph: JSON.parse(exportedJson),
                                image: thumbnail_image, speciesTaxid: speciesTaxid, speciesName: speciesName, dbVersion: dbVersion, dbDateCreated: dbDateCreated,
                                sourceOrganization: sourceOrganization, provider: provider, description: knetDesc, gene: gene_list, is_public: privateBool});
                        }

                        $.ajax({
                            type: 'POST',
                            url: knetspace_api_host + '/api/v1/networks/',
                            timeout: 1000000,
                            xhrFields: {withCredentials: true},
                            headers: {
                                "Accept": "application/json; charset=utf-8",
                                "Content-Type": "application/json; charset=utf-8"
                            },
                            datatype: "json",
                            data: post_json,
                            beforeSend: function() {
                                jboxNotice("Saving to KnetSpace...", 'blue', 60, 1000);
                            }
                        }).fail(function (errorlog) {
                            $('#overlay').fadeOut();
                            if(JSON.stringify(errorlog.responseText).includes("quota")) {
                                uploadModal.toggle();
                                var failedMsgQ = "You've exceeded your KnetSpace Knetwork quota!<br><br>" + "<a href='" + knetspace_api_host + "/checkout/' target='_blank' style='color:white;' class='profileClass'><b>Click here to buy more Knetworks.</b></a>";
                                jboxNotice(failedMsgQ, 'red', 60, 15000);
                            } else {
                                uploadModal.toggle();
                                var failedMsg = "Failed to upload kNetwork " + knetName;
                                jboxNotice(failedMsg, 'red', 60, 2500);
                                console.log("POST error: " + JSON.stringify(errorlog));
                            }
                        }).success(function (data) {
                            $('#overlay').fadeOut();
                            uploadModal.toggle();
                            var netContentSuccess = "Successfully saved!<br><br>" + "<a href='" + knetspace_api_host + "/network' target='_blank' style='color:white;' class='profileClass'><b>View it in KnetSpace</b></a>";
                            jboxNotice(netContentSuccess, 'blue', 60, 15000);
                        });
                        // jBox modal - tasks completed.
                        uploadModal.destroy(); // destroy jBox modal when done
                    }
                });
            });
                //}
            } else { // PATCH existing networkId with updated graph, image, numNodes, numEdges, dateModified.
                var patch_json = JSON.stringify({dateModified: knet_date, numNodes: totalNodes, numEdges: totalEdges,
                    graph: JSON.parse(exportedJson), image: thumbnail_image});
                $.ajax({
                    type: 'PATCH',
                    url: knetspace_api_host + '/api/v1/networks/' + networkId + '/',
                    timeout: 1000000,
                    xhrFields: {withCredentials: true},
                    headers: {
                        "Accept": "application/json; charset=utf-8",
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    datatype: "json",
                    data: patch_json,
                    beforeSend: function () {
                        jboxNotice("Sending Knetwork to KnetSpace...", 'blue', 60, 1000);
                    }
                })
                        .fail(function (errorlog) {
                            $('#overlay').fadeOut();
                            uploadModal.toggle();
                            var failedMsg = "Failed to upload kNetwork " + knetName;
                            jboxNotice(failedMsg, 'red', 60, 1000);
                            console.log("PATCH error: " + JSON.stringify(errorlog));
                        })
                        .success(function (data) {
                            $('#overlay').fadeOut();
                            uploadModal.toggle();
                            var netContentSuccess = "Network " + knetName + " submitted!<br><br>" + "<a href='" + knetspace_api_host + "/network' target='_blank' style='color:white;' class='profileClass'><b>View it in KnetSpace</b></a>";
                            jboxNotice(netContentSuccess, 'blue', 60, 15000);
                            //console.log("PATCH response: " + data);
                        });
            }

        } else {
            //jboxNotice("You're not logged in! Please log in!", 'red', 60, 1000)
            $('#loginBox').remove();
            loginModalInit();
        }
    });
};
  
 // generate pure JSON to export from KnetMaps for graphJSON and metadata
 function filterJsonToExport(cy, exportJson) {
   var elesToRetain= []; // to streamline content exported in exportJson (graphJSON) & metaJSON (allGraphData).
   cy.$(':visible').forEach(function (ele) { elesToRetain.push(ele.id()); });
   
   // remove hidden nodes/edges metadata from exportJson.
   exportJson.elements.nodes= exportJson.elements.nodes.filter( function( con ) {
	   return elesToRetain.includes(con.data.id); });
   exportJson.elements.edges= exportJson.elements.edges.filter( function( rel ) {
	   return elesToRetain.includes(rel.data.id); });
   
   // remove hidden nodes/edges metadata from metaJSON (allGraphData).
   var metaJSON= allGraphData; // differs from knetspace/knetmaps
   metaJSON.ondexmetadata.concepts= metaJSON.ondexmetadata.concepts.filter( function( con ) {
	   return elesToRetain.includes(con.id); });
   metaJSON.ondexmetadata.relations= metaJSON.ondexmetadata.relations.filter( function( rel ) {
	   return elesToRetain.includes(rel.id); });
   // remove other redundant metaJSON entries.
   var omit_redundant= ["graphName","numberOfConcepts","numberOfRelations","version"];
   omit_redundant.forEach(function (entry) { delete metaJSON.ondexmetadata[entry]; });
   
   var json_response= '{"graphJSON":'+ JSON.stringify(exportJson) + ', "allGraphData":' + JSON.stringify(metaJSON) +'}';
   return json_response;
  }
  
 // fetch graphSummary from KnetMiner server API.
 function getGraphDBSummary() {
   var graphSummary= new Map();
   if(typeof api_url !== "undefined") {
        $.ajax({
            async: false,
            type: 'GET',
            url: api_url + '/dataSource',
            success: function (data) {
                var api_response= data.dataSource.replace(/\"/g,"").trim().split(",");
                api_response.forEach(function(val) {
                    var values= val.split(":");
                    var k= values[0].trim();
                    var v= values[1].trim();
                    if(k === "dbDateCreated") { v= values[1] +":"+ values[2]; }
                    graphSummary.set(k, v);
                });
           }
       });
     }
    return graphSummary;
  }
  
  // Export the network thumbnail.
  function exportThumbnail(cy) {
   var png64 = cy.png({ "scale" : 2.0 /*0.8*/, "output" : 'base64'}); // .setAttribute('crossOrigin', 'anonymous');
                
   return png64.replace("data:image/png;base64,", "");
  }
