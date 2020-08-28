package rres.knetminer.api;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static uk.ac.ebi.utils.exceptions.ExceptionUtils.buildEx;

import java.io.IOException;
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
	 * Invokes some Knetminer API via URL and returns the JSON that it spawns.
	 * @param callName appended to {@code System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/"}
	 * @param jsonFields appended to the HTTP request.
	 * 
	 */
	public static JSONObject invokeApi ( String callName, Object... jsonFields )
	{
		String url = System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/" + callName;
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
			if ( httpCode != 200 ) ExceptionUtils.throwEx ( 
				HttpException.class, "Http response code %s is not 200", Integer.valueOf ( httpCode ) 
			);
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
