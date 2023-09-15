package rres.knetminer.datasource.server.datasetinfo;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import rres.knetminer.datasource.api.config.DatasetInfo;
import rres.knetminer.datasource.api.config.GoogleAnalyticsConfiguration;
import rres.knetminer.datasource.api.config.KnetminerConfiguration;
import rres.knetminer.datasource.ondexlocal.service.DataService;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;
import uk.ac.rothamsted.knetminer.service.KnetMinerInitializer;

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
@RequestMapping (
	// We have made the DS optional, see #753
	path = { "/{ds}/dataset-info", "/dataset-info" }, 
	method = { RequestMethod.GET, RequestMethod.POST }
)
@CrossOrigin
public class DatasetInfoService
{	
	@RequestMapping ( path = "" )
	public DatasetInfo datasetInfo ()
	{
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getServerDatasetInfo ()
			.asDatasetInfo ();
	}

	// TODO: rename and match config
	@RequestMapping ( path = "/basemap.xml", produces = MediaType.APPLICATION_XML_VALUE )
	public String basemapXml (@RequestParam String taxId )
	{		
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getServerDatasetInfo ()
			.getSpecie ( taxId )
			.getBaseMapXML ();
	}

	@RequestMapping ( path = "/sample-query.xml", produces = MediaType.APPLICATION_XML_VALUE )
	public String sampleQueriesXml () // TODO: do we need taxId?
	{
		return OndexServiceProvider.getInstance ()
		.getDataService ()
		.getConfiguration ()
		.getServerDatasetInfo ()
		.getSampleQueriesXML ();
	}
	
	@RequestMapping ( path = "/chromosome-ids" )
	public List<String> chromosomeIds ( @RequestParam String taxId )
	{
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getServerDatasetInfo ()
			.getSpecie ( taxId )
			.getChromosomeIds ();
	}
		
	@RequestMapping ( path = "/background-image" ) 
	public ResponseEntity<byte[]> backgroundImage () // TODO: do we need taxId?
	{
		var dsetInfo = OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getServerDatasetInfo ();
				
		return ResponseEntity
			.ok ()
			.header ( "Content-Type", dsetInfo.getBackgroundImageMIME () )
			.body ( dsetInfo.getBackgroundImage () );
	}
	
	@RequestMapping ( path = "/knetspace-url" ) 
	public String knetSpaceURL ()
	{
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getKnetSpaceURL ();
	}
	
	/**
	 * The measurement ID of the GA account for the client, taken from the server configuration 
	 * file. The credentials are made of several parameters, but the gtag library only needs the
	 * {@link GoogleAnalyticsConfiguration#getMeasurementId() measurement ID}, so we expose that
	 * only.
	 * 
	 * @see KnetminerConfiguration#getGoogleAnalyticsClientConfig()
	 * @see DataService#getConfiguration()
	 * 
	 */
	@RequestMapping ( path = "/google-analytics-id" ) 
	public String getGoogleAnalyticsIdClient ()
	{
		
		return Optional.ofNullable ( OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getGoogleAnalyticsClientConfig () )
		.map ( GoogleAnalyticsConfiguration::getMeasurementId )
		.orElse ( null );
	}
	
	/**
	 * A wrapper of {@link KnetminerConfiguration#getCustomOptions()}.
	 */
	@RequestMapping ( path = "/custom-options" )
	public Map<String, Object> customOptions ()
	{
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getCustomOptions ();
	}
	
	/**
	 * This will return the latest network statistics in JSON format.
	 */
	@RequestMapping ( path = "/network-stats" ) 
	public String networkStats () throws IllegalArgumentException
	{
		try 
		{
			var dataPath = OndexServiceProvider.getInstance ()
					.getDataService ()
					.getConfiguration ()
					.getDataDirPath ();
			
			byte[] encoded = Files.readAllBytes ( Paths.get ( dataPath, KnetMinerInitializer.GRAPH_STATS_FILE_NAME ) );
			return new String ( encoded, Charset.defaultCharset () );
		} 
		catch ( IOException ex) {
			throw new UncheckedIOException ( "Error while fetching latest network view: " + ex.getMessage (), ex ); 
		}
	}
	
}