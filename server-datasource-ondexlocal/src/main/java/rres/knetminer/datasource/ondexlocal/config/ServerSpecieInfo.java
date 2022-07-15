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

import rres.knetminer.datasource.server.datasetinfo.DatasetInfoService;
import uk.ac.ebi.utils.collections.ListUtils;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedValueException;
import uk.ac.ebi.utils.opt.io.IOUtils;
import uk.ac.ebi.utils.xml.XPathReader;

/**
 * An extension to {@link SpecieInfo} with more information and methods that are used on the 
 * server side only.
 * 
 * @see DatasetInfo
 * @see DatasetInfoService
 * 
 * @author  brandizi <dl><dt>Date:</dt><dd>29 May 2022</dd></dl>
 */
@JsonAutoDetect ( getterVisibility = Visibility.NONE, fieldVisibility = Visibility.ANY )
public class ServerSpecieInfo implements SpecieInfo
{
	/**
	 * Used internally, to provide a vie for {@link ServerSpecieInfo#asDatasetInfo()}.
	 */
	private class SpecieInfoDelegate implements SpecieInfo
	{
		public String getTaxId ()
		{
			return ServerSpecieInfo.this.getTaxId ();
		}

		public String getCommonName ()
		{
			return ServerSpecieInfo.this.getCommonName ();
		}

		public String getScientificName ()
		{
			return ServerSpecieInfo.this.getScientificName ();
		}

	} // ServerSpecieInfoDelegate

	
	private String taxId;
	private String commonName = "";
	private String scientificName = "";
	
	@JsonProperty ( "chromosomeBaseMap" )
	private String baseMapPath;
	
	@JsonIgnore
	private List<String> chromosomeIdsCache;
	
	@JsonIgnore
	private final SpecieInfo delegate = new SpecieInfoDelegate ();
	
	@Override
	public String getTaxId ()
	{
		return taxId;
	}
	
	@Override
	public String getCommonName ()
	{
		return commonName;
	}
	
	@Override
	public String getScientificName ()
	{
		return scientificName;
	}
	
	/**
	 * @see ServerDatasetInfo#postConstruct(KnetminerConfiguration)
	 */
	void postConstruct ( KnetminerConfiguration root )
	{
		// Relative paths refer to this
		var dsetPath = root.getDatasetDirPath ();
		// null values have this as base path
		String defaultCfgPath = dsetPath + "/config";
		
		// TODO: do we need a per-specie directory?
		// if ( this.baseMapPath == null ) baseMapPath = "config/specie-" + this.taxId + "/base-map.xml";
		if ( this.baseMapPath == null ) baseMapPath = defaultCfgPath + "/species/base-map-" + this.taxId + ".xml";
		baseMapPath = KnetminerConfiguration.buildPath ( 
			dsetPath, baseMapPath 
		);
		
		this.initChromosomeIds ();
	}	
	
	/**
	 * An XML file that is used to feed the chromosome view javascript component in the UI.
	 * Named 'chromosomeBaseMap' on YAML files.
	 */
	public String getBaseMapPath ()
	{
		return baseMapPath;
	}

	/**
	 * Reads {@link #getBaseMapPath()} and returns it as a string.
	 * 
	 * Used in {@link DatasetInfoService#basemapXml(String)}. Note this isn't a YAML field, only the path is.
	 */
	public String getBaseMapXML ()
	{
		return IOUtils.readFile ( baseMapPath );
	}
	
	/**
	 * The list of chromosome IDs coming from {@link #getBaseMapPath()}.
	 * 
	 * Used in {@link DatasetInfoService#chromosomeIds(String)}. Note this isn't a YAML field, only the path is.
	 */
	@JsonIgnore
	public List<String> getChromosomeIds ()
	{
		return this.chromosomeIdsCache;
	}
	
	/**
	 * Offers a simplified view, stripped of server details, to be used by eg, API clients.  
	 * @see DatasetInfo.
	 */
	public SpecieInfo asSpecieInfo ()
	{
		return delegate;
	}
	
	/**
	 * Initialised {@link #chromosomeIdsCache} for calls to {@link #getChromosomeIds()}.
	 */
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
				// expands the list size automatically
				ListUtils.set ( chromosomeIdsCache, idx, chromosomeId );
			}
			catch ( NumberFormatException | DOMException | NullPointerException ex )
			{
				ExceptionUtils.throwEx ( UnexpectedValueException.class, ex,
				  "Error while parsing the chromosome map file for taxId: %s: $cause", this.getTaxId ()
				);
			}
		}
	}		
	
	
	@Override
	public String toString ()
	{
		return String.format (
			"%s {taxId: %s, scientificName: %s, commonName: %s}", 
			this.getClass ().getSimpleName (), getTaxId (), getScientificName (), getCommonName ()
		);
	}
}