package rres.knetminer.api;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static uk.ac.ebi.utils.exceptions.ExceptionUtils.buildEx;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.util.List;
import java.util.stream.Stream;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
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
import uk.ac.ebi.utils.exceptions.NotReadyException;
import uk.ac.ebi.utils.exceptions.UnexpectedEventException;
import uk.ac.ebi.utils.opt.springweb.exceptions.ResponseStatusException2;
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
	private static Logger slog = LogManager.getLogger ( ApiIT.class );

	@BeforeClass
	/**
	 * Keeps probing the API server until it seems initialised. 
	 * Ran before anything else, in order to have it up and running.
	 */
	public static void synchToServer () throws Exception
	{
		clog.info ( "Waiting for server init." );
		Thread.sleep ( 20 * 1000 );
		
		for ( int attempt = 1; attempt <= 4; attempt++ )
		{
			slog.info ( "Waiting for the API server, attempt {}", attempt );
			JSONObject js = invokeApiFailOpt ( "countHits?keyword=foo", false );
			if ( js.has ( "luceneCount" ) ) return;
			if ( js.has ( "type" ) && NotReadyException.class.getName ().equals ( js.getString ( "type" ) ) )
			{
				Thread.sleep ( 10 * 1000 );
				continue;
			}
			throw new HttpException ( "Error from the API server:\n" +  js.toString () );
		}
		throw new HttpException ( "API server didn't initialise in time" ); 
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
		testGenome ( "growth", "ILR1" );
	}
	
	@Test
	public void testGenomeWithAccession () {
		testGenome ( "\"NuDt19\"", "NUDT19" );
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

	
	@Test
	public void testGeneFilter () 
	{
		Stream.of ( "MIR172B", "MIR172A", "at1g07350", "MBD12", "MBD3", "MBD5" )
		.forEach ( expectedGeneLabel ->
			testGenome ( "flowering FLC FT", expectedGeneLabel, "MIR*", "at1g07350", "mBd*"	)
		);
	}

	
	@Test
	public void testEvidence ()
	{
		JSONObject js = invokeApi ( "genome", "keyword", "response" );
		assertNotNull ( "No JSON returned!", js );
		assertTrue ( "No evidenceTable in the result", js.has ( "evidenceTable" ) );
		String evidenceTable = StringUtils.trimToNull ( js.getString ( "evidenceTable" ) );
		assertNotNull ( "evidenceTable is null/empty!", evidenceTable );
		
		var rows = List.of ( evidenceTable.split ( "\n" ) );
		var rowFound = rows.stream ().anyMatch ( row -> 
		{
			var cols = row.split ( "\t" );
			if ( !"Trait".equals ( cols [ 0 ]) ) return false;
			if ( !"disease resistance".equals ( cols [ 1 ]) ) return false;
			if ( NumberUtils.toDouble ( cols [ 2 ] ) <= 0d ) return false; // score
			if ( NumberUtils.toInt ( cols [ 7 ] ) < 0 ) return false; // ondexId
			return true;
		});
		assertTrue ( "Expected evidence table row not found!", rowFound );
	}
	
	@Test
	public void testEvidenceFilters ()
	{
		JSONObject js = invokeApi ( 
			"genome", 
			"keyword", "growth OR \"process\" OR \"seed growth\"",
			"list", new String [] { "vps*", "tpr2", "AT4G35020" }
		);
		assertNotNull ( "No JSON returned!", js );
		assertTrue ( "No evidenceTable in the result", js.has ( "evidenceTable" ) );
		String evidenceTable = StringUtils.trimToNull ( js.getString ( "evidenceTable" ) );
		assertNotNull ( "evidenceTable is null/empty!", evidenceTable );
		
		var rows = List.of ( evidenceTable.split ( "\n" ) );
		assertEquals ( "Wrong no. of rows for filtered genes!", 4, rows.size () );
		
		var rowFound = rows.stream ().anyMatch ( row ->
		{
			var cols = row.split ( "\t" );
			if ( !"BioProc".equals ( cols [ 0 ]) ) return false;
			if ( !"Regulation Of Transcription...".equals ( cols [ 1 ]) ) return false;
			if ( NumberUtils.toDouble ( cols [ 2 ] ) <= 0d ) return false; // score
			if ( NumberUtils.toInt ( cols [ 4 ] ) <= 0 ) return false; // genes count
			if ( !"AT3G16830".equals ( cols [ 5 ] ) ) return false; // genes
			return true;
		});
		assertTrue ( "Expected evidence table row not found (single gene)!", rowFound );
		
		rowFound = rows.stream ().anyMatch ( row ->
		{
			var cols = row.split ( "\t" );
			if ( !"BioProc".equals ( cols [ 0 ]) ) return false;
			if ( !"Vesicle-mediated Transport".equals ( cols [ 1 ]) ) return false;
			if ( NumberUtils.toDouble ( cols [ 2 ] ) <= 0d ) return false; // score
			if ( NumberUtils.toInt ( cols [ 4 ] ) <= 0 ) return false; // genes count
			var genes = cols [ 5 ].split ( "," ); // genes
			if ( genes == null ) return false;
			if ( !"neo4j".equals ( getMavenProfileId () ) )
			{
				if ( genes.length != 3 ) return false;
				if ( !ArrayUtils.contains ( genes, "AT1G03950" ) ) return false;
				if ( !ArrayUtils.contains ( genes, "AT5G44560" ) ) return false;
				if ( !ArrayUtils.contains ( genes, "AT2G19830" ) ) return false;
				return true;
			}
			// Neo4j queries are slightly different
			if ( genes.length != 2 ) return false;
			if ( !ArrayUtils.contains ( genes, "AT2G19830" ) ) return false;
			if ( !ArrayUtils.contains ( genes, "AT3G10640" ) ) return false;
			return true;
		});
		assertTrue ( "Expected evidence table row not found (multi-genes)!", rowFound );
	}
	

	
	
	@Test
	public void testBadCallError ()
	{
		JSONObject js = invokeApiFailOpt ( "foo", false );
		assertEquals ( 
			"Bad type for the /foo call!", 
			ResponseStatusException2.class.getName (),
			js.getString ( "type" )
		);
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
				"title" : "Bad parameters passed to the API call 'countHits': Internal error while searching over Ondex index: 
				  Cannot parse '*': '*' or '?' not allowed as first character in WildcardQuery (HTTP 400 BAD_REQUEST)",
				"type" : "uk.ac.ebi.utils.opt.springweb.exceptions.ResponseStatusException2",
				"status" : 400,
   			"statusReasonPhrase" : "Bad Request",				
				"path" : "http://localhost:9090/ws/aratiny/countHits",
   			"detail" : "<the whole stack trace>"
			}
		 */
		JSONObject js = invokeApiFailOpt ( "countHits", false, "keyword", "*" );
		log.info ( "JSON from bad parameter API:\n{}", js.toString () );
		assertEquals ( "Bad type for the /countHits call!", "uk.ac.ebi.utils.opt.springweb.exceptions.ResponseStatusException2", js.getString ( "type" ) );
		assertEquals ( "Bad status for the /countHits call!", 400, js.getInt ( "status" ) );
		assertTrue (
			"Bad title for the /countHits call!", 
			js.getString ( "title" )
			.contains ( "Cannot parse '*': '*' or '?' not allowed as first character in WildcardQuery" )
		);
		assertEquals ( 
			"Bad path for the /countHits call!",
			System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/countHits", js.getString ( "path" )
		);
		assertTrue ( "Bad detail for the /countHits call!", js.getString ( "detail" ).contains ( "classic.QueryParserBase.parse" ) );
		assertEquals ( "Bad statusReasonPhrase for the /countHits call!", "Bad Request", js.getString ( "statusReasonPhrase" ) );
	}
	
	@Test
	public void testForbiddenEx ()
	{
		// in this mode it might return a regular answer, not an error
		if ( "console".equals ( getMavenProfileId () ) ) return;
		
		String url = System.getProperty ( "knetminer.api.baseUrl" ) + "/cydebug/traverser/report";
		JSONObject js = invokeApiFailOpt ( url, false );
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
	 * Invokes {@code /genome?keyword=XXX&qtl=}, then verifies the result
	 * (eg, geneCount is > 0, gviewer != null).
	 * 
	 * @param expectedGeneLabel is checked against the 'gviewer' result, 
	 * to see if {@code /genome/feature/geneLabel} has the expected value.
	 * 
	 * @param geneAccFilters (optional), the list of genes to restrict the search on. This is 
	 * the same as the "Gene List Search" box, it's case-insensitive and can contains Lucene 
	 * wildcards ('*', '?', '-').
	 * 
	 */
	private void testGenome ( String keyword, String expectedGeneLabel, String...geneAccFilters  )
	{
		if ( geneAccFilters == null ) geneAccFilters = new String [ 0 ];
		JSONObject js = invokeApi ( "genome", "keyword", keyword, "qtl", new String[0], "list", geneAccFilters );
		
		assertTrue ( "geneCount from /genome + " + keyword + " is wrong!", js.getInt ( "geneCount" ) > 0 );

		
		// TODO: this is the chromosome view, we need to test 'geneTable' first
		
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
		return invokeApiFailOpt ( urlOrCallName, true, jsonFields );
	}
	
	/**
	 * Invokes some Knetminer API via URL and returns the JSON that it spawns.
	 * @param callName the call URL, if it doesn't start with http://, the URL is composed by prepending 
	 * 				{@code System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/"}
	 * @param failOnError true if the HTTP request doesn't return the 200 status.
	 * @param jsonFields appended to the HTTP request.
	 * 
	 */
	public static JSONObject invokeApiFailOpt ( String urlOrCallName, boolean failOnError, Object... jsonFields )
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
