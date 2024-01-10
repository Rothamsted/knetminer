package uk.ac.rothamsted.knetminer.service;

import static reactor.core.scheduler.Schedulers.DEFAULT_BOUNDED_ELASTIC_SIZE;
import static reactor.core.scheduler.Schedulers.newBoundedElastic;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.stream.Stream;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Session;
import org.neo4j.driver.Transaction;

import net.sourceforge.ondex.algorithm.graphquery.AbstractGraphTraverser;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Scheduler;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.runcontrol.PercentProgressLogger;
import uk.ac.ebi.utils.streams.StreamUtils;

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
		DEFAULT_BOUNDED_ELASTIC_SIZE, 100, NeoMotifImporter.class.getSimpleName () + ".scheduler" 
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
		Map<Pair<Integer, Integer>, Integer> genes2PathLengths, 
		Map<Integer, Set<Integer>> concepts2Genes
	)
	{
		saveMotifLinks ( genes2PathLengths );
		saveConceptGeneCounts ( concepts2Genes );
	}

	/**
	 *  A wrapper of {@link #saveMotifs(Map, Map)}.
	 */
	public void saveMotifs ( KnetMinerInitializer knetMinerInitializer )
	{
		saveMotifs ( knetMinerInitializer.getGenes2PathLengths (), knetMinerInitializer.getConcepts2Genes () );
	}
	
	/**
	 * Save the gene/concept links that were created by the semantic motif traverser.
	 * 
	 * This results in new Neo4j graph elements, @see {@link #processMotifLinksBatch(List)}.
	 */
	private void saveMotifLinks ( Map<Pair<Integer, Integer>, Integer> genes2PathLengths )
	{
		try 
		{
			deleteOldMotifLinks ();
			
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
		catch (Exception ex) {
			ExceptionUtils.throwEx ( RuntimeException.class, ex,
				"Error while saving semantic motif endpoints to Neo4j: $cause"
			);
		}
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
		try ( Session session = driver.session() ) 
		{
			/*
			 * TODO: see if more optimisation is possible:
			 *   https://community.neo4j.com/t/create-cypher-query-very-slow/62780
			 *   https://medium.com/neo4j/5-tips-tricks-for-fast-batched-updates-of-graph-structures-with-neo4j-and-cypher-73c7f693c8cc
			 */
			Transaction tx = session.beginTransaction();
			String cyRelations =
				"""
        UNWIND $smRelRows AS relRow\s
        MATCH ( gene:Gene { ondexId: relRow.geneId } ),
					    ( concept:Concept { ondexId: relRow.conceptId } )
        CREATE (gene) - [:hasMotifLink { graphDistance: relRow.graphDistance }] -> (concept)				
        """;
			tx.run ( cyRelations, Map.of ( "smRelRows", smRelationsBatch) );
			tx.commit();
		}
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
	 * For each concept, saves the count of genes that are associated to it via the semantic
	 * motif traverser. This is useful to speed-up data retrieval.
	 *
	 * This results in new Neo4j graph elements, @see {@link #processConceptGeneCountsBatch(List)}.
	 * 
	 */
	private void saveConceptGeneCounts ( Map<Integer, Set<Integer>> concepts2Genes )
	{
		try 
		{
			deleteOldConceptGeneCounts ();
			
			log.info ( "Saving {} per-concept gene counts to Neo4j", concepts2Genes.size () );

			PercentProgressLogger submissionLogger = new PercentProgressLogger (
				"{}% counts sent to Neo4j",
				concepts2Genes.size()
			);
			// WARNING: if you switch to a parallel publisher, you need to fix this
			submissionLogger.setIsThreadSafe ( true );

			PercentProgressLogger completionLogger = new PercentProgressLogger (
				"{}% counts stored",
				concepts2Genes.size()
			);
			
			// Prepare a stream of records
			//
			Stream<Entry<Integer, Set<Integer>>> concepts2GenesBaseStream = concepts2Genes.entrySet ()
			.stream ()
			// Safest here, saveMotifLinks()
			.onClose ( () -> log.info ( "Waiting for Neo4j updates to complete" ) );			
			
			// Sampling
			//
			if ( sampleSize < concepts2Genes.size () )
			{
				log.warn ( "Due to setSampleSize(), we're reducing the saved per-gene concept counts to about {}", sampleSize );
				concepts2GenesBaseStream = StreamUtils.sampleStream ( 
					concepts2GenesBaseStream, sampleSize, concepts2Genes.size () 
				);
			}
			
			
			// Map to a stream of key/value maps, which is the form suitable for Neo4j
			//
			Stream<Map<String, Object>> concepts2GenesStream = concepts2GenesBaseStream
			.map ( concept2GenesEntry -> 
			{
				int conceptId = concept2GenesEntry.getKey ();
				Set<Integer> geneIds = concept2GenesEntry.getValue ();
				int genesCount = geneIds.size ();
				
				submissionLogger.updateWithIncrement();
				
				return Map.of (
					// Currently, all the Ondex properties are stored as strings
					"conceptId", String.valueOf ( conceptId ),
					"genesCount", genesCount
				);
			});
			
			// Then use Reactor to batch the source records
			//
			Flux.fromStream ( concepts2GenesStream )
			.buffer ( BATCH_SIZE )
			.parallel ()
			.runOn ( FLUX_SCHEDULER )
			.doOnNext ( this::processConceptGeneCountsBatch )
			.doOnNext ( b -> completionLogger.updateWithIncrement ( b.size () ) )
			.sequential ()
			.blockLast ();
			
			log.info ( "saveConceptGeneCounts(), done" );
		} 
		catch (Exception ex) {
			ExceptionUtils.throwEx(RuntimeException.class, ex,
				"Error while saving per-concept gene counts to Neo4j: $cause"
			);
		}
	}
	
	/**
	 * Do the job of sending a batch of gene counts to Neo4j. This results in 
	 * structures like: 
	 * 
	 * <code>(Concept) - [hasMotifStats] -> (SemanticMotifStats{ conceptGenesCount: $ct})</code>
	 *  
	 */
	private int processConceptGeneCountsBatch ( List<Map<String, Object>> countRowsBatch )
	{
		try ( Session session = driver.session() ) 
		{
			/*
			 * TODO: see if more optimisation is possible:
			 *   https://community.neo4j.com/t/create-cypher-query-very-slow/62780
			 *   https://medium.com/neo4j/5-tips-tricks-for-fast-batched-updates-of-graph-structures-with-neo4j-and-cypher-73c7f693c8cc
			 */
			Transaction tx = session.beginTransaction();
			String cyRelations =
				"""
        UNWIND $countRows AS countRow\s
        MATCH ( concept:Concept { ondexId: countRow.conceptId } )
        CREATE (concept) - [:hasMotifStats] -> (:SemanticMotifStats{ conceptGenesCount: countRow.genesCount})				
        """;
			tx.run ( cyRelations, Map.of ( "countRows", countRowsBatch) );
			tx.commit();
		}
		log.trace ( "{} per-gene concept counts stored", countRowsBatch.size () );
		return countRowsBatch.size ();
	}	
	
	
	private void deleteOldConceptGeneCounts ()
	{
		log.info ( "Deleting old per-concept gene counts" );
		
		try ( Session session = driver.session() ) 
		{
			// The transactions trick comes from https://neo4j.com/developer/kb/large-delete-transaction-best-practices-in-neo4j/
			String cyDelete =
				"""
        MATCH ( concept:Concept ) - [link:hasMotifStats] -> ( stats:SemanticMotifStats )
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
