package rres.knetminer.datasource.api;

/**
 * Manages specific parameters for /genome and /qtl
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>13 Mar 2023</dd></dl>
 *
 */
public class GenomeRequest extends KnetminerRequest
{
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
		
}
