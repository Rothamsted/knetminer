package rres.knetminer.datasource.ondexlocal.config;

import static uk.ac.ebi.utils.exceptions.ExceptionUtils.buildEx;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
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

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.opt.io.IOUtils;

/**
 * TODO: comment me!
 * 
 * TODO: remove the setters
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>29 May 2022</dd></dl>
 *
 */
@JsonAutoDetect ( getterVisibility = Visibility.NONE )
public class DatasetInfo 
{
	private String id;
	private String title;
	private String version;
	private String creationDate;
	private String organization;
	private String provider;
	
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
		
		String defaultCfgPath = root.getDatasetDirPath ();
		
		if ( this.sampleQueriesFilePath == null ) sampleQueriesFilePath = "config/sample-queries.xml";
		sampleQueriesFilePath = KnetminerConfiguration.buildPath ( 
			defaultCfgPath, sampleQueriesFilePath 
		);
		
		if ( this.releaseNotesFilePath == null ) releaseNotesFilePath = "config/release-notes.html";
		releaseNotesFilePath = KnetminerConfiguration.buildPath ( 
			defaultCfgPath, releaseNotesFilePath 
		);

		if ( this.backgroundImageFilePath == null ) backgroundImageFilePath = "config/background.jpg";
		backgroundImageFilePath = KnetminerConfiguration.buildPath ( 
			defaultCfgPath, backgroundImageFilePath 
		);

		// TODO: forbid null
		this.getSpecies ()
		.values ()
		.forEach ( sp -> sp.postConstruct ( root ) );
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

	public void setTitle ( String title )
	{
		this.title = title;
	}

	public String getVersion ()
	{
		return version;
	}

	public void setVersion ( String version )
	{
		this.version = version;
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
	protected void setSpecies ( List<SpecieInfo> species )
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
	
	public Set<String> getTaxIds ()
	{
		return speciesMap.keySet ();
	}
	
	public Map<String, SpecieInfo> getSpecies ()
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

	
	public String getSampleQueriesXML ()
	{
		return IOUtils.readFile ( this.sampleQueriesFilePath );
	}

	public String getReleaseNotesHTML ()
	{
		return IOUtils.readFile ( this.releaseNotesFilePath );
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
