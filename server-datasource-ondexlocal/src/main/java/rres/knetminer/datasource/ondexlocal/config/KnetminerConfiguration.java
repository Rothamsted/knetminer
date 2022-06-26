package rres.knetminer.datasource.ondexlocal.config;

import java.nio.file.Path;
import java.util.Optional;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

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
public class KnetminerConfiguration
{	
	@JsonProperty ( "datasetDir" )
	private String datasetDirPath;

	@JsonProperty ( "dataDir" )
	private String dataDirPath;
	
	@JsonProperty ( "oxl" )
	private String oxlFilePath;

	/** TODO: move this class here */
	@JsonProperty ( "dataset" )
	private DatasetInfo datasetInfo;

	
	@JsonIgnore
	private String configFilePath;
	
		
	private static final Logger slog = LogManager.getLogger ( KnetminerConfiguration.class );
	
	
	public static KnetminerConfiguration load ( String configFilePath )
	{
		slog.info ( "Loading Ondex/Knetminer configuration from '{}'", configFilePath );
		var cfg = YAMLUtils.loadYAMLFromFile ( configFilePath, KnetminerConfiguration.class );
		cfg.configFilePath = configFilePath;
		cfg.postConstruct ();
		
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
			if ( datasetDirPath.endsWith ( "/config" ) ) 
				datasetDirPath = datasetDirPath.replace ( "/config$", "" );
		}
		if ( this.dataDirPath == null ) this.dataDirPath = this.datasetDirPath + "/" + "data";
		if ( this.oxlFilePath == null ) this.oxlFilePath = this.dataDirPath + "/knowledge-graph.oxl";
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
		if ( filePath.toLowerCase ().matches ( "^(/|\\|[a-z]:)" ) ) return filePath;
		return basePath + "/" + filePath;
	}
		
}
