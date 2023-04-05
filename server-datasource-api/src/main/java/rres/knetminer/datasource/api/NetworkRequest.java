package rres.knetminer.datasource.api;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Manages the specific /network API call.
 * 
 * @see KnetminerDataSource#network(String, KnetminerRequest)
 * 
 * @author jojicunnunni
 *
 */
public class NetworkRequest extends KnetminerRequest {
	
	// Jackson and Spring expect sortedEvidenceTable by default, which, to me isn't clear enough 
	@JsonProperty ( value = "isExportPlainJSON" )
	private boolean isExportPlainJSON; 
	

	public NetworkRequest() {

	}

	public boolean isExportPlainJSON() {
		return isExportPlainJSON;
	}

	public void setExportPlainJSON(boolean exportPlainJSON) {
		this.isExportPlainJSON = exportPlainJSON;
	}

	@Override
	public String toString ()
	{
		return String.format ( 
			"NetworkRequest{qtl: %s, keyword: %s, list: %s, listMode: %s, taxId: %s, isExportPlainJSON: %b}",
			getQtl (), getKeyword (), getList (), getListMode (), getTaxId (), isExportPlainJSON () 
		);
	}
}
