package rres.knetminer.datasource.api;

import java.util.Map;

/**
 * Contains elements that are common to both NetworkResponse and GenomeResponse, hence it is abstract.
 * 
 * @author holland
 *
 */
public abstract class KeywordResponse extends KnetminerResponse {
	private String GViewer;
	private Map<String,Object> geneTable;
	private Map<String,Object> evidenceTable;
	private int geneCount;
	private int docSize;
	private int totalDocSize;
	public String getGViewer() {
		return GViewer;
	}
	public void setGViewer(String gViewer) {
		GViewer = gViewer;
	}
	public Map<String,Object> getGeneTable () {
		return geneTable;
	}
	public void setGeneTable ( Map<String,Object> geneTable ) {
		this.geneTable = geneTable;
	}
	public Map<String,Object> getEvidenceTable () {
		return evidenceTable;
	}
	public void setEvidenceTable ( Map<String,Object> evidenceTable ) {
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
