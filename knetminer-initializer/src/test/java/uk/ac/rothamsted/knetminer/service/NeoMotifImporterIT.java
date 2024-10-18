package uk.ac.rothamsted.knetminer.service;

import static java.lang.String.format;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.Map;
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

import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;
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
		
		var isSampling = MOTIFS_SAMPLE_SIZE < smData.size ();
		
		testMotifs = isSampling 
			? StreamUtils.sampleStream ( smData.entrySet ().stream (), MOTIFS_SAMPLE_SIZE, smData.size () )
				.collect ( Collectors.toMap ( Entry::getKey, Entry::getValue ) )	
			: smData;
		
		assertTrue ( "Semantic motif subset is empty!", testMotifs.size () > 0 );
		
		if ( isSampling )
		{
			// We need to add a case with two TAXIDs pointing to the same concept, to 
			// perform one of the tests
			slog.info ( "Adding multi-specie links to the sample test set of links" );
			
			ONDEXGraph graph = knetInitializer.getGraph ();
			
			// Like nested loops, but parallel
			boolean hasGoodTestCase = smData.keySet ()
			.parallelStream ()
			.anyMatch ( lnk -> {
				int geneId = lnk.getLeft ();
				int conceptId = lnk.getRight ();
				
				ONDEXConcept gene = graph.getConcept ( geneId );
				String taxId = ONDEXGraphUtils.getAttribute ( graph, gene, "TAXID" )
						.getValue ()
						.toString ();
				
				var otherLnk = smData.keySet ()
				.parallelStream ()
				.filter ( lnk1 -> conceptId == lnk1.getRight () )
				.filter ( lnk1 -> {
					int geneId1 = lnk1.getLeft ();
					ONDEXConcept gene1 =  graph.getConcept ( geneId1 );
					String taxId1 = ONDEXGraphUtils.getAttribute ( graph, gene1, "TAXID" )
							.getValue ()
							.toString ();
					return !taxId.equals ( taxId1 );
				})
				.findAny ()
				.orElse ( null );
				
				if ( otherLnk == null ) return false;
				
				testMotifs.put ( lnk, smData.get ( lnk ) );
				testMotifs.put ( otherLnk, smData.get ( otherLnk ) );
				return true;
			});
			
			
			assertTrue ( 
				"Can't motif links to test multiple species associated to the same concept!",
				hasGoodTestCase
			);
		}
		
			
		// Same for concept -> genes
		// 
		var concept2Genes = knetInitializer.getConcepts2Genes ();
		assertTrue ( "No semantic motif test data!", concept2Genes.size () > 0 );
		
		// Let's do it
		
		var neoMotifImporter = new NeoMotifImporter ();
		neoMotifImporter.setDatabase ( neoDriverResource.getDriver () );
		neoMotifImporter.saveMotifs ( testMotifs );
	}

	/**
	 * The no of saved links must match {@link #testMotifs}.
	 */
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

	/**
	 * Verifies that links in {@link #testMotifs} are actually saved.
	 */
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

	/**
	 * Verifies that the sum of per-concept gene counts matches the size of
	 * {@link #testMotifs}.
	 */
	@Test
	public void testGeneCountsSavedTotal ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		
		try ( Session session = neoDriver.session() ) 
		{
			String cyCountsSz = """
				MATCH (:Concept) - [:hasMotifStats] -> (stat:ConceptMotifStats)
				WHERE stat.TAXID <> "_ALL_"
				RETURN SUM(stat.conceptGenesCount) AS counts
				""";
			Result result = session.run( cyCountsSz );
			int dbCount = result.next ().get ( 0 ).asInt ();
			
			assertEquals ( 
				"Size of saved gene counts isn't consistent with the links table!", 
				dbCount,
				testMotifs.size()
			);
		}
	}
	
	/**
	 * Verifies that there are {@code ConceptMotifStats} nodes having TAXID = '_ALL_'.
	 * These count all the genes associated to a concepts without considering the specie.
	 */
	@Test
	public void testGeneCountsSavedTotalUsingAllTaxId ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		
		try ( Session session = neoDriver.session() ) 
		{
			String cyCountsSz = """
				MATCH (:Concept) - [:hasMotifStats] -> (stat:ConceptMotifStats)
				WHERE stat.TAXID = "_ALL_"
				RETURN SUM(stat.conceptGenesCount) AS counts
				""";
			Result result = session.run( cyCountsSz );
			int dbCount = result.next ().get ( 0 ).asInt ();
			
			assertEquals ( 
				"Size of saved gene counts isn't consistent with the links table!", 
				dbCount,
				testMotifs.size()
			);
		}
	}		
	
	/**
	 * Matches the per-concept gene counts with data in {@link #testMotifs}.
	 */
	@Test
	public void testGeneCountsExist ()
	{
		var neoDriver = neoDriverResource.getDriver ();

		try ( Session session = neoDriver.session() )
		{			
			// Unfortunately, we're still saving all Ondex properties as strings, so toString() is needed
			String cypherQuery =
	   		"""
				 MATCH (c:Concept) - [r:hasMotifStats] -> (stat:ConceptMotifStats)
				 WHERE stat.TAXID <> "_ALL_"
				 RETURN 
				   toInteger ( c.ondexId ) AS conceptId,
				   SUM ( stat.conceptGenesCount ) AS genesCount
				""";
			Result result = session.run( cypherQuery );
									
			result.forEachRemaining ( cyRel ->
			{				
				var conceptId = cyRel.get ( "conceptId" ).asInt ();
				var genesCount = cyRel.get ( "genesCount" ).asInt ();
				
				log.trace ( "Read entry: {} -> #{}", conceptId, genesCount );
				
				var expectedGenes = testMotifs.keySet ()
					.parallelStream ()
					.filter ( e -> e.getValue () == conceptId )
					.map ( e -> e.getKey () ) // gene ID
					.distinct ()
					.count ();
								
				assertEquals ( 
					format ( "Read genes count for concept %d doesn't match!", conceptId ),
					expectedGenes, genesCount
				);
			});
		}
	}	
	
	/**
	 * Verifies the per-concept specie-independet total gene counts.
	 */
	@Test
	public void testMultiSpecieGeneCounts ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		
		try ( Session session = neoDriver.session() ) 
		{
			String cyCheckStats = """
				MATCH (concept:Concept) - [:hasMotifStats] -> (stat:ConceptMotifStats)
				WHERE stat.TAXID <> "_ALL_"
				WITH concept, COUNT ( stat ) AS nstats
				WHERE nstats > 1
				RETURN concept.ondexId AS id
				LIMIT 1
				""";
			Result result = session.run( cyCheckStats );
			var hasMultiCountsConcepts = result.hasNext ();
			
			assertTrue ( 
				"Saved per-concept gene counts don't have any multi-specie records!", 
				hasMultiCountsConcepts
			);
		}
	}		
	
	
	/**
	 * Verifies the total per-gene concept counts.
	 */
	@Test
	public void testConceptCountsSavedTotal ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		
		try ( Session session = neoDriver.session() ) 
		{
			String cyCountsSz = """
				MATCH (:Gene) - [:hasMotifStats] -> (stat:GeneMotifStats)
				RETURN SUM(stat.geneConceptsCount) AS counts
				""";
			Result result = session.run( cyCountsSz );
			int dbCount = result.next ().get ( 0 ).asInt ();
			
			assertEquals ( 
				"Size of saved concept counts isn't consistent with the links table!", 
				dbCount,
				testMotifs.size()
			);
		}
	}	
	
	/**
	 * Matches the per-gene concept counts with data in {@link #testMotifs}.
	 */
	@Test
	public void testConceptCountsExist ()
	{
		var neoDriver = neoDriverResource.getDriver ();

		try ( Session session = neoDriver.session() )
		{			
			// Unfortunately, we're still saving all Ondex properties as strings, so toString() is needed
			String cypherQuery =
	   		"""
				 MATCH (g:Gene) - [r:hasMotifStats] -> (stat:GeneMotifStats)
				 RETURN toInteger ( g.ondexId ) AS geneId, stat.geneConceptsCount AS conceptsCount
				""";
			Result result = session.run( cypherQuery );
									
			result.forEachRemaining ( cyRel ->
			{				
				var geneId = cyRel.get ( "geneId" ).asInt ();
				var conceptsCount = cyRel.get ( "conceptsCount" ).asInt ();
				
				log.trace ( "Read entry: {} -> #{}", geneId, conceptsCount );
				
				var expectedConcepts = testMotifs.keySet ()
					.parallelStream ()
					.filter ( e -> e.getKey () == geneId )
					.map ( e -> e.getValue () ) // concept ID
					.distinct ()
					.count ();
								
				assertEquals ( 
					format ( "Read concepts count for gene %d doesn't match!", geneId ),
					expectedConcepts, conceptsCount
				);
			});
		}
	}		
}
