package rres.knetminer.datasource.ondexlocal.config;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

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
public class DatasetInfo 
{
	private String title;
	private String version;
	private String creationDate;
	private String organization;
	private String provider;
	private List<SpecieInfo> species = new ArrayList<> ();
	
	@JsonProperty ( "sampleQueries" )
	private String sampleQueriesFilePath;
	
	@JsonProperty ( "releaseNotes" )
	private String releaseNotesFilePath;
	
	@JsonProperty ( "backgroundImage" )
	private String backgroundImageFilePath;
	
	@JsonIgnore
	private KnetminerConfiguration root;
	
	
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

		if ( this.species == null ) return;
		species.forEach ( sp -> sp.postConstruct ( root ) );
	}
	
	
	public DatasetInfo ()
	{
		super ();
	}

	public DatasetInfo ( String title )
	{
		this ();
		this.title = title;
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

	public void setCreationDate ( String creationDate )
	{
		this.creationDate = creationDate;
	}

	public String getOrganization ()
	{
		return organization;
	}

	public void setOrganization ( String organization )
	{
		this.organization = organization;
	}

	public String getProvider ()
	{
		return provider;
	}

	public void setProvider ( String provider )
	{
		this.provider = provider;
	}

	public List<SpecieInfo> getSpecies ()
	{
		return species;
	}

	public void setSpecies ( List<SpecieInfo> species )
	{
		this.species = species;
	}

	@JsonIgnore
	public String getSampleQueriesXML ()
	{
		return IOUtils.readFile ( this.sampleQueriesFilePath );
	}

	@JsonIgnore
	public String getReleaseNotesHTML ()
	{
		return IOUtils.readFile ( this.releaseNotesFilePath );
	}
	
	@JsonIgnore
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

	@JsonIgnore
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
			"DatasetInfo {title: %s, version: %s, creationDate: %s}", 
			title, version, creationDate
		);
	}

}
