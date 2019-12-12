package rres.knetminer.datasource.api;

/**
 * API end point to get pure JSON for network response (for testing knetmaps.js)
 * @author singha
 */
public class dummy_GraphSummaryResponse extends KnetminerResponse {

    public String jsonData;

    public void setJsonData(String jsonData) {
        this.jsonData = jsonData;
    }

    public String getJsonData() {
        return jsonData;
    }

}
