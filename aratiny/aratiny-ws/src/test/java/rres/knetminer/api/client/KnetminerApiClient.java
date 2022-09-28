package rres.knetminer.api.client;

import static uk.ac.ebi.utils.exceptions.ExceptionUtils.buildEx;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpException;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.machinezoo.noexception.Exceptions;

import rres.knetminer.api.ApiIT;
import rres.knetminer.datasource.ondexlocal.config.DatasetInfo;
import rres.knetminer.datasource.ondexlocal.config.ServerDatasetInfo;
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
	
	/**
	 * Options for API invocations, which affects several aspects of how the HTTP request is made 
	 * and how the results are processed.
	 */
	public static class RequestOptions
	{
		private boolean failOnError = true;
		private boolean useJsonParams = true;
		
		public RequestOptions () {
			super ();
		}
		
		public static RequestOptions of () {
			return new RequestOptions ();
		}
		
		/**
		 * If true, an HTTP returning other than 20x will throw an exception, else the status code will be
		 * ignored. This is useful for tests and when you want to check the error details.
		 *   
		 * @see ApiIT#testBadCallError() and similar methods about failure cases.
		 */
		public RequestOptions setFailOnError ( boolean failOnError )
		{
			this.failOnError = failOnError;
			return this;
		}

		/**
		 * Many of the Knetminer API calls accepts parameters in the form of JSON objects put in the
		 * request body. This is how the parameters are passed to the server if this flag is true (which 
		 * is the default). When it is false, then parameters are sent in the  
		 * {@link ContentType#APPLICATION_FORM_URLENCODED application/x-www-form-urlencoded} form.
		 */
		public RequestOptions setUseJsonParams ( boolean useJsonParams )
		{
			this.useJsonParams = useJsonParams;
			return this;
		}

		public boolean isFailOnError ()
		{
			return failOnError;
		}

		public boolean isUseJsonParams ()
		{
			return useJsonParams;
		}		
	}
	
		
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
		return new CountHitsApiResult ( invokeApiJs ( "countHits", params ( "keyword", keyword, "taxId", taxId ) ));
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
			
		return new GenomeApiResult ( invokeApiJs (
			"genome",
			params ( "keyword", keyword, "list", geneList, "qtl", genomeRegions, "taxId", taxId ) )
		);		
	}
	
	/**
	 * Invokes the /countLoci API, which is used to count the no. of genes falling within a region.
	 */
	public int countLoci ( String chromosome, int start, int end, String taxId )
	{
		String lociStr = chromosome + '-' + start + '-' + end;
		JSONObject jsResult = invokeApiJs ( "countLoci", params ( "keyword", lociStr, "taxId", taxId ) );
		return jsResult.getInt ( "geneCount" );
	}
	
	/**
	 * Counterpart of {@link DatasetInfoService#datasetInfo() /dataset-info}.
	 */
	public DatasetInfo datasetInfo ()
	{
		// Yes, it's the server class used to serve the client output. It's because
		// ServerDatasetInfo contains the fields in DatasetInfo plus more fields that
		// are used on the server only. asDatasetInfo() yields a view on what's 
		// needed here.
		return invokeApiJsMap ( "dataset-info", ServerDatasetInfo.class, null )
			.asDatasetInfo ();
	}
	
	/**
	 * Counterpart of {@link DatasetInfoService#datasetInfo() /dataset-info/chromosome-ids}.
	 */
	public List<String> chromosomeIds ( String taxId )
	{
		String[] taxIds = invokeApiJsMap ( 
			"dataset-info/chromosome-ids", 
			String[].class, 
			RequestOptions.of ().setUseJsonParams ( false ), 
			params ( "taxId", taxId )
		);
		
		return Arrays.asList ( taxIds );
	}
	
	/**
	 * Counterpart of {@link DatasetInfoService#basemapXml()}.
	 */
	public String basemapXml ( String taxId )
	{
		return invokeApiStr ( 
			"dataset-info/basemap.xml", RequestOptions.of ().setUseJsonParams ( false ), params ( "taxId", taxId )
		);
	}

	/**
	 * Counterpart of {@link DatasetInfoService#sampleQueryXml()}.
	 */
	public String sampleQueryXml ()
	{
		return invokeApiStr ( "dataset-info/sample-query.xml", null );
	}

	/**
	 * Counterpart of {@link DatasetInfoService#releaseNotesHtml()}.
	 */
	public String releaseNotesHtml ()
	{
		return invokeApiStr ( "dataset-info/release-notes.html", null );
	}
	
	/**
	 * Counterpart of {@link DatasetInfoService#backgroundImage()}.
	 */
	public byte[] backgroundImage ()
	{
		return invokeApi (
			"dataset-info/background-image",
			Exceptions.sneak ().<InputStream, byte[]> function ( IOUtils::toByteArray ), 
			RequestOptions.of ().setUseJsonParams ( false ),
			null
		);
	}
	
	
	/**
	 * Default options
	 */
	public <T> T invokeApiJsMap ( String urlOrCallName, Class<? extends T> resultClass, Map<String, Object> params  )
	{
		return invokeApiJsMap ( urlOrCallName, resultClass, RequestOptions.of (), params );
	}
	
	
	/**
	 * Assumes the request returns a JSON string and maps it to a {@code T} object, using {@link ObjectMapper} but this one uses {@link ObjectMapper} 
	 * 
	 */
	public <T> T invokeApiJsMap ( String urlOrCallName, Class<? extends T> resultClass, RequestOptions reqOpts, Map<String, Object> params  )
	{
		var jsmap = new ObjectMapper ();
		Function<InputStream, T> jsMapFunc = Exceptions.sneak ().function ( in -> jsmap.readValue ( in, resultClass ) );
		return invokeApi  ( urlOrCallName, jsMapFunc, reqOpts, params );
	}
	
	
	/**
	 * Default options.
	 */
	public JSONObject invokeApiJs ( String urlOrCallName, Map<String, Object> params )
	{
		return invokeApiJs ( urlOrCallName, RequestOptions.of (), params );
	}

	/** 
	 * Invokes a KnetMiner API that is expected to return a JSON object as root in its result.
	 * 
	 * @see #invokeApiJs(String, Function, RequestOptions, Map)
   *
	 */
	public JSONObject invokeApiJs ( String urlOrCallName, RequestOptions reqOpts, Map<String, Object> params )
	{
		return invokeApiJs ( urlOrCallName, JSONObject::new, reqOpts, params );
	}
	
	
	/**
	 * Default options.
	 */
	public JSONArray invokeApiJsArray ( String urlOrCallName, Map<String, Object> params )
	{
		return invokeApiJsArray ( urlOrCallName, RequestOptions.of (), params ); 
	}
	
	/** 
	 * Invokes a KnetMiner API that is expected to return a JSON array as root in its result.
	 * 
	 * @see #invokeApiJs(String, Function, RequestOptions, Map)
   *
	 */
	public JSONArray invokeApiJsArray ( String urlOrCallName, RequestOptions reqOpts, Map<String, Object> params )
	{
		return invokeApiJs ( urlOrCallName, JSONArray::new, reqOpts, params );
	}
		
	/**
	 * Base method for other invokeApiJsXXX methods.
	 * 
	 * Calls {@link #invokeApiStr(String, RequestOptions, Map)} assuming that the request at issue returns JSON output (object
	 * or array) and uses {@code jsonSupplier} to convert it into a {@link JSONObject} or {@link JSONArray}.
	 *  
	 */
	private <J> J invokeApiJs ( String urlOrCallName, Function<String, J> jsonSupplier, RequestOptions reqOpts, Map<String, Object> params )
	{
		/* DEBUG
		var s = invokeApiStr ( urlOrCallName, reqOpts, params );
		log.info ( "RETURNED JSON:\n{}", s );
		*/
		
		return jsonSupplier.apply ( 
			invokeApiStr ( urlOrCallName, reqOpts, params )
		);
	}
	
	/**
	 * Default options.
	 */
	public String invokeApiStr ( String urlOrCallName, Map<String, Object> params )
	{
		return invokeApiStr ( urlOrCallName, RequestOptions.of (), params );
	}
	
	/**
	 * A wrapper of {@link #invokeApi(String, Function, RequestOptions, Map)} and collects all its output into 
	 * a string. 
	 */
	public String invokeApiStr ( String urlOrCallName, RequestOptions reqOpts, Map<String, Object> params )
	{
		String outStr = invokeApi ( 
			urlOrCallName, 
			Exceptions.sneak ().function ( in -> IOUtils.toString ( in, "UTF-8" ) ), reqOpts, params
		);
		if ( log.isDebugEnabled () ) log.debug ( "Result from <{}>:\n{}", urlOrCallName, outStr );
		return outStr;
	}
	
		
	/**
	 * Low-level invocation of a KnetMiner API.
	 *  
	 * @param urlOrCallName the call name or a straight URL (if it's not a URL, it automatically prefixes {@link #getBaseUrl()}).
	 * @param reqOpts the request options.
	 * @param params the request parameters.
	 * @param outConverter a converter that turns the {@link InputStream} coming from the request output into an instance of T.
	 * @return the API output, in the form of an object of type T
	 */
	private <T> T invokeApi ( 
		String urlOrCallName, Function<InputStream, T> outConverter, RequestOptions reqOpts, Map<String, Object> params 
	)
	{
		String url = urlOrCallName.startsWith ( "http://" )
			? urlOrCallName 
			: getApiUrl ( urlOrCallName );
		
		try
		{
			HttpPost post = new HttpPost ( url );

			if ( params == null ) params = new HashMap<> ();
			
			HttpEntity payload = null;
			
			if ( reqOpts.isUseJsonParams () )
			{
				var js = new JSONObject ( params );
				// This ContentType is UTF-8
				payload = new StringEntity ( js.toString (), ContentType.APPLICATION_JSON );
			}
			else
			{
				// Else, let's use x-www-form-urlencoded
				//
				List<NameValuePair> nvps = params.entrySet ()
				.stream ()
				.filter ( e -> e.getValue () != null )
				.map ( e -> new BasicNameValuePair ( e.getKey (), e.getValue ().toString () ) )
				.collect ( Collectors.toUnmodifiableList () );
				
				payload = new UrlEncodedFormEntity ( nvps, StandardCharsets.UTF_8 );
			}

			post.setEntity ( payload );

			HttpClient client = HttpClientBuilder.create ().build ();

			HttpResponse response = client.execute ( post );
			int httpCode = response.getStatusLine ().getStatusCode ();
			if ( httpCode != 200 ) 
			{				
				// TODO: yield an exception that carries the exception response
				if ( reqOpts.isFailOnError () ) ExceptionUtils.throwEx ( 
					HttpException.class, "Http response code %s is not 200", Integer.valueOf ( httpCode ) 
				);
				log.warn ( "Return code for {} is {}", url, httpCode );				
			}
						
			InputStream in = response.getEntity ().getContent ();
			return outConverter.apply ( in );
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
	 * Prepares API params starting from an array that alternate key/value pairs in its values.
	 */
	public static Map<String, Object> params ( Object ...paramPairs )
	{
		Map<String, Object> result = new HashMap<> ();
		for ( int i = 0; i < paramPairs.length; i++ )
		{
			String key = (String) paramPairs [ i ];
			Object value = paramPairs [ ++ i ];
			if ( value == null ) continue;
			result.put ( key, value );
		}
		
		return result;
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
