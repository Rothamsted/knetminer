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
 * Various information about the dataset that Knetminer is serving.
 * 
 * This is used in all of {@link DatasetInfoService}, {@link KnetminerConfiguration} and KnetminerApiCli.
 * 
 * TODO: we need to split it into a top-level generic class, which is useful to ser API service, and
 * a server-specific extension, which can be used to deal with the configuration.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>29 May 2022</dd></dl>
 *
 */
@JsonAutoDetect ( getterVisibility = Visibility.NONE, fieldVisibility = Visibility.ANY )
public class DatasetInfo 
{
	private String id;
	private String title = "";
	private String description = "";
	private String keywords = "";
	private String version = "";
	private String creationDate = "";
	private String organization = "";
	private String provider = "";
	
	@JsonProperty ( "sampleQueries" )
	private String sampleQueriesFilePath;
	
	@JsonProperty ( "releaseNotes" )
	private String releaseNotesFilePath;
	
	@JsonProperty ( "backgroundImage" )
	private String backgroundImageFilePath;
	
	@JsonIgnore
	private KnetminerConfiguration root;
	
	/** This is initialised using {@link #setSpecies(List)} */
	@JsonIgnore
	private Map<String, SpecieInfo> speciesMap = Map.of ();
	
	void postConstruct ( KnetminerConfiguration root )
	{
		this.root = root;
		
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
		for ( var sp: this.getSpeciesMap ().values () )
			sp.postConstruct ( root );
	}
	
	
	public DatasetInfo ()
	{
		super ();
	}

	/**
	 * This is the old data source name
	 */
	public String getId ()
	{
		return id;
	}

	public String getTitle ()
	{
		return title;
	}
	
	public String getDescription ()
	{
		return description;
	}

	public String getKeywords ()
	{
		return keywords;
	}

	public String getVersion ()
	{
		return version;
	}

	public String getCreationDate ()
	{
		return creationDate;
	}

	public String getOrganization ()
	{
		return organization;
	}

	public String getProvider ()
	{
		return provider;
	}


	/**
	 * This is an initialiser for Jackson, which creates the {@link #speciesMap internal species map}.
	 */
	@JsonProperty
	private void setSpecies ( List<SpecieInfo> species )
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
	
	@JsonProperty
	public List<SpecieInfo> getSpecies ()
	{
		return Collections.unmodifiableList ( new ArrayList<> ( speciesMap.values () ) );
	}
	
	public Set<String> getTaxIds ()
	{
		return speciesMap.keySet ();
	}
	
	public Map<String, SpecieInfo> getSpeciesMap ()
	{
		return speciesMap;
	}
	
	public SpecieInfo getSpecie ( String taxId )
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
			"DatasetInfo {id: %s, title: %s, version: %s, creationDate: %s}", 
			id, title, version, creationDate
		);
	}

}
