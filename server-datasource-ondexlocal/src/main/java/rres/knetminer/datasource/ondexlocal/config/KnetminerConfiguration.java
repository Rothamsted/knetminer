package rres.knetminer.datasource.ondexlocal.config;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import rres.knetminer.datasource.server.datasetinfo.DatasetInfo;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>9 Jun 2022</dd></dl>
 *
 */
public class KnetminerConfiguration
{
	/** TODO: move this class here */
	private DatasetInfo datasetInfo;
	private String dataDirPath;
	private String oxlPath;
	
	public static KnetminerConfiguration load ( String configFilePath )
	{
		try
		{
			var mapper = new ObjectMapper ( new YAMLFactory () );
			var result = mapper.readValue ( new File ( configFilePath ), KnetminerConfiguration.class );
			
			// TODO: includes
			return result;
		}
		catch ( IOException ex ) // includes JsonProcessingException
		{
			throw ExceptionUtils.buildEx ( UncheckedIOException.class, ex, 
				"Error while loading Knetminer configuration from \"%s\": $cause", configFilePath	
			);
		}
	}

	public DatasetInfo getDatasetInfo ()
	{
		return datasetInfo;
	}

	public String getDataDirPath ()
	{
		return dataDirPath;
	}

	public String getOxlPath ()
	{
		return oxlPath;
	}

	
}
