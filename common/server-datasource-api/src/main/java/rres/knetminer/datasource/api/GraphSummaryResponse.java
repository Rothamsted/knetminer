/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package rres.knetminer.datasource.api;

/**
 * API end point to get JSON containing the graphSummary
 *
 * @author hearnshawj
 */
public class GraphSummaryResponse extends KnetminerResponse {

    public String graphSummary;

    public void setGraphSummary(String graphSummary) {
        this.graphSummary = graphSummary;
    }

    public String getGraphSummary() {
        return graphSummary;
    }

}
