package rres.knetminer.datasource.server.graphinfo;

import net.sourceforge.ondex.core.ConceptAccession;

public class AccessionInfo {
	
	String accession;
	
	String dataSource;
	
	public AccessionInfo ( ConceptAccession acc ) {
		accession = acc.getAccession();
		dataSource = acc.getElementOf().getId();
	}
	
	public String getAccession () {
		return accession;
	}
	public void setAccession ( String accession ) {
		this.accession = accession;
	}
	public String getDataSource () {
		return dataSource;
	}
	public void setDataSource ( String dataSource ) {
		this.dataSource = dataSource;
	}
}