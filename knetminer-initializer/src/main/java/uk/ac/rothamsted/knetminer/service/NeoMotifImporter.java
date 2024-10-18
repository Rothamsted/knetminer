package uk.ac.rothamsted.knetminer.service;

import static org.apache.commons.lang3.StringUtils.uncapitalize;
import static reactor.core.scheduler.Schedulers.DEFAULT_BOUNDED_ELASTIC_SIZE;
import static reactor.core.scheduler.Schedulers.newBoundedElastic;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Stream;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.lang3.tuple.Triple;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Session;

import net.sourceforge.ondex.algorithm.graphquery.AbstractGraphTraverser;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Scheduler;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.runcontrol.PercentProgressLogger;
import uk.ac.ebi.utils.streams.StreamUtils;
import uk.ac.rothamsted.neo4j.utils.Neo4jDataManager;

/**
 * The Neo4j importer for semantic motif summaries.
 * 
 * <p>Imports the links between genes and evidence concepts computed by a 
 * {@link AbstractGraphTraverser KnetMiner traverser} into a Neo4j database that already 
 * contains the dataset the traverser was run against.</p>  
 *  
 * <p>This is a legacy tool, which we will use for the new KnetMiner API, until we develop
 * the full-Neoj traverser for it.</p>
 *
 * <dl><dt>Date:</dt><dd>25 Aug 2023</dd></dl>
 *
 */
public class NeoMotifImporter extends NeoInitComponent
{
	/**
	 * We use our scheduler only to set a low limit for queuedTaskCap, since the source here is
	 * much faster and there is little point with queueing too much stuff.
	 */
	private static final Scheduler FLUX_SCHEDULER = newBoundedElastic ( 
		DEFAULT_BOUNDED_ELASTIC_SIZE, 100, 
		uncapitalize ( NeoMotifImporter.class.getSimpleName () ) + ".scheduler" 
	);

	/** From the rdf2neo experience */
	private static final int BATCH_SIZE = 2500;

	private static int sampleSize = Integer.MAX_VALUE;
	
	private Logger log = LogManager.getLogger();
	
	/**
	 * Does all the job, ie, saves both {@link #saveMotifLinks(Map) the semantic motif links}
	 * and {@link #saveConceptGeneCounts(Map) the per-concept gene counts}.
	 * 
	 * The two parameters from this method are those coming from {@link KnetMinerInitializer#getGenes2PathLengths()}
	 * and {@link KnetMinerInitializer#getGenes2Concepts()}.
	 */
	public void saveMotifs (
		Map<Pair<Integer, Integer>, Integer> genes2PathLengths
	)
	{
		try 
		{
			deleteOldMotifLinks ();
			createIdIndex ();
			
			saveMotifLinks ( genes2PathLengths );
			saveConceptGeneCounts (); // These are usually more, let's do them first
			saveGeneConceptCounts ();
			createStatsIndexes ();
		}
		catch (Exception ex) {
			ExceptionUtils.throwEx ( RuntimeException.class, ex,
				"Error while saving semantic motif endpoints to Neo4j: $cause"
			);
		}
	}

	/**
	 *  A wrapper of {@link #saveMotifs(Map)}.
	 */
	public void saveMotifs ( KnetMinerInitializer knetMinerInitializer )
	{
		saveMotifs ( knetMinerInitializer.getGenes2PathLengths () );
	}
	
	/**
	 * Save the gene/concept links that were created by the semantic motif traverser.
	 * 
	 * This results in new Neo4j graph elements, @see {@link #processMotifLinksBatch(List)}.
	 */
	private void saveMotifLinks ( Map<Pair<Integer, Integer>, Integer> genes2PathLengths )
	{
		log.info ( "Saving {} semantic motif endpoints to Neo4j", genes2PathLengths.size () );

		PercentProgressLogger submissionLogger = new PercentProgressLogger (
			"{}% semantic motif endpoints sent to Neo4j",
			genes2PathLengths.size()
		);
		// WARNING: if you switch to a parallel publisher, you need to fix this
		submissionLogger.setIsThreadSafe ( true );

		PercentProgressLogger completionLogger = new PercentProgressLogger (
			"{}% semantic motif endpoints stored",
			genes2PathLengths.size()
		);
		
		// Prepare a stream of records
		//
		Stream<Entry<Pair<Integer, Integer>, Integer>> smRelsBaseStream = genes2PathLengths.entrySet ()
		.stream ()
		// having it on the root stream is the safest option (against 'stream closed or already operated' ).
		.onClose ( () -> log.info ( "Waiting for Neo4j updates to complete" ) );
		
		
		// Sampling
		//
		if ( sampleSize < genes2PathLengths.size () )
		{
			log.warn ( "Due to setSampleSize(), we're reducing the saved links to about {}", sampleSize );
			smRelsBaseStream = StreamUtils.sampleStream ( smRelsBaseStream, sampleSize, genes2PathLengths.size () );
		}
		

		// Map to a stream of key/value maps, which is the form suitable for Neo4j
		//
		Stream<Map<String, Object>> smRelsStream = smRelsBaseStream			
		.map ( smEntry -> 
		{
			var gene2Concept = smEntry.getKey();
			int geneId = gene2Concept.getLeft();
			int conceptId = gene2Concept.getRight();
			int distance = smEntry.getValue();
			
			submissionLogger.updateWithIncrement();
			
			return Map.of (
				// Currently, all the Ondex properties are stored as strings
				"geneId", String.valueOf ( geneId ),
				"conceptId", String.valueOf ( conceptId ),
				"graphDistance", distance
			);
		});
		
		// Then use Reactor to batch the source records and stream parallel batches to Neo4j
		//
		Flux.fromStream ( smRelsStream )
		.buffer ( BATCH_SIZE )
		.parallel ()
		.runOn ( FLUX_SCHEDULER )
		.doOnNext ( this::processMotifLinksBatch )
		.doOnNext ( b -> completionLogger.updateWithIncrement ( b.size () ) )
		.sequential ()
		.blockLast ();

		log.info ( "saveMotifLinks(), done" );
	}

	/**
	 * Do the job of sending a batch of semantic motif links to Neo4j. This results in 
	 * structures like: 
	 * 
	 * <code>(Gene) - [hasMotifLink { graphDistance: $d }] -> (Concept)</code> 
	 *  
	 */
	private int processMotifLinksBatch ( List<Map<String, Object>> smRelationsBatch )
	{		
		String cyRelations = """
	    UNWIND $smRelRows AS relRow\s
	    MATCH ( gene:Gene { ondexId: relRow.geneId } ),
				    ( concept:Concept { ondexId: relRow.conceptId } )
	    CREATE (gene) - [:hasMotifLink{ graphDistance: relRow.graphDistance }] -> (concept)
	  """;
		
		var neoMgr = new Neo4jDataManager ( driver );
		// neoMgr.setAttemptMsgLogLevel ( Level.INFO );
		// neoMgr.setMaxRetries ( 3 );
		
		// Wraps it in a transaction and also re-attempts it in case of
		// node lock issues.
		//
		neoMgr.runCypher ( cyRelations, "smRelRows", smRelationsBatch );
		
		log.trace ( "{} links stored", smRelationsBatch.size () );
		return smRelationsBatch.size ();
	}
	
	private void deleteOldMotifLinks ()
	{
		log.info ( "Deleting old semantic motif endpoints" );
		
		try ( Session session = driver.session() ) 
		{
			// The transactions trick comes from https://neo4j.com/developer/kb/large-delete-transaction-best-practices-in-neo4j/
			String cyDelete =
				"""
        MATCH ( gene:Gene ) - [link:hasMotifLink] -> ( concept:Concept )
        CALL {
          WITH link
          DELETE link
        }
        IN TRANSACTIONS OF 10000 ROWS
        """;
			session.run ( cyDelete );
		}
	}

	/**
	 * Create a Neo4j index about Concept.ondexId, Gene.ondexId, the properties 
	 * currently used for identifying nodes.
	 * 
	 * We added this to rdf2neo (via the Ondex config), here, we're keeping it
	 * to get old data auto-updated and be sure this index is used by the 
	 * other queries in this class.
	 * 
	 */
	private void createIdIndex ()
	{
		log.info ( "Creating Neo4j Concept ID indexes" );

		try ( Session session = driver.session () ) 
		{
			session.executeWriteWithoutResult ( tx ->
			{				
				tx.run (
					"CREATE INDEX concept_ondexId IF NOT EXISTS FOR (c:Concept) ON (c.ondexId)" 
				);
			});
			log.debug ( "Concept index done" );
			
			// Turns out you need this too, despite all Gene nodes are Concept nodes too
			session.executeWriteWithoutResult ( tx ->
			{				
				tx.run (
					"CREATE INDEX gene_ondexId IF NOT EXISTS FOR (g:Gene) ON (g.ondexId)" 
				);
			});
			log.debug ( "Gene index done" );
		}	
		
		log.info ( "ID indexes created" );		
	}
	
	/**
	 * For each concept and TAX ID, saves the count of genes (having the TAXID) that are associated 
	 * to the concept via the semantic motif traverser. This is useful to speed-up data retrieval.
	 *
	 * This issues a static query that creates {@code ConceptMotifStats} nodes. 
	 */
	private void saveConceptGeneCounts ()
	{
		try 
		{
			deleteOldConceptGeneCounts ();
			
			log.info ( "Saving per-concept gene counts to Neo4j" );
									
			try ( var session = driver.session () )
			{
				String updateCy =
				"""
				MATCH (gene:Gene) - [:hasMotifLink] -> (concept:Concept)
				WITH gene.TAXID AS TAXID, COUNT ( DISTINCT gene ) AS ngenes, concept
				CALL {
				  WITH TAXID, ngenes, concept
				  CREATE (concept) - [:hasMotifStats] -> (:ConceptMotifStats{ TAXID: TAXID, conceptGenesCount: ngenes })
				}
				IN TRANSACTIONS OF 10000 ROWS						
				""";
				session.run ( updateCy );
				
				log.info ( "Saving per-concept all-species gene counts to Neo4j" );
				updateCy =
				"""
				MATCH (gene:Gene) - [:hasMotifLink] -> (concept:Concept)
				WITH COUNT ( DISTINCT gene ) AS ngenes, concept
				CALL {
				  WITH ngenes, concept
				  CREATE (concept) - [:hasMotifStats] -> (:ConceptMotifStats{ TAXID: "_ALL_", conceptGenesCount: ngenes })
				}
				IN TRANSACTIONS OF 10000 ROWS						
				""";
				session.run ( updateCy );
			}
			
			log.info ( "saveConceptGeneCounts(), done" );
		} 
		catch (Exception ex) {
			ExceptionUtils.throwEx(RuntimeException.class, ex,
				"Error while saving per-concept gene counts to Neo4j: $cause"
			);
		}
	}
	
	/**
	 * Deletes previous per-concept stats. This is called by {@link #saveConceptGeneCounts()},
	 * before (re)doing its job.
	 */
	private void deleteOldConceptGeneCounts ()
	{
		log.info ( "Deleting old per-concept gene counts" );
		
		try ( Session session = driver.session() ) 
		{
			// The transactions trick comes from https://neo4j.com/developer/kb/large-delete-transaction-best-practices-in-neo4j/
			String cyDelete =
				"""
        MATCH ( concept:Concept ) - [link:hasMotifStats] -> ( stats:ConceptMotifStats )
        CALL {
          WITH link, stats
          DELETE link, stats
        }
        IN TRANSACTIONS OF 10000 ROWS
        """;
			session.run ( cyDelete );
		}
	}
	
	
	/**
	 * For each gene, saves the count of concepts that are associated 
	 * to the gene via the semantic motif traverser. This is useful to speed-up 
	 * data retrieval.
	 *
	 * This issues a static query that creates {@code GeneMotifStats} nodes. 
	 */
	private void saveGeneConceptCounts ()
	{
		try 
		{
			deleteOldGeneConceptCounts ();
			
			log.info ( "Saving per-gene concept counts to Neo4j" );
									
			try ( var session = driver.session () )
			{
				String updateCy =
				"""
				MATCH (gene:Gene) - [:hasMotifLink] -> (concept:Concept)
				WITH COUNT ( DISTINCT concept ) AS nconcepts, gene
				CALL {
				    WITH nconcepts, gene
				    CREATE (gene) - [:hasMotifStats] -> (:GeneMotifStats{ geneConceptsCount: nconcepts })
				}
				IN TRANSACTIONS OF 10000 ROWS
				""";
				session.run ( updateCy );
			}
			
			log.info ( "saveGeneConceptCounts(), done" );
		} 
		catch (Exception ex) {
			ExceptionUtils.throwEx(RuntimeException.class, ex,
				"Error while saving per-gene concept counts to Neo4j: $cause"
			);
		}
	}
	
	/**
	 * Deletes previous per-gene stats. This is called by {@link #saveGeneConceptCounts()},
	 * before (re)doing its job.
	 */
	private void deleteOldGeneConceptCounts ()
	{
		log.info ( "Deleting old per-gene concept counts" );
		
		try ( Session session = driver.session() ) 
		{
			// The transactions trick comes from https://neo4j.com/developer/kb/large-delete-transaction-best-practices-in-neo4j/
			String cyDelete =
				"""
        MATCH ( gene:Gene ) - [link:hasMotifStats] -> ( stats:GeneMotifStats )
        CALL {
          WITH link, stats
          DELETE link, stats
        }
        IN TRANSACTIONS OF 10000 ROWS
        """;
			session.run ( cyDelete );
		}
	}		
	
	/**
	 * Creates Neo4j indexes over the nodes and properties that are created by 
	 * {@link #saveConceptGeneCounts()} and {@link #saveGeneConceptCounts()}. 
	 * 
	 * These indexes are useful to speed-up the retrieval of the said data.
	 * 
	 * This method is invoked by {@link #saveMotifs(Map)}
	 */
	private void createStatsIndexes ()
	{
		log.info ( "Creating Neo4j Motif Stats indexes" );

		try ( Session session = driver.session () ) 
		{
			Stream.of ( 
				Triple.of ( "conceptMotifStats_genesCount", "ConceptMotifStats", "conceptGenesCount" ),
				Triple.of ( "geneMotifStats_conceptsCount", "GeneMotifStats", "geneConceptsCount" ),
				Triple.of ( "conceptMotifStats_TaxId", "ConceptMotifStats", "TAXID" )
			)
			.map ( params -> {
				String idxName = params.getLeft ();
				String nodeType = params.getMiddle ();
				String property = params.getRight ();
				
				return String.format (
					"CREATE INDEX %s IF NOT EXISTS FOR (n:%s) ON (n.%s)",
					idxName, nodeType, property
				);
			})
			.forEach ( cyIdx -> 
				session.executeWriteWithoutResult ( tx -> tx.run ( cyIdx ) )
			);
		}	
		
		log.info ( "Motif Stats indexes created" );		
	}	
	
	
	/**
	 * This is useful for tests, since usually there are many sample data to save, which slows everything down.
	 * 
	 * When this is smaller than the param of {@link #saveMotifs(Map)}, then a random sample from that
	 * param of this size is the one that is actually saved. Default is {@link Integer#MAX_VALUE}, ie, 
	 * saves everything.  
	 */
	public static int getSampleSize ()
	{
		return sampleSize;
	}

	public static void setSampleSize ( int sampleSize )
	{
		NeoMotifImporter.sampleSize = sampleSize;
	}

	/**
	 * {@link #setSampleSize(int)} wrapper, which sets {@link Integer#MAX_VALUE}
	 */
	public static void resetSampleSize ()
	{
		setSampleSize ( Integer.MAX_VALUE );
	}
}
