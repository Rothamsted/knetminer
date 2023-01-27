
/*
 * Function gets release note data title and version number from /dataset-info api call. 
 */
async function getDatasetDetails() {
    var dbUrl = api_url + "/dataset-info";
    var datasetApiCall = await fetch(dbUrl)
    if (!datasetApiCall.ok) {
        throw new Error(datasetApiCall.status)
    }
    var dataset = await datasetApiCall.json();
    return dataset;
}

/*
 * Function to read .tab file containing stats about the knowledge network & its mappings & to update 
 * them in the release.html webpage.
 */

async function fetchStats() {
    var dataset = await getDatasetDetails().catch(error => { console.log(error.message) }),
        datasetVersion = dataset['version'],
        datasetTitle = dataset['title'],
        datasetDescription = dataset['description'];


    $.get(api_url + "/dataset-info/network-stats")
        .done(function (data) {

            var releaseData = JSON.parse(data);
            var graphSummaries = releaseData.graphSummaries
            var semanticMotifStats = releaseData.semanticMotifStats;
            var graphStats = releaseData.graphStats;

            var graphStatsTotalValue = graphStats.conceptClassTotals
            var graphStatsTotalValueArray = convertObjectToArray(graphStatsTotalValue);
            var graphstatsConceptValue = convertObjectToArray(graphStats.conceptsPerGene);
            var avgRelationsPerConcept = convertObjectToArray(graphStats.avgRelationsPerConcept);

            var totalGenes = graphSummaries.totalGenes
            var totalConcepts = graphSummaries.totalConcepts
            var totalRelations = graphSummaries.totalRelations

            var geneEvidenceConcepts = semanticMotifStats.totalEvidenceConcepts
            var minValues = semanticMotifStats.minConceptsPerGene
            var maxValues = semanticMotifStats.maxConceptsPerGene
            var avgValues = semanticMotifStats.avgConceptsPerGene

            // calculate concept occurrence percentage.
            var conceptPercentage = (geneEvidenceConcepts / (totalConcepts - totalGenes)) * 100;
            conceptPercentage = conceptPercentage.toFixed(2);

            // Display stats data.
            var statsText = "<br/><ul><li>KnetMiner KG version: " + datasetVersion + "</li>" +
                "<li>Number of genes: " + totalGenes + "</li>" +
                "<li>Total concepts: <strong>" + totalConcepts + "</strong></li>" +
                "<li>Total relations: <strong>" + totalRelations + "</strong></li>" +
                "<li>Concept2Gene #mappings: " + geneEvidenceConcepts + " (" + conceptPercentage + "%)</li>" +
                "<li>Size of the gene-evidence networks:" +
                "<ul><li>Min.: " + minValues + "</li>" +
                "<li>Max.: " + maxValues + "</li>" +
                "<li>Average: " + avgValues + "</li></ul>" +
                "</li></ul>";

            // Tabular breakdown of all conceptTypes and their count.
            var cc_table = "Detailed breakdown:<br><table style'><tr><td>" +
                "<table style='border-collapse: collapse; float: left'>" +
                "<th style='border: 1px solid #dddddd; text-align: left;'>Type</th>" +
                "<th style='border: 1px solid #dddddd; text-align: left;'>#Total</th></tr>";

            for (var totalValue in graphStatsTotalValue) {
                cc_table += "<tr><td style='border: 1px solid #dddddd; text-align: left;'>" + totalValue + "</td>" +
                    "<td style='border: 1px solid #dddddd; text-align: left;'>" + graphStatsTotalValue[totalValue] + "</td></tr>";
            }

            cc_table += "</table><table style='border-collapse: collapse; float: left'><th style='border: 1px solid #dddddd; text-align: left;'>#Linked</th>" +
                "<th style='border: 1px solid #dddddd; text-align: left;'>%Linked</th></tr>"


            for (var statsPosition = 0; statsPosition <= graphStatsTotalValueArray.length - 1; statsPosition++) {

                var conEviPercentage = (parseFloat(graphstatsConceptValue[statsPosition]) / parseFloat(graphStatsTotalValueArray[statsPosition])) * 100;
                conEviPercentage = conEviPercentage.toFixed(2);
                cc_table += "<tr><td style='border: 1px solid #dddddd; text-align: left;'>" + graphstatsConceptValue[statsPosition] + "</td>" +
                    "<td style='border: 1px solid #dddddd; text-align: left;'>" + conEviPercentage + "</td></tr>";

            }
            cc_table += "</table><table style='border-collapse: collapse; float: left'><th style='border: 1px solid #dddddd; text-align: left;'>Avg.degree</th></tr>";
            avgRelationsPerConcept.forEach((avgRelation) => {
                cc_table += "<tr><td style='border: 1px solid #dddddd; text-align: left;'>" + (avgRelation).toFixed(2) + "</td></tr>";
            })
            cc_table += "</table></table></table>";

            var content = `<div style="width:480px" id="release-content">
      <p>
      <h2>${datasetTitle}</h2>
      </p>
      <p>
      ${datasetDescription}
      </p>
      <p id="network_stats" > 
      <span>This knowledge network contains:</span>
      ${statsText} ${cc_table}
      </p>
      <br/>
      </div>`
            var releaseModal = new jBox('Modal', {
                id: 'releaseBox',
                animation: 'pulse',
                title: `<font size="5"><font color="white"></font><font color="#51CE7B">Release </font><font size="5"><font color="white"> Notes</font>`,
                content: content,
                cancelButton: 'Exit',
                draggable: 'title',
                attributes: {
                    x: 'center',
                    y: 'top'
                },
                delayOpen: 50
            });

            releaseModal.open();

        } // get(/latestNetworkStats)
        ).fail(function (jqXHR, textStatus, errorThrown) {
            logErrorFromRemoteCall("Error while invoking /latestNetworkStats:", jqXHR, textStatus, errorThrown);
        });
}

// function converts Objects to array
function convertObjectToArray(conceptData) {
    var value = Object.keys(conceptData).map(key => conceptData[key]);
    return value;
}