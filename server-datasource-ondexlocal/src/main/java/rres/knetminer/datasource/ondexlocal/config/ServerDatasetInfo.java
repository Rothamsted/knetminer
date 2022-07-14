package rres.knetminer.datasource.ondexlocal.config;

import static uk.ac.ebi.utils.exceptions.ExceptionUtils.buildEx;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
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
 * @see DatasetInfoService
 * 
 * @author brandizi
 * <dl><dt>Date:</dt><dd>29 May 2022</dd></dl>
 *
 */
@JsonAutoDetect ( getterVisibility = Visibility.NONE, fieldVisibility = Visibility.ANY )
public class ServerDatasetInfo implements DatasetInfo 
{
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

		public String getProvider ()
		{
			return ServerDatasetInfo.this.getProvider ();
		}

		public List<SpecieInfo> getSpecies ()
		{
			return ServerDatasetInfo.this.speciesMap
				.values ()
				.stream ()
				.map ( ServerSpecieInfo::asSpecieInfo )
				.collect ( Collectors.toUnmodifiableList () );
		}

		public String toString ()
		{
			return ServerDatasetInfo.this.toString ();
		}

	} // DatasetInfoDelegate
	
	private String id;
	private String title = "";
	private String description = "";
	private String keywords = "";
	private String version = "";
	private String creationDate = "";
	private String organization = "";
	private String provider = "";
	
	/** This is initialised using {@link #setSpecies(List)} */
	@JsonIgnore
	private Map<String, ServerSpecieInfo> speciesMap = Map.of ();
			
	@JsonProperty ( "sampleQueries" )
	private String sampleQueriesFilePath;
	
	@JsonProperty ( "releaseNotes" )
	private String releaseNotesFilePath;
	
	@JsonProperty ( "backgroundImage" )
	private String backgroundImageFilePath;
	
	@JsonIgnore
	private DatasetInfo delegate = new DatasetInfoDelegate ();	
	

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

	@Override
	public String getProvider ()
	{
		return provider;
	}


	/**
	 * This is an initialiser for Jackson, which creates the {@link #speciesMap internal species map}.
	 */
	@JsonProperty
	protected void setSpecies ( List<ServerSpecieInfo> species )
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
	
	public Set<String> getTaxIds ()
	{
		return speciesMap.keySet ();
	}
	
	public Map<String, ServerSpecieInfo> getSpeciesMap ()
	{
		return speciesMap;
	}
	
	public ServerSpecieInfo getSpecie ( String taxId )
	{
		return speciesMap.get ( taxId );
	}
	
	public boolean containsTaxId ( String taxId )
	{
		return speciesMap.containsKey ( taxId );
	}
	
	public String getSampleQueriesFilePath ()
	{
		return sampleQueriesFilePath;
	}
	
	public String getSampleQueriesXML ()
	{
		return IOUtils.readFile ( this.sampleQueriesFilePath );
	}
	

	public String getReleaseNotesFilePath ()
	{
		return releaseNotesFilePath;
	}

	public String getReleaseNotesHTML ()
	{
		return IOUtils.readFile ( this.releaseNotesFilePath );
	}
	
	public String getBackgroundImageFilePath ()
	{
		return backgroundImageFilePath;
	}
	
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
	
	
	@Override
	public String toString ()
	{
		return String.format (
			"%s {id: %s, title: %s, version: %s, creationDate: %s}", 
			this.getClass ().getSimpleName (), id, title, version, creationDate
		);
	}
	
	public DatasetInfo asDatasetInfo ()
	{
		return delegate;
	}
	
}
