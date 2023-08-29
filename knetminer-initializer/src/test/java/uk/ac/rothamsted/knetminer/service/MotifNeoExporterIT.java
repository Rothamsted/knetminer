package uk.ac.rothamsted.knetminer.service;

import static java.lang.String.format;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import org.apache.commons.lang3.RandomUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Assert;
import org.junit.Assume;
import org.junit.BeforeClass;
import org.junit.Test;
import org.neo4j.driver.*;

/**
 * Tests for MotifNeoExporter.
 *
 * <b>WARNING</b>: These tests are actually run only when you run
 * mvn -Pneo4j ... which setup a test Neo4j with the aratiny dummy
 * dataset.
 *
 * <dl><dt>Date:</dt><dd>25 Aug 2023</dd></dl>
 *
 */
public class MotifNeoExporterIT
{
	/**
	 * For performance reasons, we test a reduced random subset of the semantic motifs in the 
	 * test dataset. This is its size
	 */
	final static int MOTIFS_SAMPLE_SIZE = 100;
	
	/**
	 * This is the random subset of motifs we actually save and test.
	 */
	private static Map<Pair<Integer, Integer>, Integer> testMotifs; 
	private static Driver neoDriver;

	private Logger log = LogManager.getLogger ();
	private static Logger slog = LogManager.getLogger ();

	/**
	 * Initialises the test instance.
	 *
	 * As explained in {@link KnetMinerInitializerTest}, this reloads the data initialised
	 * in that test and makes them available via {@link #knetInitializer}.
	 *
	 */
	@BeforeClass
	public static void init ()
	{
		/* TODO: remove. the test plug-ins are already configured to log the 
		 * begin and end of each test automatically.
		slog.info("____________________________________________________");
		slog.info("The MotifNeoExporterIT class initialization started.");
		slog.info("____________________________________________________");
		 */
		
		// This is not always reported by test runners, so...
		if ( !isMavenNeo4jMode () )
			slog.info (
				"Not in Neo4j mode, tests in {} will be ignored",
				MotifNeoExporterIT.class.getSimpleName ()
			);

		Assume.assumeTrue (
			format (
				"Not in Neo4j mode, tests in %s will be ignored",
				MotifNeoExporterIT.class.getSimpleName () ),
			isMavenNeo4jMode()
		);


		slog.info ( "Getting k-initialiser with existing semantic motif data" );

		// As said above, with false, it just reloads the already generated data
		KnetMinerInitializer knetInitializer = KnetMinerInitializerTest
			.createKnetMinerInitializer ( false );

		// Let's reuse test data produced during regular tests.
		knetInitializer.initKnetMinerData ( false );

		slog.info ( "Initialising Neo4j connection to test DB" );

		var boltPort = System.getProperty ( "neo4j.server.boltPort" );
		neoDriver = GraphDatabase.driver (
			"bolt://localhost:" + boltPort, AuthTokens.basic ( "neo4j", "testTest" )
		);


		slog.info ( "Saving semantic motifs endpoints into Neo4j" );

		var smData = knetInitializer.getGenes2PathLengths ();
		assertTrue ( "No semantic motif test data!", smData.size () > 0 );
		
		/**
		 * The original test set is too big and takes too much time, let's reduce it
		 */
		testMotifs = smData.entrySet ()
		.stream ()
		.filter ( e -> RandomUtils.nextInt ( 0, smData.size () ) < MOTIFS_SAMPLE_SIZE )
		.collect ( Collectors.toMap ( Entry::getKey, Entry::getValue ) );

		assertTrue ( "semantic motif subset is empty!", testMotifs.size () > 0 );
		
		
		var motifNeoExporter = new MotifNeoExporter ();
		motifNeoExporter.setDatabase ( neoDriver );
		motifNeoExporter.saveMotifs ( testMotifs );
	}

	public static void closeDriver ()
	{
		slog.info ( "Closing the Neo4j connection" );
		if ( neoDriver != null && neoDriver.session ().isOpen () )
			neoDriver.close ();
	}

	/*
	 *  TODO: remove. 
	 *  - We already had testRelationsExist() for this
	 *  - Test methods are usually named testXXX() and we can't afford random names around test classes
	 *  - this is not how I was proposing to verify edges, see below
	 *  
	@Test
	public void hasEdge(){
		//log.info("The Genes2PathLengths map: " + knetInitializer.getGenes2PathLengths().toString());
		try (Session session = neoDriver.session()) {
			String cqlQuery = "MATCH (g:Gene)-[r:hasMotifLink]->(c:Concept) WHERE g.ondexId = 6644177 AND g.ondexId = 6644176 RETURN r.graphDistance";
			Result result = session.run(cqlQuery);
			String edge = result.list().toString();
			log.info("Edge: " + edge);
			assertEquals("[Record<{r.graphDistance: 1}>]", edge);
		}
	}*/

	@Test
	public void testSavedSize ()
	{
		try ( Session session = neoDriver.session() ) 
		{
			String cySmRelsSz = """
				MATCH (g:Gene) - [r:hasMotifLink] -> (c:Concept)
				RETURN COUNT(r) AS smRelsCount
				""";
			Result result = session.run( cySmRelsSz );
			int neoCount = result.next ().get ( 0 ).asInt ();
			
			assertEquals ( 
				"Count of saved Neo relations doesn't match the original semantic motif size!", 
				testMotifs.size(), neoCount 
			);
		}
		
	}

	@Test
	public void testRelationsExist ()
	{
		/* TODO: Use the neoDriver to run something like this:
		 *
		 * run cypher:
		 *   MATCH (g:Gene) - [r:hasMotifLink] -> (c:Concept)
		 *   RETURN g.ondexId AS geneId, r.graphDistance AS distance, c.ondexId AS conceptId
		 *
		 * Verify that the Cypher result has testMotifs.size() tuples.
		 * 
		 * Then, verify each of them:
		 * 
		 * for each result from cypher:
		 *   key = Pair.of ( geneId, conceptId )
		 *   testMotifs.get ( key ) exists and == distance
		 */
	}


	/**
	 * Tells if we're running Maven with the neo4j profile. This is used to establish if the tests
	 * in this class have to be run or not.
	 *
	 * TODO: copy-pasted from ApiIT, to be factorised into a utility class.
	 *
	 */
	private static boolean isMavenNeo4jMode ()
	{
		String profileIdProp = "maven.profileId";
		// This is set by the profile in the POM
		String result = System.getProperty ( profileIdProp, null );

		if ( result == null )
			slog.warn ( "Property {} is null, Neo4j-related tests will be skipped", result );
		return "neo4j".equals ( result );
	}

}
