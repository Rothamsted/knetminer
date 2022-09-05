package rres.knetminer.datasource.api;

/**
 * Manages the specific /network API call.
 * 
 * @see KnetminerDataSource#network(String, KnetminerRequest)
 * 
 * @author jojicunnunni
 *
 */
public class NetworkRequest extends KnetminerRequest {
	
	private boolean exportPlainJSON; 
	

	public NetworkRequest() {

	}

	public boolean isExportPlainJSON() {
		return exportPlainJSON;
	}

	public void setExportPlainJSON(boolean exportPlainJSON) {
		this.exportPlainJSON = exportPlainJSON;
	}

}
