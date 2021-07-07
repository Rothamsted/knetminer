/* 
 * Utils to extract visible genes information from the rendered kNetwork in KnetMaps (Network View) and create a table to download to user PC.
 * Authors: singha
 */

/* function to download visible genes from knetwork in knetmaps (cyJS) to user device. */
 function exportKnetworkTable(networkId/*, metadata_json*/) {
   var dlTable= "gene_id\tgene_name\tseed\ttaxid\n";
   //console.log("exportKnetworkTable...");
   
   var cy= $('#cy').cytoscape('get'); // now we have a global reference to `cy`
   var metadata_json= allGraphData;//global
   //console.dir(metadata_json);
   
   var elements= cy.nodes();
   elements.forEach(function( ele ) {
       // fetch all visble genes
       if((ele.data('conceptType') === 'Gene') && (ele.data('conceptDisplay') === 'element')) {
          var this_conID= ele.data('id');
          var this_name= ele.data('displayValue'); // node label
          var this_id= ele.data('displayValue'); // default (to be changed by coaccessions later)
          var this_seed= "no"; // check flagged attribute of this node
          if(ele.data('flagged') === "true") { this_seed="yes"; }
          else { this_seed="no"; }
          var this_taxid= "";
          var this_accessions= [];
          // Get all metadata for this gene concept ID from the metadataJSON.
          for(var i=0; i<metadata_json.ondexmetadata.concepts.length;i++) {
              // if matching concept ID found
              if(this_conID === metadata_json.ondexmetadata.concepts[i].id) {
                 // traverse attributes to get TAXID
                 for(var j=0; j<metadata_json.ondexmetadata.concepts[i].attributes.length; j++) {
                     if((metadata_json.ondexmetadata.concepts[i].attributes[j].attrname === "TAXID") || (metadata_json.ondexmetadata.concepts[i].attributes[j].attrnameName === "TX")) {
                         this_taxid= metadata_json.ondexmetadata.concepts[i].attributes[j].value;
                        }
                    }
                 // traverse coaccessions to get shortest gene name from ENSEMBL or TAIR
                 for(var k=0; k<metadata_json.ondexmetadata.concepts[i].coaccessions.length; k++) {
                     if((metadata_json.ondexmetadata.concepts[i].coaccessions[k].elementOf === "ENSEMBL") || (metadata_json.ondexmetadata.concepts[i].coaccessions[k].elementOf === "TAIR")) {
                        this_accessions.push(metadata_json.ondexmetadata.concepts[i].coaccessions[k].accession);
                       }
                    }
                  // get shortest accession now via sorting this_accessions by ascending order of length
                  //console.dir(this_accessions);
                  this_accessions.sort(function(a, b){return a.length - b.length});
                  this_id= this_accessions[0]; // set gene id as shortest coaccession
                }
             }
             
          // add line to table
          dlTable= dlTable + this_id +'\t'+ this_name +'\t'+ this_seed +'\t'+ this_taxid +'\n';
         }
    });

   // allow dlTable download to PC using a hiddenElement, download and click event.
   var utf8Bytes = "";
   utf8Bytes = encodeURIComponent(dlTable).replace(/%([0-9A-F]{2})/g, function(match, p1) {
       return String.fromCharCode('0x' + p1);
      });
   //<a download="knetmaps_genes.tsv" href="data:application/octet-stream;base64,' + btoa(utf8Bytes) + '" target="_blank">Download as TAB delimited file</a>
   var hiddenElement= document.createElement('a');
   hiddenElement.href= 'data:application/octet-stream;base64,' + btoa(utf8Bytes);
   hiddenElement.target= '_blank';
   hiddenElement.download= 'knetmaps_genes.tsv';
   hiddenElement.click();
  }
