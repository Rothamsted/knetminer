package rres.knetminer.datasource.server.datasetinfo;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import rres.knetminer.datasource.ondexlocal.config.DatasetInfo;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;

/**
 * The API service to get information about the running data set.
 * 
 * Some details <a href = "https://github.com/Rothamsted/knetminer/issues/641">here</a>.
 * 
 * TODO: update API documentation.
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
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getDatasetInfo ();
	}

	// TODO: rename and match config
	@RequestMapping ( path = "/basemap.xml", produces = MediaType.APPLICATION_XML_VALUE )
	public String basemapXml (@RequestParam String taxId )
	{
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getDatasetInfo ()
			.getSpecie ( taxId )
			.getBaseMapXML ();
	}

	@RequestMapping ( path = "/sample-query.xml", produces = MediaType.APPLICATION_XML_VALUE )
	public String sampleQueriesXml () // TODO: do we need taxId?
	{
		return OndexServiceProvider.getInstance ()
		.getDataService ()
		.getConfiguration ()
		.getDatasetInfo ()
		.getSampleQueriesXML ();
	}
	
	@RequestMapping ( path = "/chromosome-ids" )
	public List<String> chromosomeIds ( @RequestParam String taxId )
	{
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getDatasetInfo ()
			.getSpecie ( taxId )
			.getChromosomeIds ();
	}
	
	@RequestMapping ( path = "/release-notes.html", produces = MediaType.TEXT_HTML_VALUE )
	public String releaseNotesHTML ()
	{
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getDatasetInfo ()
			.getReleaseNotesHTML ();
	}
	
	@RequestMapping ( path = "/background-image" ) 
	public ResponseEntity<byte[]> backgroundImage () // TODO: do we need taxId?
	{
		var dsetInfo = OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getDatasetInfo ();
				
		return ResponseEntity
			.ok ()
			.header ( "Content-Type", dsetInfo.getBackgroundImageMIME () )
			.body ( dsetInfo.getBackgroundImage () );
	}
	
	// TODO: some of these calls are more for a /configuration service
	@RequestMapping ( path = "/knetspace-url" ) 
	public String knetSpaceURL ()
	{
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getKnetSpaceURL ();
	}
}