package rres.knetminer.datasource.api;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Manages specific parameters for /genome and /qtl
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>13 Mar 2023</dd></dl>
 *
 */
public class GenomeRequest extends KnetminerRequest
{
	// Jackson and Spring expect sortedEvidenceTable by default, which, to me isn't clear enough 
	@JsonProperty ( value = "isSortedEvidenceTable" )
	private boolean isSortedEvidenceTable = false;

	public GenomeRequest () {}

	/**
	 * See ExportService#exportEvidenceTable(). This false by default.
	 */
	public boolean isSortedEvidenceTable () {
		return isSortedEvidenceTable;
	}

	public void setSortedEvidenceTable ( boolean isSortedEvidenceTable ) {
		this.isSortedEvidenceTable = isSortedEvidenceTable;
	}
	
	@Override
	public String toString ()
	{
		return String.format ( 
			"GenomeRequest{qtl: %s, keyword: %s, list: %s, listMode: %s, taxId: %s, isSortedEvidenceTable: %b}",
			getQtl (), getKeyword (), getList (), getListMode (), getTaxId (), isSortedEvidenceTable () 
		);
	}
	
}
