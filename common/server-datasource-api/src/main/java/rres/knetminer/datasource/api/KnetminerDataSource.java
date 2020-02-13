package rres.knetminer.datasource.api;

import java.util.Arrays;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * A data source provides data for KnetminerServer to serve. The annotation makes it get picked up
 * automatically by the autowiring. Note that this class is abstract, and implementations of it
 * should be aware of particular methods of locating and serving data, e.g. via Ondex. One instance
 * could potentially provide multiple sources, each with a different name.
 * 
 * @author holland
 *
 */
@KnetminerDataSourceProvider
public abstract class KnetminerDataSource {
    protected final Logger log = LogManager.getLogger(getClass());
	
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
		log.debug("Set data source name to "+Arrays.toString(this.dataSourceNames));
	}
	
	private String api_url = "";
	
	public void setApiUrl(String api_url) {
		this.api_url = api_url;
	}
	
	public String getApiUrl() {
		return this.api_url;
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
	
	public abstract LatestNetworkStatsResponse latestNetworkStats(String dsName, KnetminerRequest request) throws IllegalArgumentException;
        
	public abstract GraphSummaryResponse dataSource(String dsName, KnetminerRequest request) throws IllegalArgumentException;
	
	public abstract CountGraphEntities geneCount(String dsName, KnetminerRequest request) throws IllegalArgumentException;
	
	public abstract KnetSpaceHost ksHost(String dsName, KnetminerRequest request) throws IllegalArgumentException;
}
