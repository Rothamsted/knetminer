/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package rres.knetminer.datasource.api;

/**
 * API end point to get JSON containing the number of nodes and relationships
 * for a gene list
 *
 * @author hearnshawj
 */
public class CountGraphEntities extends KnetminerResponse {

    private String nodeCount;
    private String relationshipCount;

    public String getNodeCount() {
        return nodeCount;
    }

    public void setNodeCount(String nodeCount) {
        this.nodeCount = nodeCount;
    }

    public String getRelationshipCount() {
        return relationshipCount;
    }

    public void setRelationshipCount(String relationshipCount) {
        this.relationshipCount = relationshipCount;
    }


    
}

