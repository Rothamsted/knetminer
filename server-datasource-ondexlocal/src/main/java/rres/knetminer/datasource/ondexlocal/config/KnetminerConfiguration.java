package rres.knetminer.datasource.ondexlocal.config;

import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

import uk.ac.ebi.utils.collections.OptionsMap;
import uk.ac.ebi.utils.collections.OptionsMapWrapper;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedValueException;
import uk.ac.ebi.utils.opt.config.YAMLUtils;

/**
 * TODO: comment me!
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
	private DatasetInfo datasetInfo;
	
	@JsonProperty
	private boolean cypherDebuggerEnabled = false;
	
	
	@JsonIgnore
	private String configFilePath;
	
	private static final Logger slog = LogManager.getLogger ( KnetminerConfiguration.class );
	
	
	public static KnetminerConfiguration load ( String configFilePath )
	{
		slog.info ( "Loading Ondex/Knetminer configuration from '{}'", configFilePath );
		var cfg = YAMLUtils.loadYAMLFromFile ( configFilePath, KnetminerConfiguration.class );
		cfg.configFilePath = configFilePath;
		cfg.postConstruct ();
		
		// TODO: toString() methods and debug message to report the loaded config
		
		return cfg;
	}

	private void postConstruct ()
	{
		this.configFilePath = Path.of ( configFilePath ).toAbsolutePath ().toString ();
		if ( this.datasetDirPath == null )
		{
			datasetDirPath = getDir ( configFilePath );
			
			// If the config is in /config, the dataset dir is the upper directory
			// else, it is the same as the config file
			if ( datasetDirPath.endsWith ( "/config" ) ) {
				datasetDirPath = datasetDirPath.replaceAll ( "/config$", "" );
			}
		}
		if ( this.dataDirPath == null ) dataDirPath = datasetDirPath + "/" + "data";
		if ( this.oxlFilePath == null ) oxlFilePath = dataDirPath + "/knowledge-network.oxl";
		this.seedGenesFilePath = buildPath ( datasetDirPath, seedGenesFilePath );
		
		this.datasetInfo.postConstruct ( this );
	}
	
	public DatasetInfo getDatasetInfo ()
	{
		return datasetInfo;
	}

	public String getConfigFilePath ()
	{
		return configFilePath;
	}
	
	public String getDatasetDirPath ()
	{
		return datasetDirPath;
	}

	public String getDataDirPath ()
	{
		return dataDirPath;
	}

	public String getOxlFilePath ()
	{
		return oxlFilePath;
	}
	
	public String getSeedGenesFilePath ()
	{
		return seedGenesFilePath;
	}
	
	public OptionsMap getGraphTraverserOptions ()
	{
		return graphTraverserOptions;
	}

	@JsonProperty ( "graphTraverser" )
	protected void setGraphTraverserOptions ( Map<String, Object>graphTraverserOptions )
	{
		this.graphTraverserOptions = OptionsMap.from ( graphTraverserOptions );
	}

	public int getDefaultExportedPublicationCount ()
	{
		return defaultExportedPublicationCount;
	}

	public String getKnetSpaceURL ()
	{
		return knetSpaceURL;
	}

	
	
	public boolean isCypherDebuggerEnabled ()
	{
		return cypherDebuggerEnabled;
	}

	
	public static String getDir ( String filePath )
	{
		return Optional.ofNullable ( Path.of ( filePath ).getParent () )
			.map ( Path::toString )
			.orElseThrow ( () ->  ExceptionUtils.buildEx (
				UnexpectedValueException.class, 
				"Strangely, the file \"%s\" hasn't a parent directory", filePath
			));
	}
	
	public static String buildPath ( String basePath, String filePath )
	{
		if ( filePath == null ) return filePath;
		// Is it absolute? Ie, Does it begin with /, \, or something like c: ?
		if ( filePath.toLowerCase ().matches ( "^(/|\\|[a-z]:).*" ) ) return filePath;
		return basePath + "/" + filePath;
	}
		
}
