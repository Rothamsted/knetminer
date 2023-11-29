package uk.ac.rothamsted.knetminer.service;

import static reactor.core.scheduler.Schedulers.DEFAULT_BOUNDED_ELASTIC_SIZE;
import static reactor.core.scheduler.Schedulers.newBoundedElastic;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Stream;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.rng.sampling.CollectionSampler;
import org.apache.commons.rng.simple.RandomSource;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Session;
import org.neo4j.driver.Transaction;

import reactor.core.publisher.Flux;
import reactor.core.scheduler.Scheduler;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.runcontrol.PercentProgressLogger;

/**
 *
 * TODO: comment me!
 *
 * <dl><dt>Date:</dt><dd>25 Aug 2023</dd></dl>
 *
 */
public class MotifNeoExporter extends NeoInitComponent
{
	/**
	 * We use our scheduler only to set a low limit for queuedTaskCap, since the source here is
	 * much faster and there is little point with queueing too much stuff.
	 */
	private static final Scheduler FLUX_SCHEDULER = newBoundedElastic ( 
		DEFAULT_BOUNDED_ELASTIC_SIZE, 100, MotifNeoExporter.class.getSimpleName () + ".scheduler" 
	);

	/** From the rdf2neo experience */
	private static final int BATCH_SIZE = 2500;

	private static int sampleSize = Integer.MAX_VALUE;
	
	private Logger log = LogManager.getLogger();
	
	public void saveMotifs ( Map<Pair<Integer, Integer>, Integer> genes2PathLengths )
	{
		try 
		{
			deleteOldLinks ();
			
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
			Stream<Entry<Pair<Integer, Integer>, Integer>> smRelsBaseStream;
			
			// Sampling
			if ( sampleSize < genes2PathLengths.size () )
			{
				log.warn ( "Due to setSampleSize(), we're reducing the saved links to about {}", sampleSize );
				smRelsBaseStream	= new CollectionSampler<> ( RandomSource.JDK.create (), genes2PathLengths.entrySet () )
				.samples ( sampleSize );				
			}
			else
				smRelsBaseStream = genes2PathLengths.entrySet ().stream ();
			
			// Prepare a stream of records
			//
			Stream<Map<String, Object>> smRelsStream = smRelsBaseStream
			.onClose ( () -> log.info ( "Waiting for Neo4j updates to complete" ) )			
			.map ( smEntry -> 
			{
				var gene2Concept = smEntry.getKey();
				int geneId = gene2Concept.getLeft();
				int conceptId = gene2Concept.getRight();
				int distance = smEntry.getValue();
				
				submissionLogger.updateWithIncrement();
				
				return Map.of (
					"geneId", geneId,
					"conceptId", conceptId,
					"graphDistance", distance
				);
			});
			
			// Then use Reactor to batch the source records
			//
			Flux.fromStream ( smRelsStream )
			.buffer ( BATCH_SIZE )
			.parallel ()
			.runOn ( FLUX_SCHEDULER )
			.doOnNext ( this::processBatch )
			.doOnNext ( b -> completionLogger.updateWithIncrement ( b.size () ) )
			.sequential ()
			.blockLast ();
			
			log.info ( "{}, done", this.getClass ().getSimpleName () );
		} 
		catch (Exception ex) {
			ExceptionUtils.throwEx(RuntimeException.class, ex,
				"Error while saving semantic motif endpoints to Neo4j: $cause"
			);
		}
	}

	private int processBatch ( List<Map<String, Object>> smRelationsBatch )
	{
		try ( Session session = driver.session() ) 
		{			
			Transaction tx = session.beginTransaction();
			String cyRelations =
				"""
        UNWIND $smRelRows AS relRow\s
        MATCH ( gene:Gene {ondexId: toString ( relRow.geneId )} ),
					    ( concept:Concept {ondexId: toString ( relRow.conceptId )} )
        CREATE (gene) - [:hasMotifLink { graphDistance: relRow.graphDistance }] -> (concept)				
        """;
			tx.run ( cyRelations, Map.of ( "smRelRows", smRelationsBatch) );
			tx.commit();
		}
		log.trace ( "{} links stored", smRelationsBatch.size () );
		return smRelationsBatch.size ();
	}
	
	private void deleteOldLinks ()
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
		MotifNeoExporter.sampleSize = sampleSize;
	}

	/**
	 * Wrapper of {@link Integer#MAX_VALUE}
	 */
	public static void resetSampleSize ()
	{
		setSampleSize ( Integer.MAX_VALUE );
	}
}
