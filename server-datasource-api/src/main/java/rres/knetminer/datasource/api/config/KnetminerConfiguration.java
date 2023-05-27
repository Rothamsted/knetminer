package rres.knetminer.datasource.api.config;

import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import uk.ac.ebi.utils.collections.OptionsMap;
import uk.ac.ebi.utils.collections.OptionsMapWrapper;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedValueException;
import uk.ac.ebi.utils.opt.config.YAMLLoader;

/**
 * A class to map and manage YAML configuration files for Knetminer.
 * 
 * These files are loaded via {@link YAMLLoader}, so have a look at that class (and tests in the 
 * jutils project) to have an idea of all the options it offers. Also, have a look to 
 * existing Knetminer files. 
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>9 Jun 2022</dd></dl>
 *
 */
@JsonAutoDetect ( getterVisibility = Visibility.NONE, fieldVisibility = Visibility.NONE )
public class KnetminerConfiguration
{	
	@JsonProperty ( "datasetDir" )
	private String datasetDirPath;

	@JsonProperty ( "dataDir" )
	private String dataDirPath;
	
	@JsonProperty ( "oxl" )
	private String oxlFilePath;

	@JsonProperty ( "seedGenesFile" )
	private String seedGenesFilePath;
	
	@JsonProperty
	private int defaultExportedPublicationCount = -1;
	
	@JsonProperty
	private String knetSpaceURL;
	
	private OptionsMap graphTraverserOptions = new OptionsMapWrapper ();

	private OptionsMap customOptions = new OptionsMapWrapper ();
	
	
	@JsonProperty ( "dataset" )
	private ServerDatasetInfo datasetInfo;
	
	@JsonProperty
	private boolean cypherDebuggerEnabled = false;

	@JsonProperty ( "googleAnalyticsAPI" )
	private GoogleAnalyticsConfiguration googleAnalyticsApiConfig = null; 

	@JsonProperty ( "googleAnalyticsClient" )
	private GoogleAnalyticsConfiguration googleAnalyticsClientConfig = null; 
	
	
	@JsonIgnore
	private String configFilePath;
	
	private static final Logger slog = LogManager.getLogger ( KnetminerConfiguration.class );
	
	private KnetminerConfiguration () {
	}
	
	/**
	 * This is the entry point to obtain a configuration, and Knetminer uses it in 
	 * {@link DataService#loadConfiguration(String)}.
	 * 
	 */
	public static KnetminerConfiguration load ( String configFilePath )
	{
		slog.info ( "Loading Ondex/Knetminer configuration from '{}'", configFilePath );
		var cfg = YAMLLoader.loadYAMLFromFile ( configFilePath, KnetminerConfiguration.class );
		cfg.configFilePath = configFilePath;
		cfg.postConstruct ();
		
		// TODO: toString() methods and debug message to report the loaded config
		
		return cfg;
	}

	/**
	 * Invoked at {@link #load(String) config loading time}, set up things like file paths.
	 */
	private void postConstruct ()
	{
		this.configFilePath = Path.of ( configFilePath ).toAbsolutePath ().toString ();
		if ( this.datasetDirPath == null )
		{
			datasetDirPath = getDir ( configFilePath );
			
			// If the config is in /config, the dataset dir is the upper directory
			// else, it is the same as the config file
			datasetDirPath = datasetDirPath.replaceAll ( "/config$", "" );
		}
		
		// The default
		if ( this.dataDirPath == null ) dataDirPath = datasetDirPath + "/" + "data";
		
		// Compute the absolute path if it's relative, no matter how
		// we got it 
		dataDirPath = buildPath ( datasetDirPath, dataDirPath );
		
		// Same as above
		if ( this.oxlFilePath == null ) oxlFilePath = dataDirPath + "/knowledge-network.oxl";
		
		oxlFilePath = buildPath ( datasetDirPath, oxlFilePath );
		
		this.seedGenesFilePath = buildPath ( datasetDirPath, seedGenesFilePath );
		
		this.datasetInfo.postConstruct ( this );
		
		if ( this.googleAnalyticsApiConfig == null ) return;
		if ( googleAnalyticsApiConfig.getClientId () == null )
			googleAnalyticsApiConfig.setClientId ( "knetminer::api::" + datasetInfo.getId () );
		
		if ( this.googleAnalyticsClientConfig == null )
			this.googleAnalyticsClientConfig = this.googleAnalyticsApiConfig;
	}
	
	/**
	 * General info about the configured dataset, this is mapped via the dataset field in the config
	 * file, which has the fields in {@link ServerDatasetInfo} as sub-fields, see the existing .yml files.
	 */
	public ServerDatasetInfo getServerDatasetInfo ()
	{
		return datasetInfo;
	}

	/**
	 * Set up automatically with the absolute path of the file passed to {@link #load(String)}.
	 */
	public String getConfigFilePath ()
	{
		return configFilePath;
	}
	
	/**
	 * if this isn't set explicitly, it's set to the same directory of {@link #getConfigFilePath()}, unlsess
	 * the latter is under config/, in which case the upper directory is assumed to be the dataset directory.
	 * 
	 * The Knetminer dataset directory is where all of the configuration and data for an instance are. Under such
	 * directory, the /config subdirectory is fixed, while others (eg, {@link #getDataDirPath()} can be set 
	 * to be elsewhere.
	 * 
	 * <b>WARNING</b>: be careful when you use Docker, usually these paths refer to container's directories, which
	 * are then mapped to host volumes in a transparent way.
	 */
	public String getDatasetDirPath ()
	{
		return datasetDirPath;
	}

	/**
	 * Where data like Lucene indexes are written. By default, this is {@link #getDatasetDirPath()} + "/data".
	 */
	public String getDataDirPath ()
	{
		return dataDirPath;
	}

	/**
	 * The OXL about the knowledge graph that this instance is based on. By default this is 
	 * {@link #getDataDirPath()} + "/knowledge-network.oxl".
	 */
	public String getOxlFilePath ()
	{
		return oxlFilePath;
	}
	
	/**
	 * Optional file of gene IDs to use for searches, in particular, to initialise the semantic motif system, 
	 * see the .yml examples. 
	 */
	public String getSeedGenesFilePath ()
	{
		return seedGenesFilePath;
	}
	
	/**
	 * These are not checked by the YAML mapper, since each traverser might have its own set of options, 
	 * so, see example files and the specific traverser.
	 * 
	 * This corresponds to 'graphTraverser' in the YAML files.
	 *  
	 */
	public OptionsMap getGraphTraverserOptions ()
	{
		return graphTraverserOptions;
	}

	@JsonProperty ( "graphTraverser" )
	private void setGraphTraverserOptions ( Map<String, Object> graphTraverserOptions )
	{
		this.graphTraverserOptions = OptionsMap.from ( graphTraverserOptions );
	}

	/**
	 * The default no of publications that are reported in certain search results. See the existing
	 * YAML files.
	 */
	public int getDefaultExportedPublicationCount ()
	{
		return defaultExportedPublicationCount;
	}

	/**
	 * The URL to KnetSpace, which Knetminer uses for bridging Knetminer and KnetSpace.
	 */
	public String getKnetSpaceURL ()
	{
		return knetSpaceURL;
	}

	
	/**
	 * See the Cypher debugger. Normally this is disabled and enabling it on public instances is a VERY
	 * bad idea, cause this service allows for disrupting an existing Knetminer configuration and it 
	 * should be used only internally, for testing purposes.
	 */
	public boolean isCypherDebuggerEnabled ()
	{
		return cypherDebuggerEnabled;
	}

	/**
	 * Used for tracking requests via Google Analytics.
	 * When this is null, no tracking happens.
	 */
	public GoogleAnalyticsConfiguration getGoogleAnalyticsApiConfig ()
	{
		return googleAnalyticsApiConfig;
	}

	/**
	 * If you want, you can separate the GA credentials used for the API from those used for
	 * the UI. We don't recommend it and if this is left null, it will use the 
	 * {@link #getGoogleAnalyticsApiConfig() API credentials}.
	 * 
	 * WARNING: this imply that you need to omit BOTH this and the API credentials if you want to 
	 * disable GA completely. We DO NOT support the setting where the API tracking is enabled and
	 * the client tracking is not.
	 * 
	 * Moreover, the only param that is exposed to the UI is 
	 * {@link GoogleAnalyticsConfiguration#getMeasurementId()}, since that's the only one 
	 * that the Google-provided Js library gtag needs.
	 * 
	 * This also implies that you can omit API secret and measurement ID from the client 
	 * configuration.
	 * 
	 * @see {@link DatasetInfoService#getGoogleAnalyticsIdClient()}
	 * 
	 */
	public GoogleAnalyticsConfiguration getGoogleAnalyticsClientConfig ()
	{
		return googleAnalyticsClientConfig;
	}

	
	/**
	 * Custom free-key options, which are not explicitly listed in other properties of this configuration class.
	 *  
	 * <p>These are intended as quick-to-set options that can be used for tests, new UI components, to inject parameters
	 * into sub-components and API, for temporary features that might be removed in future.</p>
	 * 
	 * <p>A new custom option can simply be set as an additional field in the {@code customOptions} section of a YAML configuration file.
	 * Since this section is nothing but a JSON object, the values of new fields in it can any valid JSON, eg, strings, numbers, arrays,
	 * objects.</p>
	 * 
	 * <p>The custom options are available from the API, via the call to /dataset-info/custom-options</p>
	 * 
	 * <p><b>WARNING</b>: <b>DO NOT ABUSE this feature!</b> It is intended as an hack to help in situations where you don't want the 
	 * explicit list of configuration parameters to be filled up with too many values that don't concern the core Knetminer functionality.
	 * <b>Explicit</b> options are strongly preferred for important/stable features, so <b>avoid</b> to put them here, or to keep them here
	 * <b>as much as possible</b>.</p>
	 * 
	 * <p><b>Note on file paths</b>: because these custom options are not processed by Knetminer components, nothing is known about file paths
	 * and hence relative paths are not resolved. Use {@code ${mydir}} to get the configuration dir, as explained on 
	 * <a href = "https://github.com/Rothamsted/knetminer/wiki/3.-Deploying-KnetMiner-with-Docker#rules-for-the-configuration-files">the documentation</p>.
	 * 
	 */
	public OptionsMap getCustomOptions ()
	{
		return customOptions;
	}

	@JsonProperty
	private void setCustomOptions ( Map<String, Object> customOptions )
	{
		this.customOptions = OptionsMap.from ( customOptions );
	}

	/**
   * These are injected into System.getProperties() and made available to other Java components around
   * It can be used to inject values inside components that use Spring beans files (neo4j/config.xml 
   * is an example of that).
   * 
   * These properties can be overridden from the command line (eg, passing -D to Java, via JAVA_TOOL_OPTIONS)
	 */
	@JsonProperty
	private void setSystemProperties ( Map<String, Object> systemProperties )
	{
		var sysProps = System.getProperties ();
		systemProperties.forEach ( sysProps::putIfAbsent );
	}

	/**
	 * Get the parent directory of a file.
	 * 
	 * TODO: move it elsewhere?
	 */
	public static String getDir ( String filePath )
	{
		return Optional.ofNullable ( Path.of ( filePath ).getParent () )
			.map ( Path::toString )
			.orElseThrow ( () ->  ExceptionUtils.buildEx (
				UnexpectedValueException.class, 
				"Strangely, the file \"%s\" hasn't a parent directory", filePath
			));
	}
	
	/**
	 * if the filePath is relative, composes a new path using basePath. Else, returns filePath.
	 * 
	 * TODO: move it elsewhere?
	 */
	public static String buildPath ( String basePath, String filePath )
	{
		if ( filePath == null ) return filePath;
		
		// Is it absolute? Ie, Does it begin with /, \, or something like c: ?
		if ( filePath.toLowerCase ().matches ( "^(/|\\|[a-z]:).*" ) ) return filePath;
		
		return basePath + "/" + filePath;
	}
		
}
