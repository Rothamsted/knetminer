package rres.knetminer.datasource.server.graphinfo;

import static org.junit.Assert.assertNotNull;
import static uk.ac.ebi.utils.exceptions.ExceptionUtils.buildEx;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URLEncoder;

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
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedEventException;

public class GraphInfoApiIT {
	
	private static Logger clog = LogManager.getLogger ( GraphInfoApiIT.class );
	
	private Logger log = LogManager.getLogger ( this.getClass () );
	
	private static Logger slog = LogManager.getLogger ( GraphInfoApiIT.class );

	@BeforeClass
	/**
	 * Keeps probing the API server until it seems initialized. 
	 * Ran before anything else, in order to have it up and running.
	 */
	public static void synchToServer () throws Exception
	{
		clog.info ( "Waiting for server init." );
		Thread.sleep ( 20 * 1000 );
		
		for ( int attempt = 1; attempt <= 4; )
		{
			slog.info ( "Waiting for the API server, attempt {}", attempt++ );
			JSONArray js = invokeApiFailOpt ( "graphinfo/concept-info?ids=6652015", false );
			if ( js.length()>0 ) return;
			throw new HttpException ( "Error from the API server:\n" +  js.toString () );
		}
		throw new HttpException ( "API server didn't initialise in time" ); 
	}
	
	
	@Test
	public void testGraphInfo ()
	{
		JSONArray js = invokeApiFailOpt ( "http://localhost:9090/ws/graphinfo/concept-info?ids=6652015", false, "ids", "*" );
		
		log.info ( "JSON from GraphInfo API:\n{}", js.toString () );
		assertNotNull( "No accessions in the result", ((JSONObject)js.get(0)).get("accessions") );
	}
	
	/**
	 * Testing GraphInfo of an id.
	 */
	@Test
	public void testGraphInfoId () throws JSONException, IOException, URISyntaxException {
		testGraphInfo ( "6652015" );
	}
	
	/**
	 * Invokes /GraphInfo with the given id and verifies that the result present accessions.
	 * This is used by test methods below with various id.
	 */
	private void testGraphInfo ( String ids ) throws JSONException, IOException, URISyntaxException
	{
		String id = URLEncoder.encode ( ids, "UTF-8" );
		
		JSONArray js = invokeApiFailOpt ( System.getProperty ( "knetminer.api.baseUrl" ) + 
				"/graphinfo/concept-info?ids=" + id , false, "ids", "*" );
		
		log.info ( "JSON from GraphInfo API:\n{}", js.toString () );
		assertNotNull( "No accessions in the result", ((JSONObject)js.get(0)).get("accessions") );
	}	
	
	/**
	 * Invokes some KnetMiner API via URL and returns the JSON that it spawns.
	 * @param callName the call URL, if it doesn't start with http://, the URL is composed by prepending 
	 * 				{@code System.getProperty ( "knetminer.api.baseUrl" ) }
	 * @param failOnError true if the HTTP request doesn't return the 200 status.
	 * @param jsonFields appended to the HTTP request.
	 * 
	 */
	public static  JSONArray invokeApiFailOpt ( String urlOrCallName, boolean failOnError, Object... jsonFields )
	{
		String url = urlOrCallName.startsWith ( "http://" )
			? urlOrCallName 
			: System.getProperty ( "knetminer.api.baseUrl" ) + "/" + urlOrCallName;
		
		try
		{
			JSONObject js = new JSONObject ();
			for ( int i = 0; i < jsonFields.length; i++ )
				js.put ( (String) jsonFields [ i ], jsonFields [ ++i ] );
			 
			HttpPost post = new HttpPost ( url );
			StringEntity jsEntity = new StringEntity( js.toString (), ContentType.APPLICATION_JSON );
			post.setEntity ( jsEntity );

			HttpClient client = HttpClientBuilder.create ().build ();

			HttpResponse response = client.execute ( post );
			int httpCode = response.getStatusLine ().getStatusCode ();
			if ( httpCode != 200 ) 
			{
				if ( failOnError ) ExceptionUtils.throwEx ( 
					HttpException.class, "Http response code %s is not 200", Integer.valueOf ( httpCode ) 
				);
				clog.warn ( "Return code for {} is {}", url, httpCode );				
			}
			
			String jsStr = IOUtils.toString ( response.getEntity ().getContent (), "UTF-8" );
			clog.info ( "JSON got from <{}>:\n{}", url, jsStr );
			return new JSONArray ( jsStr );
		}
		catch ( JSONException | IOException | HttpException ex )
		{
			throw buildEx (
				UnexpectedEventException.class,
				"Error while invoking <%s>: %s",
				url,
				ex.getMessage ()
			);
		}
	}	
}
