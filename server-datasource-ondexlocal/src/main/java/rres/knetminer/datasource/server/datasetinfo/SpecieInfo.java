package rres.knetminer.datasource.server.datasetinfo;

import java.util.Objects;

/**
 * TODO: comment me!
 * @author  brandizi <dl><dt>Date:</dt><dd>29 May 2022</dd></dl>
 */
public class SpecieInfo
{
	private String taxId;
	private String commonName;
	private String scientificName;
	
	public SpecieInfo ()
	{
		super ();
	}
	
	public SpecieInfo ( String taxId, String commonName, String scientificName )
	{
		this ();
		this.taxId = taxId;
		this.commonName = commonName;
		this.scientificName = scientificName;
	}
	
	public String getTaxId ()
	{
		return taxId;
	}
	public void setTaxId ( String taxId )
	{
		this.taxId = taxId;
	}
	
	public String getCommonName ()
	{
		return commonName;
	}
	public void setCommonName ( String commonName )
	{
		this.commonName = commonName;
	}
	
	public String getScientificName ()
	{
		return scientificName;
	}
	public void setScientificName ( String scientificName )
	{
		this.scientificName = scientificName;
	}


	@Override
	public int hashCode ()
	{
		return Objects.hash ( taxId, scientificName, commonName );
	}


	@Override
	public boolean equals ( Object obj )
	{
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass () != obj.getClass () ) return false;
		
		SpecieInfo other = (SpecieInfo) obj;
		return Objects.equals ( taxId, other.taxId ) 
			&& Objects.equals ( scientificName, other.scientificName )
			&& Objects.equals ( commonName, other.commonName );
	}

	@Override
	public String toString ()
	{
		return String.format (
			"SpecieInfo {taxId: %s, scientificName: %s, commonName: %s}", taxId, scientificName, commonName
		);
	}
}