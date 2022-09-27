package rres.knetminer.datasource.ondexlocal.config;

import static uk.ac.ebi.utils.exceptions.ExceptionUtils.buildEx;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import rres.knetminer.datasource.server.datasetinfo.DatasetInfoService;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.opt.io.IOUtils;

/**
 * An extension to {@link DatasetInfo} with more information and methods that are used on the 
 * server side only.
 * 
 * @see DatasetInfo
 * @see DatasetInfoService
 * 
 * @author brandizi
 * <dl><dt>Date:</dt><dd>29 May 2022</dd></dl>
 *
 */
@JsonAutoDetect ( getterVisibility = Visibility.NONE, fieldVisibility = Visibility.ANY )
public class ServerDatasetInfo implements DatasetInfo 
{
	/**
	 * Used internally, to provide a vie for {@link ServerDatasetInfo#asDatasetInfo()}.
	 */
	private class DatasetInfoDelegate implements DatasetInfo
	{		
		public String getId ()
		{
			return ServerDatasetInfo.this.getId ();
		}

		public String getTitle ()
		{
			return ServerDatasetInfo.this.getTitle ();
		}

		public String getDescription ()
		{
			return ServerDatasetInfo.this.getDescription ();
		}

		public String getKeywords ()
		{
			return ServerDatasetInfo.this.getKeywords ();
		}

		public String getVersion ()
		{
			return ServerDatasetInfo.this.getVersion ();
		}

		public String getCreationDate ()
		{
			return ServerDatasetInfo.this.getCreationDate ();
		}

		public String getOrganization ()
		{
			return ServerDatasetInfo.this.getOrganization ();
		}

		public List<SpecieInfo> getSpecies ()
		{
			// We need a similar shorter view
			return ServerDatasetInfo.this.speciesMap
				.values ()
				.stream ()
				.map ( ServerSpecieInfo::asSpecieInfo )
				.collect ( Collectors.toUnmodifiableList () );
		}

	} // DatasetInfoDelegate
	
	private String id;
	private String title = "";
	private String description = "";
	private String keywords = "";
	private String version = "";
	private String creationDate = "";
	private String organization = "";
	
	/** This is initialised using {@link #setSpecies(List)} */
	@JsonIgnore
	private Map<String, ServerSpecieInfo> speciesMap = Map.of ();
			
	@JsonProperty ( "sampleQueries" )
	private String sampleQueriesFilePath;
	
	@JsonProperty ( "releaseNotes" )
	private String releaseNotesFilePath;
	
	@JsonProperty ( "backgroundImage" )
	private String backgroundImageFilePath;
	
	/**
	 * Serves {@link #asDatasetInfo()}
	 */
	@JsonIgnore
	private DatasetInfo delegate = new DatasetInfoDelegate ();	
	
	/**
	 * Some initialisation about paths and the like. This is invoked by {@link KnetminerConfiguration}.
	 */
	void postConstruct ( KnetminerConfiguration root )
	{
		// Relative paths refer to this
		var dsetPath = root.getDatasetDirPath ();
		
		// null values have this as base path
		String defaultCfgPath = dsetPath + "/config";
		
		if ( this.sampleQueriesFilePath == null ) sampleQueriesFilePath = defaultCfgPath + "/sample-queries.xml";
		sampleQueriesFilePath = KnetminerConfiguration.buildPath ( 
			dsetPath, sampleQueriesFilePath 
		);
		
		if ( this.releaseNotesFilePath == null ) releaseNotesFilePath = defaultCfgPath + "/release-notes.html";
		releaseNotesFilePath = KnetminerConfiguration.buildPath ( 
			dsetPath, releaseNotesFilePath 
		);

		if ( this.backgroundImageFilePath == null ) backgroundImageFilePath = defaultCfgPath + "/background.jpg";
		backgroundImageFilePath = KnetminerConfiguration.buildPath ( 
			dsetPath, backgroundImageFilePath 
		);

		// Default for this is taken from the OXL
		if ( this.creationDate == null )
		{
			String oxlPath = root.getOxlFilePath ();
			if ( oxlPath != null && !oxlPath.isEmpty () )
			{
				try
				{
					BasicFileAttributes oxlAttrs = Files.readAttributes ( 
						Path.of ( root.getOxlFilePath () ), BasicFileAttributes.class 
					);
					
					// This is usually the most significant time
					this.creationDate = oxlAttrs.lastModifiedTime ().toString ();
				}
				catch ( IOException ex ) {
					ExceptionUtils.throwEx ( UncheckedIOException.class, 
						"Error while checking OXL file \"%s\": $cause", root.getOxlFilePath ()
					);
				}
			}
		}
		
		// TODO: forbid null
		for ( ServerSpecieInfo sp: this.speciesMap.values () )
			sp.postConstruct ( root );
	}
	
	/**
	 * This is the old data source name
	 */
	@Override
	public String getId ()
	{
		return id;
	}

	@Override
	public String getTitle ()
	{
		return title;
	}
	
	@Override
	public String getDescription ()
	{
		return description;
	}

	@Override
	public String getKeywords ()
	{
		return keywords;
	}

	@Override
	public String getVersion ()
	{
		return version;
	}

	/**
	 * Default is taken from the {@link KnetminerConfiguration#getOxlFilePath() OXL file path}.
	 * Set this to "" or non-null value to avoid this behaviour.
	 */
	@Override
	public String getCreationDate ()
	{
		return creationDate;
	}

	@Override
	public String getOrganization ()
	{
		return organization;
	}

	
	/**
	 * This is an initialiser for Jackson, which creates the {@link #speciesMap internal species map}.
	 */
	@JsonProperty
	private void setSpecies ( List<ServerSpecieInfo> species )
	{
		speciesMap = species.stream ()
		.collect ( Collectors.toMap ( 
			SpecieInfo::getTaxId,
			Function.identity (),
			(e1, e2) -> { throw buildEx ( 
				IllegalArgumentException.class,
				"Configuration with the specie %s specified multiple times",
				e1.getTaxId () ); },
			LinkedHashMap::new
		));
		speciesMap = Collections.unmodifiableMap ( speciesMap );
	}
	
	@Override
	@JsonProperty
	public List<SpecieInfo> getSpecies ()
	{
		return Collections.unmodifiableList ( new ArrayList<> ( speciesMap.values () ) );
	}
	
	/**
	 * All the {@link SpecieInfo#getTaxId() NCBI TAX IDs} available from {@link #getSpecies()}.
	 */
	public Set<String> getTaxIds ()
	{
		return speciesMap.keySet ();
	}
	
	/**
	 * A read only view of {@link SpecieInfo#getTaxId() NCBI TAX ID} => {@link SpecieInfo} about the 
	 * species configured for this dataset.
	 */
	public Map<String, ServerSpecieInfo> getSpeciesMap ()
	{
		return speciesMap;
	}
	
	/**
	 * The {@link SpecieInfo specie descriptor} corresponding to {@link SpecieInfo#getTaxId() NCBI TAX ID}.  
	 */
	public ServerSpecieInfo getSpecie ( String taxId )
	{
		return speciesMap.get ( taxId );
	}
	
	/**
	 * Helper to check a given TAX ID is supported by the dataset. This is useful in many Knetminer filtering
	 * operations.
	 */
	public boolean containsTaxId ( String taxId )
	{
		return speciesMap.containsKey ( taxId );
	}
	
	/**
	 * An XML file to describe example queries for this dataset. See existing examples.
	 */
	public String getSampleQueriesFilePath ()
	{
		return sampleQueriesFilePath;
	}
	
	/**
	 * Reads {@link #getSampleQueriesFilePath()} and returns it as a string.
	 * 
	 * Used in {@link DatasetInfoService#sampleQueriesXml()}. Note this isn't a YAML field, only the path is.
	 */
	public String getSampleQueriesXML ()
	{
		return IOUtils.readFile ( this.sampleQueriesFilePath );
	}
	
	/**
	 * A release notes file. TODO: We still have to review what exists, the client version of this
	 * file and how to do the injection of stats.
	 */
	public String getReleaseNotesFilePath ()
	{
		return releaseNotesFilePath;
	}

	/**
	 * Reads {@link #getReleaseNotesFilePath()} and returns its contents as a string.
	 * 
	 * Used in {@link DatasetInfoService#releaseNotesHTML()}. Note this isn't a YAML field, only the path is.
	 */
	public String getReleaseNotesHTML ()
	{
		return IOUtils.readFile ( this.releaseNotesFilePath );
	}
	
	/**
	 * The path to the UI background. TODO: Still in use? 
	 * 
	 */
	public String getBackgroundImageFilePath ()
	{
		return backgroundImageFilePath;
	}
	
	/**
	 * Read {@link #getBackgroundImageFilePath()} and returns its contents as binary bytes.
	 * 
	 * Used in {@link DatasetInfoService#backgroundImage()}. Note this isn't a YAML field, only the path is.
	 */
	public byte[] getBackgroundImage ()
	{
		try {
			return Files.readAllBytes ( Path.of ( this.backgroundImageFilePath ) );
		}
		catch ( IOException ex ) {
			throw ExceptionUtils.buildEx ( UncheckedIOException.class,
				"Error while fetching application background from \"%s\": $cause", backgroundImageFilePath
			);
		}		
	}

	/**
	 * Uses {@link #getBackgroundImageFilePath()} to guess the image's MIME type from its file extension.
	 * 
	 * Used in {@link DatasetInfoService#backgroundImage()}. Note this isn't a YAML field, only the path is.
	 */
	public String getBackgroundImageMIME ()
	{
		try {
			return Files.probeContentType ( Path.of ( this.backgroundImageFilePath ) );
		}
		catch ( IOException ex ) {
			throw ExceptionUtils.buildEx ( UncheckedIOException.class,
				"Error while fetching application background from \"%s\": $cause", backgroundImageFilePath
			);
		}		
	}
	
	/**
	 * Offers a simplified view, stripped of server details, to be used by eg, API clients.  
	 * @see DatasetInfo.
	 */
	public DatasetInfo asDatasetInfo ()
	{
		return delegate;
	}
	
	public String toString ()
	{
		return String.format (
			"%s {id: %s, title: %s, version: %s, creationDate: %s}", 
			this.getClass ().getSimpleName (), getId (), getTitle (), getVersion (), getCreationDate ()
		);
	}
}
