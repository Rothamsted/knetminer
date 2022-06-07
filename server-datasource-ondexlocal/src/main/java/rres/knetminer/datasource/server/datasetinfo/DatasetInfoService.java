package rres.knetminer.datasource.server.datasetinfo;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
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
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

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
	private String location = "src/test/resources/tmp-mockup";
	
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
	public String basemapXml (@RequestParam String taxId ) throws IOException
	{
		return readBaseMapXML ( taxId );
	}

	@RequestMapping ( path = "/sample-query.xml", produces = MediaType.APPLICATION_XML_VALUE )
	public String sampleQueryXml () throws IOException // TODO: do we need taxId?
	{
		return readResourceFile("sampleQuery.xml");
	}
	
	@RequestMapping ( path = "/chromosome-ids" )
	public List<String> chromosomeIds ( @RequestParam String taxId ) throws IOException, XPathExpressionException
	{
		String basemapString = readBaseMapXML(taxId);
		XPathReader xpr = new XPathReader ( basemapString );
		NodeList list = xpr.readNodeList ( "/genome/chromosome[@index]" );
		
		List<String> indexes  = IntStream.range ( 0, list.getLength () )
                .mapToObj ( list::item ).map ( Node::getAttributes )
                .map ( a->a.getNamedItem("index") ).map ( Node::getNodeValue ).collect ( Collectors.toList () );
		
		return indexes;
	}
	
	@RequestMapping ( path = "/release-notes.html", produces = MediaType.TEXT_HTML_VALUE )
	public String releaseNotesHtml () throws IOException
	{
		return readResourceFile("release_notes.html");
	}
	
	@RequestMapping ( path = "/background-image" ) 
	public ResponseEntity<byte[]> getBackgroundImage () // TODO: do we need taxId?
	{
		try
		{
			Path bkgPath = Path.of ( "TODO: fetch this from config" );
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
	
	private String readBaseMapXML ( String taxId ) throws IOException {
		return Files.readString ( Path.of ( location + "/basemap-" + taxId + ".xml" ) );
	}
	
	private String readResourceFile ( String file ) throws IOException {
		return Files.readString ( Path.of ( location + "/" + file ) );
	}
	
}