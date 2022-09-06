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
 * 
 * @deprecated We now use /dataset-info and this should be migrated (in the clients)
 */
@Deprecated
public class KnetSpaceHost extends KnetminerResponse {

    private String ksHostUrl;

    public String getKsHostUrl() {
        return ksHostUrl;
    }

    public void setKsHostUrl(String ksHostUrl) {
        this.ksHostUrl = ksHostUrl;
    }
    
}
