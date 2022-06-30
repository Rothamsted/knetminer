package rres.knetminer.datasource.ondexlocal.config;

import java.util.ArrayList;
import java.util.List;

import org.w3c.dom.DOMException;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.NodeList;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

import uk.ac.ebi.utils.collections.ListUtils;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedValueException;
import uk.ac.ebi.utils.opt.io.IOUtils;
import uk.ac.ebi.utils.xml.XPathReader;

/**
 * TODO: comment me!
 * @author  brandizi <dl><dt>Date:</dt><dd>29 May 2022</dd></dl>
 */
@JsonAutoDetect ( getterVisibility = Visibility.NONE )
public class SpecieInfo
{
	private String taxId;
	private String commonName;
	private String scientificName;
	
	@JsonProperty ( "chromosomeBaseMap" )
	private String baseMapPath;
	
	
	@JsonIgnore
	private List<String> chromosomeIdsCache;
		
	void postConstruct ( KnetminerConfiguration root )
	{
		if ( this.baseMapPath == null ) baseMapPath = "config/specie-" + this.taxId + "/base-map.xml";
		baseMapPath = KnetminerConfiguration.buildPath ( 
				root.getDatasetDirPath (), baseMapPath 
		);
		
		this.initChromosomeIds ();
	}
	
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
	
	public String getCommonName ()
	{
		return commonName;
	}
	
	public String getScientificName ()
	{
		return scientificName;
	}

	public String getBaseMapPath ()
	{
		return baseMapPath;
	}


	@JsonIgnore
	public String getBaseMapXML ()
	{
		return IOUtils.readFile ( baseMapPath );
	}
	
	@JsonIgnore
	public List<String> getChromosomeIds ()
	{
		return this.chromosomeIdsCache;
	}
	
	
	private void initChromosomeIds ()
	{
		XPathReader xpr = new XPathReader ( this.getBaseMapXML () );
		NodeList chrNodes = xpr.readNodeList ( "/genome/chromosome[@index and @number]" );
		
		this.chromosomeIdsCache = new ArrayList<> ();
		for ( int i = 0; i < chrNodes.getLength (); i++ )
		{
			try
			{
				NamedNodeMap attrs = chrNodes.item ( i ).getAttributes ();
				int idx = Integer.valueOf ( attrs.getNamedItem ( "index" ).getNodeValue () ) - 1;
				String chromosomeId = attrs.getNamedItem ( "number" ).getNodeValue ();
				ListUtils.set ( chromosomeIdsCache, idx, chromosomeId );
			}
			catch ( NumberFormatException | DOMException | NullPointerException ex )
			{
				ExceptionUtils.throwEx ( UnexpectedValueException.class, ex,
				  "Error while parsing the chromosome map file for taxId: %s: $cause", taxId
				);
			}
		}
	}
	
	
	@Override
	public String toString ()
	{
		return String.format (
			"SpecieInfo {taxId: %s, scientificName: %s, commonName: %s}", taxId, scientificName, commonName
		);
	}
}