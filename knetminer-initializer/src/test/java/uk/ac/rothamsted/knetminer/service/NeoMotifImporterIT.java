package uk.ac.rothamsted.knetminer.service;

import static java.lang.String.format;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.ebi.utils.streams.StreamUtils;
import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;


/**
 * Tests for NeoMotifImporter.
 *
 * <b>WARNING</b>: These tests are actually run only when you run
 * mvn -Pneo4j ... which setup a test Neo4j with the aratiny dummy
 * dataset.
 *
 * @author Marco Brandizi
 *
 * <dl><dt>Date:</dt><dd>25 Aug 2023</dd></dl>
 *
 */
public class NeoMotifImporterIT
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
	private static Map<Integer, Set<Integer>> testConcept2Genes;
	
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

		slog.info ( "Saving semantic motifs into Neo4j" );

		var smData = knetInitializer.getGenes2PathLengths ();
		assertTrue ( "No semantic motif test data!", smData.size () > 0 );
				
		/*
		 * The original test set is too big and takes too much time, let's reduce it
		 * 
		 * Note that here we're not using NeoMotifImporter.setSampleSize(), because we need
		 * to reuse the sample to verify the results.
		 */	
		testMotifs = MOTIFS_SAMPLE_SIZE < smData.size () 
			? StreamUtils.sampleStream ( smData.entrySet ().stream (), MOTIFS_SAMPLE_SIZE, smData.size () )
				.collect ( Collectors.toMap ( Entry::getKey, Entry::getValue ) )	
			: smData;
		
		assertTrue ( "Semantic motif subset is empty!", testMotifs.size () > 0 );
		
		
		// Same for concept -> genes
		// 
		var concept2Genes = knetInitializer.getConcepts2Genes ();
		assertTrue ( "No semantic motif test data!", concept2Genes.size () > 0 );
			
		testConcept2Genes = MOTIFS_SAMPLE_SIZE < concept2Genes.size () 
			? StreamUtils.sampleStream ( concept2Genes.entrySet ().stream (), MOTIFS_SAMPLE_SIZE, concept2Genes.size () )
				.collect ( Collectors.toMap ( Entry::getKey, Entry::getValue ) )	
			: concept2Genes;

		
		// Let's do it
		
		var neoMotifImporter = new NeoMotifImporter ();
		neoMotifImporter.setDatabase ( neoDriverResource.getDriver () );
		neoMotifImporter.saveMotifs ( testMotifs, testConcept2Genes );
	}

	
	@Test
	public void testMotifLinksSavedSize ()
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
	public void testMotifLinksExist ()
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

	
	@Test
	public void testGeneCountsSavedSize ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		
		try ( Session session = neoDriver.session() ) 
		{
			String cyCountsSz = """
				MATCH (c:Concept) - [r:hasMotifStats] -> (stat:SemanticMotifStats)
				RETURN COUNT(r) AS countsSize
				""";
			Result result = session.run( cyCountsSz );
			int neoCount = result.next ().get ( 0 ).asInt ();
			
			assertEquals ( 
				"Size of saved gene counts doesn't match the original concept2Genes size!", 
				testConcept2Genes.size(), neoCount 
			);
		}
	}	
	
	@Test
	public void testGeneCountsExist ()
	{
		var neoDriver = neoDriverResource.getDriver ();

		try ( Session session = neoDriver.session() )
		{			
			// Unfortunately, we're still saving all Ondex properties as strings, so toString() is needed
			String cypherQuery =
	   		"""
				 MATCH (c:Concept) - [r:hasMotifStats] -> (stat:SemanticMotifStats)
				 RETURN toInteger ( c.ondexId ) AS conceptId, stat.conceptGenesCount AS genesCount
				""";
			Result result = session.run( cypherQuery );
									
			result.forEachRemaining ( cyRel ->
			{				
				var conceptId = cyRel.get ( "conceptId" ).asInt ();
				var genesCount = cyRel.get ( "genesCount" ).asInt ();
				
				log.trace ( "Read entry: {} -> #{}", conceptId, genesCount );
				
				var expectedGenes = testConcept2Genes.get ( conceptId );
				assertNotNull ( "Concept {} in read count tuple doesn't match!", expectedGenes );
				
				assertEquals ( 
					format ( "Read genes count for concept %d doesn't match!", conceptId ),
					expectedGenes.size(), genesCount
				);
			});
		}
	}	
}
