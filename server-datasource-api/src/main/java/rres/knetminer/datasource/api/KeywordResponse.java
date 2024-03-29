package rres.knetminer.datasource.api;

import java.util.List;
import java.util.Optional;

import rres.knetminer.datasource.api.datamodel.EvidenceTableEntry;
import rres.knetminer.datasource.api.datamodel.GeneTableEntry;

/**
 * Contains elements that are common to both NetworkResponse and GenomeResponse, hence it is abstract.
 * 
 * @author holland
 * @author Marco Brandizi (2023, reviewed for pure JSON output)
 *
 */
public abstract class KeywordResponse extends KnetminerResponse 
{
	private String GViewer;
	private List<GeneTableEntry> geneTable;
	private List<EvidenceTableEntry> evidenceTable;
	private int geneCount;
	private int docSize;
	private int totalDocSize;
	
	public String getGViewer() {
		return GViewer;
	}
	public void setGViewer(String gViewer) {
		GViewer = gViewer;
	}
	public List<GeneTableEntry> getGeneTable() {
		return geneTable;
	}
	public void setGeneTable ( List<GeneTableEntry> geneTable ) {
		this.geneTable = Optional.ofNullable ( geneTable ).orElse ( List.of () );
	}
	public List<EvidenceTableEntry> getEvidenceTable() {
		return evidenceTable;
	}
	public void setEvidenceTable ( List<EvidenceTableEntry> evidenceTable ) {
		this.evidenceTable = evidenceTable;
	}
	public int getGeneCount() {
		return geneCount;
	}
	public void setGeneCount(int geneCount) {
		this.geneCount = geneCount;
	}
	public int getDocSize() {
		return docSize;
	}
	public void setDocSize(int docSize) {
		this.docSize = docSize;
	}
	public int getTotalDocSize() {
		return totalDocSize;
	}
	public void setTotalDocSize(int totalDocSize) {
		this.totalDocSize = totalDocSize;
	}
}
