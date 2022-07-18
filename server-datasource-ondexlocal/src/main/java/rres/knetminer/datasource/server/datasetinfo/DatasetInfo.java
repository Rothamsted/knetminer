package rres.knetminer.datasource.server.datasetinfo;

import java.util.List;
import java.util.Objects;

/**
 * TODO: comment me!
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
	private List<SpecieInfo> species;
	private boolean isReferenceGenomeProvided;
	
	
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
	
	public boolean isReferenceGenomeProvided ()
	{
		return isReferenceGenomeProvided;
	}

	public void setReferenceGenomeProvided ( boolean isReferenceGenomeProvided )
	{
		this.isReferenceGenomeProvided = isReferenceGenomeProvided;
	}

	
	
	@Override
	public int hashCode ()
	{
		return Objects.hash ( title, version, creationDate, organization, provider, species, isReferenceGenomeProvided );
	}

	@Override
	public boolean equals ( Object obj )
	{
		if ( this == obj )
			return true;
		if ( obj == null )
			return false;
		if ( getClass () != obj.getClass () )
			return false;
		DatasetInfo other = (DatasetInfo) obj;
		
		return Objects.equals ( title, other.title )
			&& Objects.equals ( version, other.version ) 
			&& Objects.equals ( creationDate, other.creationDate ) 
			&& Objects.equals ( organization, other.organization )
			&& Objects.equals ( provider, other.provider )
			&& Objects.equals ( species, other.species )
			&& Objects.equals ( isReferenceGenomeProvided, other.isReferenceGenomeProvided );
			
	}

	@Override
	public String toString ()
	{
		return String.format (
			"DatasetInfo {title: %s, version: %s, creationDate: %s, organization: %s, provider: %s, species: %s, isReferenceGenomeProvided: %s}", 
			title, version, creationDate, organization, provider, species, isReferenceGenomeProvided
		);
	}

}
