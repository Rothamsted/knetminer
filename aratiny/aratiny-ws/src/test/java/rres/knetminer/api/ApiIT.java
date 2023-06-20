package rres.knetminer.api;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import org.apache.http.HttpException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;

import rres.knetminer.api.client.CountHitsApiResult;
import rres.knetminer.api.client.GenomeApiResult;
import rres.knetminer.api.client.KnetminerApiClient;
import rres.knetminer.api.client.KnetminerApiClient.RequestOptions;
import rres.knetminer.datasource.api.datamodel.EvidenceTableEntry;
import uk.ac.ebi.utils.collections.ListUtils;
import uk.ac.ebi.utils.collections.OptionsMap;
import uk.ac.ebi.utils.exceptions.NotReadyException;
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
	private static boolean synchCalled = false;
	
	private Logger log = LogManager.getLogger ( this.getClass () );
	private static Logger slog = LogManager.getLogger ( ApiIT.class );

	/**
	 * Auto-initialised client instance to be used for the tests, here and in similar testing classes
	 */
	public static KnetminerApiClient CLI = new KnetminerApiClient ( System.getProperty ( "knetminer.api.url" ) );
	
	@BeforeClass
	/**
	 * Keeps probing the API server until it seems initialised. 
	 * Ran before anything else, in order to have it up and running.
	 */
	public static synchronized void synchToServer () throws Exception
	{
		if ( synchCalled ) return;
		
		slog.info ( "Waiting for server init." );
		Thread.sleep ( 10 * 1000 );
		
		for ( int attempt = 1; attempt <= 6; attempt++ )
		{
			slog.info ( "Waiting for the API server, attempt {}", attempt );
			JSONObject js = CLI.invokeApiJs ( "countHits?keyword=foo", RequestOptions.of ().setFailOnError ( false ), null );

			if ( js.has ( "luceneCount" ) ) {
				synchCalled = true;
				return;
			}
			
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
		CountHitsApiResult hits = CLI.countHits ( keyword, null );
		
	  assertTrue ( "countHits for '" + keyword + "' returned a wrong result ( genes )!", hits.getGeneCount () > 0 );
	  assertTrue ( "countHits for '" + keyword + "' returned a wrong result ( luceneCount )!", hits.getLuceneCount () > 0 );
	  assertTrue ( "countHits for '" + keyword + "' returned a wrong result ( luceneLinkedCount )!", hits.getLuceneLinkedCount () > 0 );
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
	public void testEvidenceTable ()
	{
		GenomeApiResult apiOut = CLI.genome ( "response", null, null, null );
		assertNotNull ( "No JSON returned!", apiOut );
		
		List<EvidenceTableEntry> evidenceTable = apiOut.getEvidenceTable ();
		assertFalse ( "No evidenceTable in the result", evidenceTable.isEmpty () );

		var rowFound = evidenceTable.stream ().anyMatch ( row -> 
		{
			if ( !"Trait".equals ( row.getConceptType () ) ) return false;
			if ( !"disease resistance".equals ( row.getName () ) ) return false;
			if ( row.getScore () <= 0d ) return false;
			if ( row.getOndexId () < 0 ) return false; // ondexId
			return true;
		});
		assertTrue ( "Expected evidence table row not found!", rowFound );
	}
	
	@Test
	public void testEvidenceTableWithGeneFilters ()
	{
		GenomeApiResult apiOut = CLI.genome ( 
			"growth OR \"process\" OR \"seed growth\"",
			List.of ( "vps*", "tpr2", "AT4G35020" ),
			null,
			null
		);
		assertNotNull ( "No result returned!",  apiOut );

		List<EvidenceTableEntry> evidenceTable = apiOut.getEvidenceTable ();
		assertFalse ( "evidenceTable is null/empty!", evidenceTable.isEmpty () );
		assertEquals ( "Wrong no. of rows for filtered genes!", 3, evidenceTable.size () );
		
		var rowFound = evidenceTable.stream ()
		.anyMatch ( row ->
		{
			if ( !"BioProc".equals ( row.getConceptType () ) ) return false;
			if ( !"Regulation Of Transcription, DNA-templated".equals ( row.getName () ) ) 
				return false;
			if ( row.getScore () <= 0d ) return false;
			if ( row.getUserGenesSize () <= 0 ) return false;
			var userGenes = row.getUserGeneAccessions ();
			if ( userGenes == null ) return false;
			if ( userGenes.size () != 1 ) return false;
			if ( !"AT3G16830".equals ( userGenes.iterator ().next () ) ) return false;
			return true;
		});
		assertTrue ( "Expected evidence table row not found (single gene)!", rowFound );
		
		rowFound = evidenceTable.stream ()
		.anyMatch ( row ->
		{
			// "TYPE\tNAME\tSCORE\tP-VALUE\tGENES\tUSER_GENES\tQTLs\tONDEXID\tUSER_GENES_SIZE
			if ( !"BioProc".equals ( row.getConceptType () ) ) return false;
			if ( !"Vesicle-mediated Transport".equals ( row.getName () ) ) 
				return false;
			if ( row.getScore () <= 0d ) return false;
			if ( row.getTotalGenesSize () <= 0 ) return false;
			var userGenes = row.getUserGeneAccessions ();
			if ( userGenes == null ) return false;
						
			String currentProfile = getMavenProfileId ();
			
			if ( "default".equals ( currentProfile ) )
			{
				if ( userGenes.size () != 3 ) return false;
				if ( !userGenes.contains ( "AT1G03950" ) ) return false;
				if ( !userGenes.contains ( "AT5G44560" ) ) return false;
				if ( !userGenes.contains ( "AT2G19830" ) ) return false;
				return true;
			}
			
			if ( "neo4j".equals ( currentProfile ) )
			{
				// Neo4j semantic motifs are slightly different
				if ( userGenes.size () != 2 ) return false;
				if ( !userGenes.contains ( "AT2G19830" ) ) return false;
				if ( !userGenes.contains ( "AT3G10640" ) ) return false;
				return true;
			}
			
			if ( "console".equals ( currentProfile ) ) 
			{
				// TODO: we don't know how to deal with profile combinations, let's skip the test for now
				log.warn ( "Skipping gene evidence test for multiple genes, due to {} profile", currentProfile );
				return true; 
			}
			
			throw new IllegalArgumentException ( 
				"'" + currentProfile + "' profile not supported for this test"
			);
		});
		assertTrue ( "Expected evidence table row not found (multi-genes)!", rowFound );
	}
	
	
	/**
	 * Tests the isSortedEvidenceTable option, see the API implementation for details.
	 */
	@Test
	public void testEvidenceTableWithSorting ()
	{
		GenomeApiResult apiOut = CLI.genome ( 
			"spikelet OR seed OR \"seed size\" OR \"yield\" OR \"inflorescence\"",
			List.of ( "ONE1", "U12", "CAK*", "AT1G*" ),
			null,
			"3702",
			true
		);
		assertNotNull ( "No result returned!",  apiOut );

		List<EvidenceTableEntry> evidenceTable = apiOut.getEvidenceTable ();
		assertFalse ( "evidenceTable is null/empty!", evidenceTable.isEmpty () );
		assertEquals ( "Wrong no. of rows for sorted table option!", 4, evidenceTable.size () );

		EvidenceTableEntry row = evidenceTable.get ( 0 );
		assertTrue ( "Wrong value for the row 1", 
		  "Trait".equals ( row.getConceptType () ) &&
		  "seed maturation".equals ( row.getName () ) &&
		  row.getPvalue () > 0.0061 && row.getPvalue () < 0.0062 &&
		  row.getScore () > 8.65 && row.getScore () < 8.67 &&
		  row.getTotalGenesSize () == 3 &&
		  row.getUserGeneAccessions ().contains ( "AT1G61275") &&
		  row.getUserGeneAccessions ().contains ( "AT1G80840") 
		);
		
		row = evidenceTable.get ( 3 );
		assertTrue ( "Wrong value for the row 1", 
		  "Trait".equals ( row.getConceptType () ) &&
		  "other miscellaneous trait".equals ( row.getName () ) &&
		  row.getPvalue () > 0.192 && row.getPvalue () < 0.193 &&
		  row.getScore () > 5.64 && row.getScore () < 5.66 &&
		  row.getTotalGenesSize () == 5 &&
		  row.getUserGeneAccessions ().size () == 1 
		  && row.getUserGeneAccessions ().contains ( "AT1G68940")
		);
		
	}

	
	/**
	 * Tests the JSON that is returned in case of call to a bad URL
	 */
	@Test
	public void testBadCallError ()
	{
		JSONObject js = CLI.invokeApiJs ( "foo", RequestOptions.of ().setFailOnError ( false ), null );
		assertEquals ( 
			"Bad type for the /foo call!", 
			ResponseStatusException2.class.getName (),
			js.getString ( "type" )
		);
		assertEquals ( "Bad status for the /foo call!", 400, js.getInt ( "status" ) );
		assertTrue ( "Bad title for the /foo call!", js.getString ( "title" ).contains ( "Bad API call 'foo'" ) );
		assertEquals ( 
			"Bad path for the /foo call!",
			CLI.getApiUrl ( "foo" ), js.getString ( "path" )
		);
		assertTrue ( "Bad detail for the /foo call!", js.getString ( "detail" ).contains ( "KnetminerServer.handle(KnetminerServer" ) );
		assertEquals ( "Bad statusReasonPhrase for the /foo call!", "Bad Request", js.getString ( "statusReasonPhrase" ) );
	}
	
	/**
	 * Tests the JSON that is returned in case of bad param call 
	 */
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
		JSONObject js = CLI.invokeApiJs ( "countHits", RequestOptions.of().setFailOnError ( false ), KnetminerApiClient.params ( "keyword", "*" ) );
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
			CLI.getApiUrl ( "countHits" ),
			js.getString ( "path" )
		);
		assertTrue ( "Bad detail for the /countHits call!", js.getString ( "detail" ).contains ( "classic.QueryParserBase.parse" ) );
		assertEquals ( "Bad statusReasonPhrase for the /countHits call!", "Bad Request", js.getString ( "statusReasonPhrase" ) );
	}
	
	/**
	 * Tests the JSON that is returned in case of unauthorised request 
	 */
	@Test
	public void testForbiddenEx ()
	{
		// in this modes it might return a regular answer, not an error
		var mvnProfile = getMavenProfileId ();
		if ( Stream.of ( "console", "neo4j" ).anyMatch ( s -> s.equals ( mvnProfile ) ) ) {
			log.warn ( "Skipping testForbiddenEx(), not applicable under the Maven profile {}", mvnProfile );
			return;
		}
		
		String url = CLI.getApiUrl ( "cydebug/traverser/report" );
		JSONObject js = CLI.invokeApiJs ( url, RequestOptions.of().setFailOnError ( false ), null );
		assertEquals ( 
			"Bad type for the /cydebug call!",
			"rres.knetminer.datasource.server.CypherDebuggerService$ForbiddenException",
			js.getString ( "type" )
		);
		assertEquals ( "Bad status for the /cydebug call!", 403, js.getInt ( "status" ) );
		assertTrue (
			"Bad title for the /cydebug call!",
			js.getString ( "title" ).contains (
				"Unauthorized. Use the cypherDebuggerEnabled configuration flag"
			)
		);
		assertEquals ( "Bad path for the /cydebug call!", url, js.getString ( "path" ) );
		assertTrue (
			"Bad detail for the /cydebug call!",
			js.getString ( "detail" ).contains (
				"ForbiddenException: Unauthorized. Use the cypherDebuggerEnabled configuration flag"
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
	 * TODO: we need tests with chromosome regions too
	 * 
	 */
	private void testGenome ( String keyword, String expectedGeneLabel, String...geneAccFilters  )
	{
		GenomeApiResult apiOut = CLI.genome ( keyword, Arrays.asList ( geneAccFilters ), null, null );
				
		assertTrue ( "geneCount from /genome + " + keyword + " is wrong!", apiOut.getGeneCount () > 0 );
		
		// TODO: this is the chromosome view, we need to test 'geneTable' first
		
		String xmlView = apiOut.getGviewer ();
		assertFalse ( "gviewer from /genome + " + keyword + " is null!", "".equals ( xmlView ) );
		
		XPathReader xpath = new XPathReader ( xmlView );
		
		assertNotNull (
			"Gene " + expectedGeneLabel + " not returned by /genome", 
			xpath.readString ( "/genome/feature[./label = '" + expectedGeneLabel + "']" )
		);
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
		log.info ( "The API should be available at " + CLI.getBaseUrl () );
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
		String profileIdProp = "maven.profileId";
		String result = System.getProperty ( profileIdProp, null );
		
		assertNotNull ( "Property '" + profileIdProp + "' is null! It must be set on Maven and failsafe plugin", result );
		return result;
	}	
}
