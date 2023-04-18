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

	private String apiUrl = "";

	/**
	 * WARNING! We're progressively moving to an architecture where each server instance manages
	 * ONE DATA SOURCE ONLY and this method will return ONE RESULT ONLY.
	 * 
	 * That's because nowadays it's much easier to have one Docker container per DS.
	 * 
	 * We're keeping a configured DS name for two reasons: 1) backward compatibility and,
	 * most importantly 2) being able to feed HTTP reverse proxies, by mapping something like  
	 * /ws/$DS/* to its own internal server.
	 * 
	 * What follows was the old Javadoc for this method:
	 * 
	 * <i>Return a list - perhaps just one entry for a single species - of all data
	 * sources supported by this particular implementation. Species will be mapped
	 * against the URLs. For example, if this method returns ["human", "dog"] then
	 * it will receive all requests sent to /human/... and /dog/... If more than one
	 * data source returns the same values for this method then the last one
	 * registered will be the one that is called. Registration may happen in a
	 * random order so this should be avoided if possible.</i>
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
	

	/**
	 * TODO: review, this should actually come from the configuration.
	 */
	@Deprecated
	public void setApiUrl(String apiUrl) {
		this.apiUrl = apiUrl;
	}
	
	/**
	 * TODO: review, this should actually come from the configuration.
	 */
	@Deprecated
	public String getApiUrl() {
		return this.apiUrl;
	}
	
	/*
	 * In all the below, IllegalArgumentException should be thrown if the incoming
	 * request object is missing any information required to run the query. If
	 * execution of an external command fails, failure should be notified by
	 * throwing an exception sub-classed from Error.
	 * 
	 * TODO: probably it's not Error anymore in 2023, to be checked.
	 */

	public abstract CountHitsResponse countHits(String dsName, KnetminerRequest request) throws IllegalArgumentException;

	public abstract SynonymsResponse synonyms(String dsName, KnetminerRequest request) throws IllegalArgumentException;

	public abstract CountLociResponse countLoci(String dsName, KnetminerRequest request) throws IllegalArgumentException;

	public abstract GenomeResponse genome(String dsName, GenomeRequest request) throws IllegalArgumentException;

	public abstract QtlResponse qtl(String dsName, GenomeRequest request) throws IllegalArgumentException;

	public abstract NetworkResponse network(String dsName, NetworkRequest request) throws IllegalArgumentException;
	
	public abstract LatestNetworkStatsResponse latestNetworkStats(String dsName, KnetminerRequest request) throws IllegalArgumentException;
   
	/**
	 * @deprecated this is still in use, but we need to migrate to /dataset-info, which
	 * is a more complete and correct version of the same function. 
	 */
	@Deprecated
	public abstract GraphSummaryResponse dataSource(String dsName, KnetminerRequest request) throws IllegalArgumentException;
	
	/**
	 * @deprecated this is still in use, but we need to migrate to /dataset-info
	 */
	@Deprecated
	public abstract KnetSpaceHost ksHost(String dsName, KnetminerRequest request) throws IllegalArgumentException;

	/**
	 * Gets the Google API ID from the configuration.
	 * 
	 * TODO: we need this bridge for {@code KnetminerServer}, until we unify the different Maven modules into
	 * one. WARNING: because of that, do not invoke this as an API call, use DatasetInfoService instead.
	 */
	public abstract String getGoogleAnalyticsIdApi ();
}
