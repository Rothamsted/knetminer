package uk.ac.rothamsted.knetminer.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import org.apache.commons.lang3.RandomUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;


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
	private final static int MOTIFS_SAMPLE_SIZE = 100;
	//private final static int MOTIFS_SAMPLE_SIZE = Integer.MAX_VALUE;
	
	/**
	 * This is the random subset of motifs we actually save and test.
	 */
	private static Map<Pair<Integer, Integer>, Integer> testMotifs; 

	@ClassRule
	public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource (); 
	
	private Logger log = LogManager.getLogger ();
	private static Logger slog = LogManager.getLogger ();
	
	/**
	 * Initialises the test instance.
	 *
	 * As explained in {@link KnetMinerInitializerTest}, this reloads the data initialised
	 * in that test and makes them available via {@link #knetInitializer}.
	 */
	@BeforeClass
	public static void init ()
	{
		neoDriverResource.ensureNeo4jMode ();
		
		slog.info ( "Getting k-initialiser with existing semantic motif data" );

		// As said above, with false, it just reloads the already generated data
		KnetMinerInitializer knetInitializer = KnetMinerInitializerTest
			.createKnetMinerInitializer ( false );

		// Let's reuse test data produced during regular tests.
		knetInitializer.initKnetMinerData ( false );

		slog.info ( "Saving semantic motifs endpoints into Neo4j" );

		var smData = knetInitializer.getGenes2PathLengths ();
		assertTrue ( "No semantic motif test data!", smData.size () > 0 );
		
		/*
		 * The original test set is too big and takes too much time, let's reduce it
		 * 
		 * Note that here we're not using MotifNeoExporter.setSampleSize(), because we need
		 * to reuse the sample to verify the results.
		 */		
		testMotifs = smData.entrySet ()
		.stream ()
		.filter ( e -> RandomUtils.nextInt ( 0, smData.size () ) < MOTIFS_SAMPLE_SIZE )
		.collect ( Collectors.toMap ( Entry::getKey, Entry::getValue ) );

		assertTrue ( "Semantic motif subset is empty!", testMotifs.size () > 0 );
		
		var motifNeoExporter = new MotifNeoExporter ();
		motifNeoExporter.setDatabase ( neoDriverResource.getDriver () );
		motifNeoExporter.saveMotifs ( testMotifs );
	}

	@Test
	public void testSavedSize ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		
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
		var neoDriver = neoDriverResource.getDriver ();

		try ( Session session = neoDriver.session() )
		{			
			// Unfortunately, we're still saving all Ondex properties as strings, so toString() is needed
			String cypherQuery =
	   		"""
				 MATCH (g:Gene) - [r:hasMotifLink] -> (c:Concept)
				 RETURN toInteger ( g.ondexId ) AS geneId, toInteger ( c.ondexId ) AS conceptId,
				   r.graphDistance AS graphDistance
				""";
			Result result = session.run( cypherQuery );
									
			result.forEachRemaining ( cyRel ->
			{				
				var geneId = cyRel.get ( "geneId" ).asInt ();
				var conceptId = cyRel.get ( "conceptId" ).asInt ();
				var distance = cyRel.get ( "graphDistance" ).asInt ();
				var expectedDistance = testMotifs.get ( Pair.of ( geneId, conceptId ) );
				
				log.trace ( "Read tuple: ({}, {}) -> {}", geneId, conceptId, distance );
				log.trace ( "Expected tuple: ({}, {}) -> {}", geneId, conceptId, expectedDistance );

				assertTrue ( String.format ( 
					"The returned semantic motif pair ({}, {}) doesn't exist!", geneId, conceptId ),
					testMotifs.containsKey ( Pair.of ( geneId, conceptId ) )
				);
				
				assertEquals (
					"The graph distance returned from Neo4j does not match the graph distance in the map",
					(int) expectedDistance,
					distance
				);
				
			});
		}
	}

}
