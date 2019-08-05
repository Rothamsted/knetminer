var KNETMAPS = KNETMAPS || {};

KNETMAPS.ConceptsLegend = function () {

    var stats = KNETMAPS.Stats();


    var my = function () {};


    my.conName = function (conText) {

        if (conText === "Biological_Process") {
            conText = "BioProc";
        } else if (conText === "Molecular_Function") {
            conText = "MolFunc";
        } else if (conText === "Cellular_Component") {
            conText = "CellComp";
        } else if (conText === "Trait Ontology") {
            conText = "TO";
        } else if (conText === "PlantOntologyTerm") {
            conText = "PO";
        }
        /*else if(conText === "Trait") {
         conText= "GWAS";
         }*/
        else if (conText === "Enzyme Classification") {
            conText = "EC";
        } else if (conText === "Quantitative Trait Locus") {
            conText = "QTL";
        } else if (conText === "Protein Domain") {
            conText = "Domain";
        }
        return conText;
    }

    // Dynamically populate interactive concept legend.
    my.populateConceptLegend = function () {
        var cy = $('#cy').cytoscape('get');
        var conNodes = cy.nodes();
        var conceptTypes = []; // get a unique Array with all concept Types in current network.
        conNodes.forEach(function (ele) {
            if (conceptTypes.indexOf(ele.data('conceptType')) === -1) {
                conceptTypes.push(ele.data('conceptType'));
            }
        });
//      conceptTypes.sort(); // sort alpabetically, fails as "Trait" is displayed as "GWAS"

        var conceptsHashmap = {};
        conceptTypes.forEach(function (conType, index) {
            var conCount = conNodes.filterFn(function (ele) {
                return ele.data('conceptType') === conType;
            }).size();
            // Push count of concepts of this Type to concepts hashmap
            conceptsHashmap[conType] = conCount;
        });

        // update knetLegend.
        var knetLegend = '<div class="knetInteractiveLegend"><div class="knetLegend_row">' + '<div class="knetLegend_cell"><b>Interactive Legend:</b></div>';
        // Show concept Type icons (with total count displayed alongside).
        for (var con in conceptsHashmap) {
            var conText = KNETMAPS.ConceptsLegend().conName(con);
            knetLegend = knetLegend + '<div class="knetLegend_cell"><input type="submit" value="" id="' + con + '" title="Show or remove all ' + con.replace(/_/g, ' ') + '(s)" class="knetCon_' + con.replace(/ /g, '_') + '" style="vertical-align:middle" ontouchmove="KNETMAPS.ConceptsLegend().hideConnectedByType(this.id);" ondblclick="KNETMAPS.ConceptsLegend().hideConnectedByType(this.id);" onclick="KNETMAPS.ConceptsLegend().showConnectedByType(this.id);">' +
                    conceptsHashmap[con] + '<span class="icon_caption">' + conText + '</span></div>';
        }
        knetLegend = knetLegend + '</div></div>';
        $('#knetLegend').html(knetLegend); // update knetLegend
    }


    my.showConnectedByType = function (conType) {
        // get all cytoscape elements via jQuery 
        var cy = $('#cy').cytoscape('get');

        var hiddenNodes_ofSameType = cy.collection();
        // Get the nodes by concept type collection & iterate through them  and if concept is class 'HideEle', add the hiddenNodes collection.
        cy.nodes().filter('node[conceptType="' + conType + '"]').forEach(function (conc) {
            if (conc.hasClass('HideEle')) {
                hiddenNodes_ofSameType = hiddenNodes_ofSameType.add(conc);
            }
        });

        var currently_visibleNodes = cy.collection();
        cy.nodes().forEach(function (conc) {
            if (conc.hasClass('ShowEle')) {
                currently_visibleNodes = currently_visibleNodes.add(conc);
            }
        });

        var conText = KNETMAPS.ConceptsLegend().conName(conType);
        var edge_count = $(hiddenNodes_ofSameType.edgesWith(currently_visibleNodes)).length;
        if (edge_count > 0) {
            // Display hidden nodes of same Type which are connected to currently visible Nodes.
            hiddenNodes_ofSameType.edgesWith(currently_visibleNodes).connectedNodes().addClass('ShowEle').removeClass('HideEle');
            // Display edges between such connected Nodes too.
            hiddenNodes_ofSameType.edgesWith(currently_visibleNodes).addClass('ShowEle').removeClass('HideEle');
        } else {
            $('#infoDialog').html('<font color="red">' + "Can't show more  " + conText + " concept nodes. Please check your graph.</font>").show();
        }

        stats.updateKnetStats(); // Refresh network Stats.

        $(document).ready(function () {
            $("span.icon_caption").each(function () {
                if ($(this).text() === conText) {
                    return $(this).css({'color': '#2A2A2A', "font-weight": "normal"});
                }
            });
        });

    }

    my.hideConnectedByType = function (conType) {
        // get all cytoscape elements via jQuery 
        var cy = $('#cy').cytoscape('get');

        // Define the visible nodes of the same type as a Cytoscape collection
        var visibleNodes_ofSameType = cy.collection();
        // Filter by the type clicked by the user
        cy.nodes().filter('node[conceptType="' + conType + '"]').forEach(function (conc) {
            // If the node has the class tag of "show element" then add it to the collection class
            if (conc.hasClass('ShowEle')) {
                visibleNodes_ofSameType = visibleNodes_ofSameType.add(conc);
            }
        });

        // Define a collection of nodes currently visible on the graph
        var currently_visibleNodes = cy.collection();
        cy.nodes().forEach(function (conc) {
            // Only if the concept is visible
            if (conc.hasClass('ShowEle')) {
                // Add to Cytoscape collection.
                currently_visibleNodes = currently_visibleNodes.add(conc);
            }
        });

        // Set the collection of visible nodes to hidden and remove its show class, thus setting the CSS display to None.
        visibleNodes_ofSameType.addClass('HideEle').removeClass('ShowEle');
        // Repeat the same for the edges of the nodes; set their display to None. 
        visibleNodes_ofSameType.edgesWith(currently_visibleNodes).addClass('HideEle').removeClass('ShowEle');

        stats.updateKnetStats(); // Refresh network Stats.
        var conText = KNETMAPS.ConceptsLegend().conName(conType);
        $(document).ready(function () {
            $("span.icon_caption").each(function () {
                if ($(this).text() === conText) {
                    return $(this).css({'color': 'red', "font-weight": "bold"});
                }
            });
        });
        var edge_count = $(visibleNodes_ofSameType.edgesWith(currently_visibleNodes)).length;
        if (edge_count > 0) {
            $('#infoDialog').html("");
        }
    }

    return my;
};
