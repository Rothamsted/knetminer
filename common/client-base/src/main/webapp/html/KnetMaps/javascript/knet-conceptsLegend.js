var KNETMAPS = KNETMAPS || {};
KNETMAPS.ConceptsLegend = function () {

    var stats = KNETMAPS.Stats();
    var my = function () {};
    my.conName = function (conText) {
        // Map the concept names to corresponding legend context names
        map = {"Biological_Process": "BioProc", "Molecular_Function": "MolFunc",
            "Cellular_Component": "CellComp", "Trait Ontology": "TO",
            "PlantOntologyTerm": "PO", "Enzyme Classification": "EC",
            "Quantitative Trait Locus": "QTL", "Protein Domain": "Domain"};
        result = map[conText];
        // If result is not null, return result, else return conText
        return result != null ? result : conText;
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
            // Get the total number of concepts for that concept 
            var totConCount = conNodes.filterFn(function (ele) {
                return ele.data('conceptType') === conType;
            }).size();
            // Get a collection of all the visible nodes and their length
            var currently_visibleNodes = cy.collection();
            conNodes.filter('node[conceptType="' + conType + '"]').forEach(function (conc) {
                if (conc.hasClass('ShowEle')) {
                    currently_visibleNodes = currently_visibleNodes.add(conc);
                }
            });
            conceptsHashmap[conType] = ($(currently_visibleNodes).length + "/" + totConCount);
        });
        // update knetLegend.
        var knetLegend = '<div class="knetInteractiveLegend"><div class="knetLegend_row">' + '<div class="knetLegend_cell"><b>Interactive Legend:</b></div>';
        // Show concept Type icons (with total count displayed alongside).
        for (var con in conceptsHashmap) {
            var conText = KNETMAPS.ConceptsLegend().conName(con);
            knetLegend = knetLegend + '<div class="knetLegend_cell"><input type="submit" value="" id="' + con + '" title="Show or remove all ' + con.replace(/_/g, ' ') + '(s)" class="knetCon_' + con.replace(/ /g, '_') + '" style="vertical-align:middle" ontouchmove="KNETMAPS.ConceptsLegend().hideConnectedByType(this.id);" ondblclick="KNETMAPS.ConceptsLegend().hideConnectedByType(this.id);" onclick="KNETMAPS.ConceptsLegend().showConnectedByType(this.id);">' +
                    '<span class="icon_caption">' + conceptsHashmap[con] + '<br>' + conText + '</span></div>';
        }
        knetLegend = knetLegend + '</div></div>';
        $('#knetLegend').html(knetLegend); // update knetLegend
    }

    my.nodeClassesOnGraph = function (cy, conType) {
        // Obtain all hidden and currently visible nodes on the graph based upon the class they contain
        var visibleNodes_ofSameType = hiddenNodes_ofSameType = currently_visibleNodes = cy.collection();
        var conText = KNETMAPS.ConceptsLegend().conName(conType);

        // Filter by the type clicked by the user
        cy.nodes().filter('node[conceptType="' + conType + '"]').forEach(function (conc) {
            // If the node has the class tag of "show element" then add it to the collection class
            if (conc.hasClass('ShowEle')) {
                visibleNodes_ofSameType = visibleNodes_ofSameType.add(conc);
            }
            if (conc.hasClass('HideEle')) {
                hiddenNodes_ofSameType = hiddenNodes_ofSameType.add(conc);
            }
        });

        cy.nodes().forEach(function (conc) {
            // Only if the concept is visible
            if (conc.hasClass('ShowEle')) {
                // Add to Cytoscape collection.
                currently_visibleNodes = currently_visibleNodes.add(conc);
            }
        });
        // Obtain all the count of all of the concepts within the graph of this type
        var totConcepts = $(visibleNodes_ofSameType).length + $(hiddenNodes_ofSameType).length;

        return {hiddenNodes: hiddenNodes_ofSameType, visibleNodes: currently_visibleNodes,
            visibleOfSameType: visibleNodes_ofSameType, total: totConcepts, text: conText};
    }

    my.conceptCount = function (cy, conType, conText, totConcepts) {
        // Update the name of the icon with the relevant counts accordingly
        $(document).ready(function () {
            var currentNodes_ofSameType = cy.collection();
            cy.nodes().filter('node[conceptType="' + conType + '"]').forEach(function (conc) {
                if (conc.hasClass('ShowEle')) {
                    currentNodes_ofSameType = currentNodes_ofSameType.add(conc);
                }
            });
            // Update the name with the current nodes / total nodes and the node type name. 
            var nameToUpdate = " " + $(currentNodes_ofSameType).length + '\/' + totConcepts + '<br>' + conText;
            $("span.icon_caption").each(function () {
                if ($(this).text().includes(conText)) {
                    $(this).html(nameToUpdate);
                }
            });
            // If there's no nodes present of the same type then no error message should display anymore. 
            if ($(currentNodes_ofSameType).length === 0) {
                $('#infoDialog').html("");
            }
        });
    }

    my.showConnectedByType = function (conType) {
        // get all cytoscape elements via jQuery 
        var cy = $('#cy').cytoscape('get');
        var collections = KNETMAPS.ConceptsLegend().nodeClassesOnGraph(cy, conType),
                hiddenNodes_ofSameType = collections.hiddenNodes,
                currently_visibleNodes = collections.visibleNodes,
                conText = collections.text,
                totConcepts = collections.total;

        // end here
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
        KNETMAPS.ConceptsLegend().conceptCount(cy, conType, conText, totConcepts); // Update the text count
    }


    my.hideConnectedByType = function (conType) {
        // get all cytoscape elements via jQuery 
        var cy = $('#cy').cytoscape('get');
        // Define the visible nodes of the same type as a Cytoscape collection
        var collections = KNETMAPS.ConceptsLegend().nodeClassesOnGraph(cy, conType),
                visibleNodes_ofSameType = collections.visibleOfSameType,
                currently_visibleNodes = collections.visibleNodes,
                conText = collections.text,
                totConcepts = collections.total;

        var edge_count = $(visibleNodes_ofSameType.edgesWith(currently_visibleNodes)).length; // Obtain the number of edges present
        // Ensure that Gene concepts cannot be removed. 
        if (conText.includes("Gene") == false) {
            // Set the collection of visible nodes to hidden and remove its show class, thus setting the CSS display to None.
            cy.nodes().forEach(function (ele) {
                if (ele.data('conceptType') === conType) {
                    ele.removeClass('ShowEle').addClass('HideEle');
                }
            });
            stats.updateKnetStats(); // Refresh network Stats.
        } else if (conText.includes("Gene")) {
            // Show appropriate error regarding user attempt to remove the Gene concept.
            cy.nodes().forEach(function (ele) {
                if (ele.hasClass('FlaggedGene')) {
                    $('#infoDialog').html('<font color="red">' + "Can't remove  the main Gene Concept node.</font>").show();
                } else if (ele.data('conceptType') == conType) {
                    ele.removeClass('ShowEle').addClass('HideEle');
                    $('#infoDialog').html("");
                    stats.updateKnetStats(); 
                }
            });
        } else if (edge_count > 0 && conText.includes("Gene") == false) {
            $('#infoDialog').html("");
        }

        KNETMAPS.ConceptsLegend().conceptCount(cy, conType, conText, totConcepts); // Update the text count
    }

    return my;
};
