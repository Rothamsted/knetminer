package rres.knetminer.datasource.ondexlocal.config;

import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import rres.knetminer.datasource.ondexlocal.service.DataService;
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
	
	@JsonProperty ( "dataset" )
	private ServerDatasetInfo datasetInfo;
	
	@JsonProperty
	private boolean cypherDebuggerEnabled = false;
	
	@JsonProperty
	private String googleAnalyticsId = null;

	@JsonProperty
	private String googleAnalyticsClientId = null;
	
	
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
		
		if ( this.dataDirPath == null ) dataDirPath = datasetDirPath + "/" + "data";
		dataDirPath = buildPath ( datasetDirPath, dataDirPath );
		
		if ( this.oxlFilePath == null ) oxlFilePath = dataDirPath + "/knowledge-network.oxl";
		oxlFilePath = buildPath ( datasetDirPath, oxlFilePath );
		
		this.seedGenesFilePath = buildPath ( datasetDirPath, seedGenesFilePath );
		
		this.datasetInfo.postConstruct ( this );
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
	private void setGraphTraverserOptions ( Map<String, Object>graphTraverserOptions )
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
	public String getGoogleAnalyticsId ()
	{
		return googleAnalyticsId;
	}

	/**
	 * A Google Analytics ID, which is used for the client. TODO: why aren't we using a single ID?! 
	 */
	public String getGoogleAnalyticsClientId ()
	{
		return googleAnalyticsClientId;
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
