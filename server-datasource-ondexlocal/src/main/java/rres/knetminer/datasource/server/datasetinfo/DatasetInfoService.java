package rres.knetminer.datasource.server.datasetinfo;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.xml.xpath.XPathExpressionException;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.DOMException;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedValueException;
import uk.ac.ebi.utils.xml.XPathReader;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>29 May 2022</dd></dl>
 *
 */
@RestController
@RequestMapping ( path = "/{ds}/dataset-info", method = { RequestMethod.GET, RequestMethod.POST }  )
@CrossOrigin
public class DatasetInfoService
{
	/** TODO: remove once we use real data. */
	private String mockupDirPath = "src/test/resources/tmp-mockup";
	
	@RequestMapping ( path = "" )
	public DatasetInfo datasetInfo ()
	{
		// TODO: mockup data that need to be replaced with a real fetch from config
		return new DatasetInfo () {
			{
				this.setTitle ( "Aratiny dataset" );
				this.setOrganization ( "Rothamsted Research" );
				this.setProvider ( "Rothamsted Research" );
				this.setReferenceGenomeProvided ( true );
				this.setSpecies ( List.of (
					new SpecieInfo ( "3702", "Thale cress", "Arabidopsis Thaliana" ),
					new SpecieInfo ( "4565", "Bread Wheat", "Triticum aestivum" ),
					new SpecieInfo ( "4577", "Maize", "Zea mays" ) 
				));
				this.setCreationDate ( LocalDateTime.now ().toString () );
				this.setVersion ( "51" );
			}
		};
	}

	@RequestMapping ( path = "/basemap.xml", produces = MediaType.APPLICATION_XML_VALUE )
	public String basemapXml (@RequestParam String taxId )
	{
		return readMockupBaseMap ( taxId );
	}

	@RequestMapping ( path = "/sample-query.xml", produces = MediaType.APPLICATION_XML_VALUE )
	public String sampleQueryXml () // TODO: do we need taxId?
	{
		return readMockupFile("sampleQuery.xml");
	}
	
	@RequestMapping ( path = "/chromosome-ids" )
	public List<String> chromosomeIds ( @RequestParam String taxId )
	{
		String basemapString = readMockupBaseMap ( taxId );
		XPathReader xpr = new XPathReader ( basemapString );
		NodeList chrNodes = xpr.readNodeList ( "/genome/chromosome[@index and @number]" );
		List<String> chrIds = new ArrayList<> ();
		for ( int i = 0; i < chrNodes.getLength (); i++ )
		{
			try
			{
				NamedNodeMap attrs = chrNodes.item ( i ).getAttributes ();
				int idx = Integer.valueOf ( attrs.getNamedItem ( "index" ).getNodeValue () );
				String chromosomeId = attrs.getNamedItem ( "number" ).getNodeValue ();
				chrIds.set ( idx, chromosomeId );
			}
			catch ( NumberFormatException | DOMException | NullPointerException ex )
			{
				ExceptionUtils.throwEx ( UnexpectedValueException.class, ex,
				  "Error while parsing the chromosome map file for taxId: %s: %s",
				  taxId, ex.getMessage ()
				);
			}
		}
		return chrIds;
	}
	
	@RequestMapping ( path = "/release-notes.html", produces = MediaType.TEXT_HTML_VALUE )
	public String releaseNotesHtml ()
	{
		return readMockupFile("release_notes.html");
	}
	
	@RequestMapping ( path = "/background-image" ) 
	public ResponseEntity<byte[]> getBackgroundImage () // TODO: do we need taxId?
	{
		try
		{
			Path bkgPath = Path.of ( mockupDirPath + "/background.jpg" );
			String mime = Files.probeContentType ( bkgPath );
			byte[] content = Files.readAllBytes ( bkgPath );
			bkgPath.toFile ();
			
			return ResponseEntity
				.ok ()
				.header ( "Content-Type", mime )
				.body ( content );
		}
		catch ( IOException ex )
		{
			throw new UncheckedIOException (
				"Error while fetching application background: " + ex.getMessage (),
				ex 
			);
		}
	}
	
	private String readMockupBaseMap ( String taxId )
	{
		try {
			return Files.readString ( Path.of ( mockupDirPath + "/basemap-" + taxId + ".xml" ) );
		}
		catch ( IOException ex )
		{
			throw ExceptionUtils.buildEx ( 
				UncheckedIOException.class, ex, 
				"Error while reading basemap file for taxId %s", taxId
			);
		}
	}
	
	private String readMockupFile ( String fileName )
	{
		try {
			return Files.readString ( Path.of ( mockupDirPath + "/" + fileName ) );
		}
		catch ( IOException ex )
		{
			throw ExceptionUtils.buildEx ( 
				UncheckedIOException.class, ex, 
				"Error while reading mock-up file \"%s\"", fileName
			);
		}
	}
	
}