
window.onload = function () {
    // Display knowledge network Stats.
    fetchStats();
};

/*
 * Function to read .tab file containing stats about the knowledge network & its mappings & to update 
 * them in the release.html webpage.
 */
function fetchStats() {
    var fileUrl = api_url + "/latestNetworkStats";
//console.log("Fetching Network stats from: "+ fileUrl);
    $.get(fileUrl).done(function (data) {
        var resp = data.stats.split("\n");
        var totalGenes = fetchValue(resp[1]);
        var totalConcepts = fetchValue(resp[2]);
        var totalRelations = fetchValue(resp[3]);
        var geneEvidenceConcepts = fetchValue(resp[4]);
        var minValues = fetchValue(resp[6]);
        var maxValues = fetchValue(resp[7]);
        var avgValues = fetchValue(resp[8]);
        // calculate concept occurrence percentage.
        var conceptPercentage = (geneEvidenceConcepts / (totalConcepts - totalGenes)) * 100;
        conceptPercentage = conceptPercentage.toFixed(2);

        // Display stats data.
        var statsText = "<br/><ul><li>Total number of genes: " + totalGenes + "</li>" +
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
                "<table style='border-collapse: collapse; float: left'>"+
                "<th style='border: 1px solid #dddddd; text-align: left;'>Type</th>" +
                "<th style='border: 1px solid #dddddd; text-align: left;'>#Total</th></tr>";

        var ccArray = [];
        var rel_bool = false, ccEvi_bool = false; // Define first Bools
        var loop_count = 0;

        for (var i = 11; i < resp.length - 2; i++) {

            if (resp[i].toString().includes("<cc_count>")) {
                var cc = fetchValue(resp[i]).split("=");
                ccArray.push(cc[1]);
                cc_table += "<tr><td style='border: 1px solid #dddddd; text-align: left;'>" + cc[0] + "</td>" +
                        "<td style='border: 1px solid #dddddd; text-align: left;'>" + cc[1] + "</td></tr>";
            }

            if (resp[i].toString().includes("<ccEvi>")) {
                if (ccEvi_bool === false) {
                    cc_table += "</table><table style='border-collapse: collapse; float: left'><th style='border: 1px solid #dddddd; text-align: left;'>#Linked</th>" +
                            "<th style='border: 1px solid #dddddd; text-align: left;'>%Linked</th></tr>"
                    ccEvi_bool = true;
                }
                var conEvi = fetchValue(resp[i]).split("=>");
                var conEviPercentage = (parseFloat(conEvi[1]) / parseFloat(ccArray[loop_count])) * 100;
                conEviPercentage = conEviPercentage.toFixed(2);
                cc_table += "<tr><td style='border: 1px solid #dddddd; text-align: left;'>" + conEvi[1] + "</td>" +
                        "<td style='border: 1px solid #dddddd; text-align: left;'>" + conEviPercentage + "</td></tr>";
                loop_count++;
            }

            if (resp[i].toString().includes("<hubiness>")) {
                if (rel_bool === false) {
                    cc_table += "</table><table style='border-collapse: collapse; float: left'><th style='border: 1px solid #dddddd; text-align: left;'>Avg.degree</th></tr>";
                    rel_bool = true;
                }
                var rel = fetchValue(resp[i]).split("->");
                cc_table += "<tr><td style='border: 1px solid #dddddd; text-align: left;'>" + rel[1] + "</td></tr>";
            }
        }

        cc_table += "</table></table></table>";

        $("#network_stats").append(statsText + cc_table);
        $("#network_stats th:contains('Avg.degree')").attr('title', "The Avg.degree calculates the average degree of inwards and outwards connections to a node, given as (for each concept) the total number of unique relationships divided by the total number of concepts present in the graph");
    }
    ).fail(function () {
        console.log("Error occurred while retrieving Network details");
    });
}

function fetchValue(valText) {
    var start = valText.indexOf(">");
    var end = valText.indexOf("</");
    var val = valText.substring(start + 1, end);
    return val;
}