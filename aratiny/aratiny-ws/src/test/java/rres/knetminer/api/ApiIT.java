package rres.knetminer.api;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static uk.ac.ebi.utils.exceptions.ExceptionUtils.buildEx;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.util.stream.Stream;

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
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedEventException;
import uk.ac.ebi.utils.xml.XPathReader;


/**
 * Integration test for the ws WAR app. (ie, the Knetminer API).
 * 
 * The tests here invokes the API and check the returned JSON. They are integration tests cause they
 * need that the Maven build launches the ws into the embedded Jetty server.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>11 Feb 2019</dd></dl>
 *
 */
public class ApiIT
{
	private static Logger clog = LogManager.getLogger ( ApiIT.class );
	private Logger log = LogManager.getLogger ( this.getClass () );

	@BeforeClass
	public static void initialDelay () throws InterruptedException
	{
		clog.info ( "Making a pause to give the server time to initialise." );
		Thread.sleep ( 5 * 1000 );
	}
	
	@Test
	public void testCountHits () throws JSONException, IOException, URISyntaxException {
		testCountHits ( "seed" );
	}

	/**
	 * Testing indexing of accessions.
	 */
	@Test
	public void testCountHitsPhraseQuery () throws JSONException, IOException, URISyntaxException {
		testCountHits ( "cell cycle" );
	}
	
	/**
	 * Invokes /countHits with the given keyword and verifies that the result is >0.
	 * This is used by test methods below with various keywords.
	 */
	private void testCountHits ( String keyword ) throws JSONException, IOException, URISyntaxException
	{
		String encKeyword = URLEncoder.encode ( keyword, "UTF-8" );
		JSONObject js = new JSONObject ( IOUtils.toString ( 
			new URI ( System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/countHits?keyword=" + encKeyword ),
			"UTF-8"
		));
		
		Stream.of ( "luceneCount", "luceneLinkedCount", "geneCount" )
		.forEach ( key -> 
		  assertTrue ( 
		  	"countHits for '" + keyword + "' returned a wrong result (" + key + ")!", 
		  	js.getInt ( key ) > 0 )
		);
	}	

	
	@Test
	public void testGenomeGrowth () {
		testGenome ( "growth", "ABI3" );
	}
	
	@Test
	public void testGenomeASK7 () {
		testGenome ( "'AT5G14750'", "ASK7" );
	}

	/**
	 * This is actually run only if we're running the neo4j profile (we receive a flag by Maven, reporting that).
	 */
	@Test
	public void testGenomeNeo4j () 
	{
		if ( !"neo4j".equals ( getMavenProfileId () ) ) {
			log.warn ( "Skipping test for neo4j profile-only" );
			return;
		}
		
		testGenome ( "'Lorem ipsum dolor'", "TEST-GENE-01" );
	}
		
	
	/**
	 * Invokes {@code /genome?keyword=XXX&qtl=}, then verifies the result
	 * (eg, geneCount is > 0, gviewer != null).
	 * 
	 * @param expectedGeneLabel is checked against the 'gviewer' result, 
	 * to see if {@code /genome/feature/geneLabel} has the expected value.
	 * 
	 */
	private void testGenome ( String keyword, String expectedGeneLabel )
	{
		JSONObject js = invokeApi ( "genome", "keyword", keyword, "qtl", new String[0] );
		
		assertTrue ( "geneCount from /genome + " + keyword + " is wrong!", js.getInt ( "geneCount" ) > 0 );
		
		String xmlView = js.getString ( "gviewer" );
		assertNotNull ( "gviewer from /genome + " + keyword + " is null!", xmlView );
		
		XPathReader xpath = new XPathReader ( xmlView );
		
		assertNotNull (
			"Gene " + expectedGeneLabel + " not returned by /genome", 
			xpath.readString ( "/genome/feature[./label = '" + expectedGeneLabel + "']" )
		);
	}
	
	/**
	 * Defaults to true
	 * 
	 * @param callName
	 * @param jsonFields
	 * @return
	 */
	public static JSONObject invokeApi ( String urlOrCallName, Object... jsonFields )
	{
		return invokeApi ( urlOrCallName, true, jsonFields );
	}

	
	/**
	 * Invokes some Knetminer API via URL and returns the JSON that it spawns.
	 * @param callName the call URL, if it doesn't start with http://, the URL is composed by prepending 
	 * 				{@code System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/"}
	 * @param failOnError true if the HTTP request doesn't return the 200 status.
	 * @param jsonFields appended to the HTTP request.
	 * 
	 */
	public static JSONObject invokeApi ( String urlOrCallName, boolean failOnError, Object... jsonFields )
	{
		String url = urlOrCallName.startsWith ( "http://" )
			? urlOrCallName 
			: System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/" + urlOrCallName;
		
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
			return new JSONObject ( jsStr );
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

	@Test
	public void testBadCallError ()
	{
		JSONObject js = invokeApi ( "foo", false, new Object[ 0 ] );
		assertEquals ( "Bad type for the /foo call!", "org.springframework.web.client.HttpClientErrorException", js.getString ( "type" ) );
		assertEquals ( "Bad status for the /foo call!", 400, js.getInt ( "status" ) );
		assertTrue ( "Bad title for the /foo call!", js.getString ( "title" ).contains ( "Bad API call 'foo'" ) );
		assertEquals ( 
			"Bad path for the /foo call!",
			System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/foo", js.getString ( "path" )
		);
		assertTrue ( "Bad detail for the /foo call!", js.getString ( "detail" ).contains ( "KnetminerServer.handle(KnetminerServer" ) );
		assertEquals ( "Bad statusReasonPhrase for the /foo call!", "Bad Request", js.getString ( "statusReasonPhrase" ) );
	}
	
	@Test
	public void testBadParametersCallError ()
	{
		/*
			{
				"status" : 500,
				"detail" : "<the whole stack trace>"
				"title" : "Application error while running countHits: null",
				"statusReasonPhrase" : "Internal Server Error",
				"path" : "http://localhost:9090/ws/aratiny/countHits",
				"type" : "java.lang.RuntimeException"
			}		 
		 */
		JSONObject js = invokeApi ( "countHits", false, new Object[ 0 ] );
		assertEquals ( "Bad type for the /countHits call!", "java.lang.RuntimeException", js.getString ( "type" ) );
		assertEquals ( "Bad status for the /countHits call!", 500, js.getInt ( "status" ) );
		assertTrue ( "Bad title for the /countHits call!", js.getString ( "title" ).contains ( "Application error while running countHits: null" ) );
		assertEquals ( 
			"Bad path for the /countHits call!",
			System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/countHits", js.getString ( "path" )
		);
		assertTrue ( "Bad detail for the /countHits call!", js.getString ( "detail" ).contains ( "classic.QueryParserBase.parse" ) );
		assertEquals ( "Bad statusReasonPhrase for the /countHits call!", "Internal Server Error", js.getString ( "statusReasonPhrase" ) );
	}
	
	@Test
	public void testForbiddenEx ()
	{
		// in this mode it might return a regular answer, not an error
		if ( "console".equals ( getMavenProfileId () ) ) return;
		
		String url = System.getProperty ( "knetminer.api.baseUrl" ) + "/cydebug/traverser/report";
		JSONObject js = invokeApi ( url, false, new Object[ 0 ] );
		assertEquals ( 
			"Bad type for the /cydebug call!",
			"rres.knetminer.datasource.server.CypherDebuggerService$ForbiddenException",
			js.getString ( "type" )
		);
		assertEquals ( "Bad status for the /cydebug call!", 403, js.getInt ( "status" ) );
		assertTrue (
			"Bad title for the /cydebug call!",
			js.getString ( "title" ).contains (
				"Unauthorized. Knetminer must be built with knetminer.backend.cypherDebugger.enabled for this to work"
			)
		);
		assertEquals ( "Bad path for the /cydebug call!", url, js.getString ( "path" ) );
		assertTrue (
			"Bad detail for the /cydebug call!",
			js.getString ( "detail" ).contains (
				"ForbiddenException: Unauthorized. Knetminer must be built with knetminer.backend"
			)
		);
		assertEquals ( "Bad statusReasonPhrase for the /cydebug call!", "Forbidden", js.getString ( "statusReasonPhrase" ) );
	}	
	
	
	/**
	 * It's a pseudo-test that works with the 'run' profile. It just stops the Maven build at the integration-test phase,
	 * so that the test Jetty server is kept on for manual inspection.
	 *  
	 * See the POM for details.
	 */
	@Test
	public void blockingPseudoTest () throws IOException
	{
		if ( !"console".equals ( getMavenProfileId () ) ) return;
		
		log.info ( "\n\n\n\t======= SERVER RUNNING MODE, Press [Enter] key to shutdown =======\n\n" );
		log.info ( "The API should be available at " + System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/" );
		log.info ( "NOTE: DON'T use Ctrl-C to stop the hereby process, I need to run proper shutdown" );
		System.in.read ();
	}
	
	
	/**
	 * Using a property set by it, returns the current profile in use.
	 * This is used by tests like {@link #blockingPseudoTest()} to establish
	 * what to do.
	 */
	public static String getMavenProfileId ()
	{
		String neoPropType = "maven.profileId";
		String result = System.getProperty ( neoPropType, null );
		
		assertNotNull ( "Property '" + neoPropType + "' is null! It must be set on Maven and failsafe plugin", result );
		return result;
	}	
}
