package rres.knetminer.datasource.server.datasetinfo;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
	@RequestMapping ( path = "" )
	public DatasetInfo datasetInfo ()
	{
		return null;
	}

	@RequestMapping ( path = "/basemap.xml", produces = MediaType.APPLICATION_XML_VALUE )
	public String basemapXml ( @RequestParam String taxId )
	{
		return null;
	}

	@RequestMapping ( path = "/sample-query.xml", produces = MediaType.APPLICATION_XML_VALUE )
	public String sampleQueryXml () // TODO: do we need taxId?
	{
		return null;
	}
	
	@RequestMapping ( path = "/chromosome-ids" )
	public List<String> chromosomeIds ( @RequestParam String taxId )
	{
		// TODO: Use XPath and parse them from basemap.xml (initially here, later on some utility function)
		// TODO: check the right output is returned (a JSON array)
		// uk.ac.ebi.utils.xml.XPathReader might be useful
		return null;
	}
	
	@RequestMapping ( path = "/release-notes.html", produces = MediaType.TEXT_HTML_VALUE )
	public String releaseNotesHtml ()
	{
		return null;
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
	
}
