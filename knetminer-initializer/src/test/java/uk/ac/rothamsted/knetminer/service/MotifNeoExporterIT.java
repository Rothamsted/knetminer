package uk.ac.rothamsted.knetminer.service;

import static java.lang.String.format;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import org.apache.commons.lang3.RandomUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Assume;
import org.junit.BeforeClass;
import org.junit.Test;
import org.neo4j.driver.*;
import org.neo4j.driver.Record;
import uk.ac.ebi.utils.time.XStopWatch;

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

		//Timer to meter how fast the Neo4j driver gets built.
		var driverBuildTime = XStopWatch.profile ( () -> neoDriver = GraphDatabase.driver (
				"bolt://localhost:" + boltPort, AuthTokens.basic ( "neo4j", "testTest" )
		) );
		slog.info("The driver building interval: {} milliseconds.", driverBuildTime);
		//neoDriver = GraphDatabase.driver (
		//	"bolt://localhost:" + boltPort, AuthTokens.basic ( "neo4j", "testTest" )
		//);

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
		//motifNeoExporter.saveMotifs ( testMotifs );

		//Timer to meter how fast the test genes2PathLengths map get processed.
		var exportTime = XStopWatch.profile ( () -> motifNeoExporter.saveMotifs ( testMotifs ) );
		slog.info("The map processing interval: {} milliseconds.", exportTime);
	}

	public static void closeDriver ()
	{
		slog.info ( "Closing the Neo4j connection" );
		if ( neoDriver != null && neoDriver.session ().isOpen () )
			neoDriver.close ();
	}

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
		try ( Session session = neoDriver.session() )
		{
			String cypherQuery =
   		 """
		 MATCH (g:Gene) - [r:hasMotifLink] -> (c:Concept)
		 RETURN g.ondexId AS geneId, r.graphDistance AS graphDistance, c.ondexId AS conceptId, count(g)
		""";
			Result result = session.run( cypherQuery );
			List<Record> recordList = result.list();
			log.info("Record items list size: {}", recordList.size());
			int recordCount = 0;
			for (Record record : recordList){
				//This parsing of Integer in map key is necessary to obtain Integer object instead of int or String.
				assertEquals (
						"The graph distance returned from Neo4j does not match the graph distance in the map.",
						testMotifs.get(Pair.of(Integer.parseInt(record.get(0).asString()),
								Integer.parseInt(record.get(2).asString()))), Integer.valueOf(record.get(1).asInt())
				);
				log.trace("OndexId of gene: {}. Graph distance: {}. OndexId of concept: {}.",
						record.get(0), record.get(1), record.get(2));
				log.trace("Graph distance in map: {}.",
						testMotifs.get(Pair.of(Integer.parseInt(record.get(0).asString()),
								Integer.parseInt(record.get(2).asString()))));
				recordCount++;
			}
			log.info("Result items count: {}.", recordCount);
			log.info("Map items count: {}.", testMotifs.size());

			assertEquals (
					"Count of saved Neo relations doesn't match the original semantic motif size!",
					testMotifs.size(), recordCount
			);
		}
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

		//The profiles picked by the app are important information (and are usually diaplayed at the start of Spring Boot apps).
		slog.info("App is launched with profile: {}.", result);

		if ( result == null )
			slog.warn ( "Property {} is null, Neo4j-related tests will be skipped", result );
		return "neo4j".equals ( result );
	}

}
