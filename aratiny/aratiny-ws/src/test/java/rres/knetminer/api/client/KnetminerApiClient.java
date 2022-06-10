package rres.knetminer.api.client;

import static uk.ac.ebi.utils.exceptions.ExceptionUtils.buildEx;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpException;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import rres.knetminer.datasource.server.datasetinfo.DatasetInfo;
import rres.knetminer.datasource.server.datasetinfo.DatasetInfoService;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedEventException;

/**
 * A simple client for the KnetMiner APIs.
 * 
 * TODO: move it to its own module.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>23 May 2022</dd></dl>
 *
 */
public class KnetminerApiClient
{
	private String baseUrl;

	private Logger log = LogManager.getLogger ( this.getClass () );
	
	
	public KnetminerApiClient ( String baseUrl )
	{
		super ();
		if ( !baseUrl.endsWith ( "/" ) ) baseUrl += "/";
		this.baseUrl = baseUrl;
	}

	/**
	 * The /countHits API
	 * @param keyword
	 * @param taxId
	 * @return
	 */
	public CountHitsApiResult countHits ( String keyword, String taxId )
	{
		return new CountHitsApiResult ( invokeApi ( "countHits", params ( "keyword", keyword, "taxId", taxId ) ));
	}
	
	
	/**
	 * The /genome API call.
	 * 
	 * All params can be null, as long as at least one isn't
	 * 
	 * @param keyword the keywords string to search
	 * @param geneList the param 'list'
	 * @param genomeRegions the param 'qtl'. Each element of this should be in the format: "1A:0:390000000:myLabel", 
	 *   the method then turns it into something like "&qtl2=5A:0:590000000:", which is required by the API.
	 *   If you explicitly set the "&qtl", this is then retained.
	 * @param taxId the NCBI specie ID, must be one served by the KnetMiner instance.
	 *   
	 */
	public GenomeApiResult genome ( String keyword, List<String> geneList, List<String> genomeRegions, String taxId )
	{
		// TODO: I removed the need for this from the server, but needs testing
		
//		if ( genomeRegions != null )
//		{
//			for ( int i = 0; i < genomeRegions.size (); i++ )
//			{
//				var reg = genomeRegions.get ( i );
//				if ( reg.startsWith ( "&" ) ) continue;
//				genomeRegions.set ( i, "&qtl=" + i + reg );
//			}
//		}
			
		return new GenomeApiResult ( invokeApi (
			"genome",
			params ( "keyword", keyword, "list", geneList, "qtl", genomeRegions, "taxId", taxId ) )
		);		
	}
	
	/**
	 * Invokes the /countLoci API, which is used to count the no. of genes falling within a region.
	 * @param chromosome
	 * @param start
	 * @param end
	 * @return
	 */
	public int countLoci ( String chromosome, int start, int end, String taxId )
	{
		String lociStr = chromosome + '-' + start + '-' + end;
		JSONObject jsResult = invokeApi ( "countLoci", params ( "keyword", lociStr, "taxId", taxId ) );
		return jsResult.getInt ( "geneCount" );
	}
	
	/**
	 * Counterpart of {@link DatasetInfoService#datasetInfo() /dataset-info}.
	 * 
	 * TODO: not tested yet (tests for {@link DatasetInfoService} will involve this and will be enough.
	 * TODO: similar client methods for the {@link DatasetInfoService} calls. 
	 */
	public DatasetInfo datasetInfo ()
	{
		return invokeMappedApi ( "dataset-info", DatasetInfo.class, true, null );
	}
	
	/**
	 * Counterpart of {@link DatasetInfoService#datasetInfo() /dataset-info/chromosome-ids}.
	 * 
	 */
	public String[] datasetInfo ( String config )
	{
		return invokeMappedApi ( "dataset-info/" + config, String[].class, true, null );
	}
	
	/**
	 * Counterpart of {@link DatasetInfoService#datasetInfo() /dataset-info/basemap.xml,
	 * /dataset-info/sample-query.xml , /dataset-info/release-notes.html }.
	 * 
	 */
	public String datasetInfoStr ( String config )
	{
		return invokeMappedApiStr ( "dataset-info/" + config, true, null );
	}
	
	/**
	 * Defaults to true
	 */
	public JSONObject invokeApi ( String urlOrCallName, JSONObject jsonFields )
	{
		return invokeApi ( urlOrCallName, true, jsonFields );
	}

	/**
	 * Invokes a KnetMiner API that is expected to return a JSON object as root in its result.
	 * 
	 * @see #invokeApiCoreStr(String, boolean, JSONObject)
	 */
	public JSONObject invokeApi ( String urlOrCallName, boolean failOnError, JSONObject jsonFields )
	{
		return invokeApiCore ( urlOrCallName, JSONObject::new, failOnError, jsonFields);
	}
	
	
	/**
	 * Defaults to true.
	 */
	public JSONArray invokeApiArray ( String urlOrCallName, JSONObject jsonFields )
	{
		return invokeApiArray ( urlOrCallName, true, jsonFields ); 
	}
	
	/** 
	 * Invokes a KnetMiner API that is expected to return a JSON array as root in its result.
	 * 
	 * @see #invokeApiCoreStr(String, boolean, JSONObject)
   *
	 */
	public JSONArray invokeApiArray ( String urlOrCallName, boolean failOnError, JSONObject jsonFields )
	{
		return invokeApiCore ( urlOrCallName, JSONArray::new, failOnError, jsonFields);
	}
		
	
	public <J> J invokeApiCore ( String urlOrCallName, Function<String, J> jsonSupplier, boolean failOnError, JSONObject jsonFields )
	{
		return jsonSupplier.apply ( 
			invokeApiCoreStr ( urlOrCallName, failOnError, jsonFields )
		);
	}
	
	/**
	 * Core invocation of Knetminer API call.
	 * 
	 * This is where the things actually happen, the other methods in this class are simple wrappers
	 * to this one.
	 * 
	 * @param urlOrCallName the call name or a straight URL.
	 * @param failOnError if true, yields an exception upon error HTTP codes. 
	 * @param jsonFields the parameters to be sent to the API, using the request body.
	 * @return the API output, which usually is a JSON object or array.
	 */
	public String invokeApiCoreStr ( String urlOrCallName, boolean failOnError, JSONObject jsonFields )
	{
		String url = urlOrCallName.startsWith ( "http://" )
			? urlOrCallName 
			: getApiUrl ( urlOrCallName );
		
		try
		{
			HttpPost post = new HttpPost ( url );

			// some request body must be set, we get an error otherwise 
			if ( jsonFields == null ) jsonFields = new JSONObject ();
			StringEntity jsEntity = new StringEntity ( jsonFields.toString (), ContentType.APPLICATION_JSON );
			post.setEntity ( jsEntity );

			HttpClient client = HttpClientBuilder.create ().build ();

			HttpResponse response = client.execute ( post );
			int httpCode = response.getStatusLine ().getStatusCode ();
			if ( httpCode != 200 ) 
			{				
				// TODO: yield an exception that carries the exception response
				if ( failOnError ) ExceptionUtils.throwEx ( 
					HttpException.class, "Http response code %s is not 200", Integer.valueOf ( httpCode ) 
				);
				log.warn ( "Return code for {} is {}", url, httpCode );				
			}
			
			String jsStr = IOUtils.toString ( response.getEntity ().getContent (), "UTF-8" );
			log.debug ( "JSON got from <{}>:\n{}", url, jsStr );
			return jsStr;
		}
		catch ( IOException | HttpException ex )
		{
			throw buildEx (
				UnexpectedEventException.class,
				"Error while invoking <%s>: %s",
				url,
				ex.getMessage ()
			);
		}
	}			
	
	/**
	 * Like the other invokeApi methods, but this one uses {@link ObjectMapper} to map the resulting JSON 
	 * to the resultClass.
	 * 
	 * TODO: not tested yet (tests for {@link DatasetInfoService} will involve this and will be enough
	 */
	public <T> T invokeMappedApi ( String urlOrCallName, Class<? extends T> resultClass, boolean failOnError, JSONObject jsonFields )
	{
		try
		{
			String jsResultStr = invokeApiCoreStr ( urlOrCallName, failOnError, jsonFields );
			var jsmap = new ObjectMapper ();
			return jsmap.readValue ( jsResultStr, resultClass );
		}
		catch ( JsonProcessingException|RuntimeException ex )
		{
			throw ExceptionUtils.buildEx ( 
				UnexpectedEventException.class, ex, 
				"Error while mapping API call '%s' to %s: %s",
				urlOrCallName, resultClass.getSimpleName (), ex.getMessage ()
			);
		}
	}
	
	/**
	 * Like the other invokeApi methods, but this one uses to invoke dataset info services for xml and html config files 
	 * 
	 */
	public String invokeMappedApiStr ( String urlOrCallName, boolean failOnError, JSONObject jsonFields )
	{
		try
		{
			return invokeApiCoreStr ( urlOrCallName, failOnError, jsonFields );
		}
		catch ( RuntimeException ex )
		{
			throw ExceptionUtils.buildEx ( 
				UnexpectedEventException.class, ex, 
				"Error while mapping API call '%s' : %s",
				urlOrCallName,  ex.getMessage ()
			);
		}
	}
	
	/**
	 * Prepares API params starting from an array that alternate key/value pairs in its values.
	 */
	public static JSONObject params ( Object ...jsonFields )
	{
		JSONObject js = new JSONObject ();
		for ( int i = 0; i < jsonFields.length; i++ )
		{
			String key = (String) jsonFields [ i ];
			Object value = jsonFields [ ++ i ];
			if ( value == null ) continue;
			js.put ( key, value );
		}
		
		return js;
	}
	
	
	/**
	 * Includes the data source name, eg, "http://localhost:8080/ws/aratiny/"
	 */
	public String getBaseUrl ()
	{
		return baseUrl;
	}
	

	/**
	 * Builds the URL of a KnetMiner API invocation, composing path with 
	 * {@link #getBaseUrl()}.
	 *  
	 * If path is null, returns the base URL.
	 */
	public String getApiUrl ( String path )
	{
		return getBaseUrl () + Optional.ofNullable ( path ).orElse ( "" );
	}
	
}
