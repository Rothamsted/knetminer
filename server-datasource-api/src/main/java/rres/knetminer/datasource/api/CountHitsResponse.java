package rres.knetminer.datasource.api;

public class CountHitsResponse extends KnetminerResponse {
	private int luceneCount;
	private int luceneLinkedCount;
	private int geneCount;
	public int getLuceneCount() {
		return luceneCount;
	}
	public void setLuceneCount(int luceneCount) {
		this.luceneCount = luceneCount;
	}
	public int getLuceneLinkedCount() {
		return luceneLinkedCount;
	}
	public void setLuceneLinkedCount(int luceneLinkedCount) {
		this.luceneLinkedCount = luceneLinkedCount;
	}
	public int getGeneCount() {
		return geneCount;
	}
	public void setGeneCount(int geneCount) {
		this.geneCount = geneCount;
	}
}
