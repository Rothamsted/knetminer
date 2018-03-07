function onHover(thisBtn) {
	 var img= $(thisBtn).attr('src');
//    $("#"+img).attr('src', 'image/'+img+'_hover.png');
    $(thisBtn).attr('src', img.replace('.png','_hover.png'));
 }

 function offHover(thisBtn) {
	 var img= $(thisBtn).attr('src');
//    $("#"+img).attr('src', 'image/'+img+'.png');
    $(thisBtn).attr('src', img.replace('_hover.png','.png'));
 }

 function popupItemInfo() {
 openItemInfoPane();
 showItemInfo(this);
}

   // Go to Help docs.
  function openKnetHelpPage() {
   var helpURL = 'https://github.com/Rothamsted/knetmaps.js/wiki/KnetMaps.js';
   window.open(helpURL, '_blank');
  }

  // Reset: Re-position the network graph.
  function resetGraph() {
   $('#cy').cytoscape('get').reset().fit(); // reset the graph's zooming & panning properties.
  }
  
 // Export the graph as a JSON object in a new Tab and allow users to save it.
  function exportAsJson() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

   var exportJson= cy.json(); // get JSON object for the network graph.

   // Display in a new blank browser tab, e.g, window.open().document.write("text"); // for text data
//   window.open('data:application/json;' + (window.btoa?'base64,'+btoa(JSON.stringify(exportJson)):JSON.stringify(exportJson))); // for JSON data

   // use FileSaver.js to save using file downloader
 //  var kNet_json_Blob= new Blob([JSON.stringify(exportJson)], {type: "text/plain;charset=utf-8"});
 //  saveAs(kNet_json_Blob, "kNetwork.cyjs.json");
   var kNet_json= new File([JSON.stringify(exportJson)], "kNetwork.cyjs.json", {type: "text/plain;charset=utf-8"});
   saveAs(kNet_json);
  }
  
  // Export the graph as a .png image and allow users to save it.
  function exportAsImage() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`

   // Export as .png image
   var png64= cy.png(); // .setAttribute('crossOrigin', 'anonymous');

   // Display the exported image in a new window.
   //window.open(png64, 'Image', 'width=1200px,height=600px,resizable=1'); // Blocked on some browsers

   // use FileSaver.js to save using file downloader; fails (creates corrupted png)
   /*cy_image= new Image();
   cy_image.src= png64;
   var knet_canvas= document.getElementById('cy'); // use canvas
   knet_context= knet_canvas.getContext('2d');
   knet_context.drawImage(cy_image, 0,0); // draw image on canvas
   // convert canvas to Blob & save using FileSaver.js.
   knet_canvas.toBlob(function(blob) {
     saveAs(knet_blob, "kNetwork.png");
     }, "image/png");*/

   // Use IFrame to open png image in a new browser tab
   var cy_width= $('#cy').width();
   var cy_height= $('#cy').height();
   var knet_iframe_style= "border:1px solid black; top:0px; left:0px; bottom:0px; right:0px; width:"+ cy_width +"; height:"+ cy_height +";";
   var knet_iframe = '<iframe src="'+ png64 +'" frameborder="0" style="'+ knet_iframe_style +'" allowfullscreen></iframe>';
   var pngTab= window.open();
   pngTab.document.open();
   pngTab.document.write(knet_iframe);
   pngTab.document.title="kNetwork_png";
   pngTab.document.close();
  }

  // Remove hidden effect from nodes/ edges, if hidden.
/*  function removeHiddenEffect(ele) {
    var thisElement= ele;
    try {
      if(thisElement.hasClass('HideEle')) {
         thisElement.removeClass('HideEle');
        }
     }
    catch(err) {
          console.log("Error occurred while unhiding concepts/ relations. \n"+"Error Details: "+ err.stack);
         }
  }*/

  // Show all concepts & relations.
  function showAll() {
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
//   cy.elements('node').show(); // show all nodes using eles.show().
//   cy.elements('edge').show(); // show all edges using eles.show().
   cy.elements().removeClass('HideEle');
   cy.elements().addClass('ShowEle');

   // Relayout the graph.
   rerunLayout();

   // Remove shadows around nodes, if any.
   cy.nodes().forEach(function( ele ) {
       removeNodeBlur(ele);
      });

   // Refresh network legend.
   updateKnetStats();
  }
  
  // Re-run the entire graph's layout.
  function rerunLayout() {
   //console.log("rerunLayout...");
   // Get the cytoscape instance as a Javascript object from JQuery.
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
   var selected_elements= cy.$(':visible'); // get only the visible elements.

   // Re-run the graph's layout, but only on the visible elements.
   rerunGraphLayout(selected_elements);
   
   // Reset the graph/ viewport.
   resetGraph();
  }

  // Re-run the graph's layout, but only on the visible elements.
  function rerunGraphLayout(eles) {
   //  var ld= document.getElementById("layouts_dropdown");
   var ld_selected= /*ld.options[ld.selectedIndex].value*/$('#layouts_dropdown').val();
   //console.log("layouts_dropdown selectedOption: "+ ld_selected)
   if(ld_selected === "circle_layout") {
           setCircleLayout(eles);
          }
   else if(ld_selected === "cose_layout") {
           setCoseLayout(eles);
          }
   else if(ld_selected === "coseBilkent_layout") {
           setCoseBilkentLayout(eles);
          }
   else if(ld_selected === "concentric_layout") {
           setConcentricLayout(eles);
          }
   else if(ld_selected === "ngraph_force_layout") {
           setNgraphForceLayout(eles);
          }
   else if(ld_selected === "euler_layout") {
           setEulerLayout(eles);
          }
   else if(ld_selected === "random_layout") {
           setRandomLayout(eles);
          }
   //console.log("Re-run layout complete...");
  }

  // Update the label font size for all the concepts and relations.
  function changeLabelFontSize(new_size) {
   try {
     var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
     console.log("changeLabelFontSize>> new_size: "+ new_size);
     cy.style().selector('node').css({ 'font-size': new_size }).update();
     cy.style().selector('edge').css({ 'font-size': new_size }).update();
    }
   catch(err) {
          console.log("Error occurred while altering label font size. \n"+"Error Details: "+ err.stack);
         }
  }

  // Show/ Hide labels for concepts and relations.
  function showHideLabels(val) {
   //console.log("cy.hideLabelsOnViewport= "+ $('#cy').cytoscape('get').hideLabelsOnViewport);
   if(val === "Concepts") {
      displayConceptLabels();
     }
   else if(val === "Relations") {
      displayRelationLabels();
     }
   else if(val === "Both") {
      displayConRelLabels();
     }
   else if(val === "None") {
      hideConRelLabels();
     }
  }

  // Show node labels.
  function displayConceptLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
//   cy.nodes().style({'text-opacity': '1'});
//   cy.edges().style({'text-opacity': '0'});
   cy.nodes().removeClass("LabelOff").addClass("LabelOn");
   cy.edges().removeClass("LabelOn").addClass("LabelOff");
  }

  // Show edge labels.
  function displayRelationLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
//   cy.nodes().style({'text-opacity': '0'});
//   cy.edges().style({'text-opacity': '1'});
   cy.nodes().removeClass("LabelOn").addClass("LabelOff");
   cy.edges().removeClass("LabelOff").addClass("LabelOn");
  }

  // Show node & edge labels.
  function displayConRelLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
//   cy.nodes().style({'text-opacity': '1'});
//   cy.edges().style({'text-opacity': '1'});
   cy.nodes().removeClass("LabelOff").addClass("LabelOn");
   cy.edges().removeClass("LabelOff").addClass("LabelOn");
  }

  // Show node labels.
  function hideConRelLabels() {
   var cy= $('#cy').cytoscape('get'); // reference to `cy`
//   cy.nodes().style({'text-opacity': '0'});
//   cy.edges().style({'text-opacity': '0'});
   cy.nodes().removeClass("LabelOn").addClass("LabelOff");
   cy.edges().removeClass("LabelOn").addClass("LabelOff");
  }
