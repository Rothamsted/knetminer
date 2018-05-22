package rres.knetminer.datasource.api;

@KnetminerDataSourceProvider
public abstract class KnetminerDataSource {
	/*
	 * Request to refresh the “MatchCounter” (as user types search keywords, e.g,
	 * stating “826 documents and 7248 genes will be found with this query”):
	 * mode=counthits&keyword=dormancy OR anthocyanin
	 * 
	 * Request when invoking the Query Suggestor: mode=synonyms&keyword=dormancy OR
	 * anthocyanin
	 * 
	 * Request when defining a QTL region before the actual search:
	 * mode=countloci&keyword=4-12004726-18589418
	 * 
	 * Request for Keyword-based search: keyword=dormancy&mode=genome
	 * keyword=flowering%20FLC%20FT&mode=genome
	 * 
	 * Request for search using keywords and gene list:
	 * keyword=dormancy%20OR%20anthocyanin&mode=genome&listMode=GL
	 * 
	 * Request when using keywords and specific QTL region:
	 * keyword=dormancy%20OR%20anthocyanin&mode=genome&qtl1=5:18589410:18589430:
	 * 
	 * Request using keyword, QTL region & Gene List:
	 * keyword=dormancy%20OR%20anthocyanin&mode=genome&listMode=GL&qtl1=5:18589410:
	 * 18589430:
	 * 
	 * Results are then generated in .tab format for Gene View, followed by .tab for
	 * Evidence View .tab and .xml for Map View (Genomaps).
	 * 
	 * Request to generate a sub-network (oxl/json) in KnetMaps (Network View) from
	 * Gene View: OndexServlet?mode=network&keyword=dormancy%20OR%20anthocyanin
	 * 
	 * Request to generate a sub-network in KnetMaps from Evidence View:
	 * hmode=evidencepath&keyword=167917 followed by standard network
	 * request as earlier.
	 * 
	 */
	
	private String[] dataSourceNames = new String[0];

	/**
	 * Return a list - perhaps just one entry for a single species - of all data
	 * sources supported by this particular implementation. Species will be mapped
	 * against the URLs. For example, if this method returns ["human", "dog"] then
	 * it will receive all requests sent to /human/... and /dog/... If more than one
	 * data source returns the same values for this method then the last one
	 * registered will be the one that is called. Registration may happen in a
	 * random order so this should be avoided if possible.
	 * 
	 * @return an array of supported data source names
	 */
	public String[] getDataSourceNames() {
		return this.dataSourceNames;
	}
	
	public void setDataSourceNames(String[] dataSourceNames) {
		this.dataSourceNames = dataSourceNames;
	}

	/*
	 * In all the below, IllegalArgumentException should be thrown if the incoming
	 * request object is missing any information required to run the query. If
	 * execution of an external command fails, failure should be notified by
	 * throwing an exception sub-classed from Error.
	 */

	public abstract CountHitsResponse countHits(String dsName, KnetminerRequest request) throws IllegalArgumentException;

	public abstract SynonymsResponse synonyms(String dsName, KnetminerRequest request) throws IllegalArgumentException;

	public abstract CountLociResponse countLoci(String dsName, KnetminerRequest request) throws IllegalArgumentException;

	public abstract GenomeResponse genome(String dsName, KnetminerRequest request) throws IllegalArgumentException;

	public abstract QtlResponse qtl(String dsName, KnetminerRequest request) throws IllegalArgumentException;

	public abstract NetworkResponse network(String dsName, KnetminerRequest request) throws IllegalArgumentException;

	public abstract EvidencePathResponse evidencePath(String dsName, KnetminerRequest request) throws IllegalArgumentException;
}
