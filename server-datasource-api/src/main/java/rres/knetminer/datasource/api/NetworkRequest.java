package rres.knetminer.datasource.api;

/**
 * All possible inputs to a network API request, with appropriate defaults set for all. This is the 
 * set of all possible inputs for all possible 'mode's.
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
