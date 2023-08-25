package uk.ac.rothamsted.knetminer.service;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.runcontrol.PercentProgressLogger;
import uk.ac.rothamsted.knetminer.backend.cypher.genesearch.CypherGraphTraverser;

import java.sql.SQLException;
import java.util.*;

/**
 * 
 * TODO: comment me!
 *
 * <dl><dt>Date:</dt><dd>25 Aug 2023</dd></dl>
 *
 */
public class MotifNeoExporter
{
	private Driver driver;

	private Logger log = LogManager.getLogger ();

	public void setDatabase ( Driver driver ) {
		this.driver = driver;
	}

	public void saveMotifs ( Map<Pair<Integer, Integer>, Integer> genes2PathLengths )
	{
		try 
		{
			final int batchSize = 2000;
			PercentProgressLogger progressLogger = new PercentProgressLogger (
				"{}% semantic motif endpoints processed",
				genes2PathLengths.size () 
			);
			List<Map<String, Object>> relsBatch = null;					
	
			for ( var smEntry: genes2PathLengths.entrySet () )
			{
				var gene2Concept = smEntry.getKey ();
				int geneId = gene2Concept.getLeft ();
				int conceptId = gene2Concept.getRight ();
				int distance = smEntry.getValue ();
				
				if ( relsBatch == null ) relsBatch = new ArrayList<> ();
	
				relsBatch.add ( Map.of ( 
					"geneId", geneId,
					"conceptId", conceptId,
					"graphDistance", distance
				));
				
				progressLogger.updateWithIncrement ();
				
				if ( relsBatch.size () == batchSize || progressLogger.getProgress () == genes2PathLengths.size () )
				{
					processBatch ( relsBatch );
					relsBatch = null;
				}
			}
		}
		catch ( Exception ex )
		{
			ExceptionUtils.throwEx ( RuntimeException.class, ex,
			  "Error while saving semantic motif endpoints to Neo4j: $cause"  
			); 
		}
		
		/* TODO: remove. It is buggy and poorly readable 
		int count = 0;
		int totalCount = 0;
		List<Map<String, Object>> relRowsMapList = new ArrayList<> ();
		List<List<Map<String, Object>>> relRowsMapLists = new ArrayList<> ();
		Set<Map.Entry<Pair<Integer, Integer>, Integer>> entries = genes2PathLengths.entrySet ();
		for ( Map.Entry<Pair<Integer, Integer>, Integer> entry : entries )
		{
			while ( count < 2000 )
			{
			  // TODO: This can't work, it adds the same entry for 2k times...
				Map<String, Object> relRows = new HashMap<> ();
				relRows.put ( "geneId", entry.getKey ().getKey () );
				relRows.put ( "conceptId", entry.getKey ().getValue () );
				relRows.put ( "graphDistance", entry.getValue () );
				relRowsMapList.add ( relRows );

				count++;
				totalCount++;
				if ( totalCount == genes2PathLengths.size () )
					break;
			}
			relRowsMapLists.add ( relRowsMapList );
			relRowsMapList.clear ();
			count = 0;
		}
		
		// TODO: This can't work either, it writes the first entry for 2k times. 
		// and doesn't process anything else. 
		 
		for ( List<Map<String, Object>> mapList : relRowsMapLists )
		{
			Session session = null;
			try
			{
				session = driver.session ();
				Transaction tx = session.beginTransaction ();
				String baseCQLQuery = "UNWIND $relRowList AS relRow \n" + "MATCH ( s:Gene { ondexId: relRow.geneId } ) \n"
						+ "MATCH ( t:Concept { ondexId: relRow.conceptId } ) \n"
						+ "CREATE (s) - [:hasMotifLink { graphDistance: relRow.graphDistance }] -> (d)";
				for ( Map<String, Object> relRows : mapList )
				{
					tx.run ( baseCQLQuery, Map.of ( "relRowList", relRows ) );
				}
				tx.commit ();
				log.info ( "CQL transaction is committed." );
			}
			catch ( Exception e )
			{
				log.info ( "Exception popped up at Neo4j transaction: {}.", e.getMessage () );
			}
			finally
			{
				session.close ();
			}
		}
		*/
	}

	private void processBatch ( List<Map<String, Object>> smRelationsBatch )
	{
		try ( Session session = driver.session () )
		{
			Transaction tx = session.beginTransaction ();
			// TODO: Stop calling this CQL, it's Cypher, nobody says CQL and that's a confusing term
			String cyRelations = 
				"""
				UNWIND $smRelRows AS relRow 
			  MATCH ( s:Gene { ondexId: relRow.geneId } )
				MATCH ( t:Concept { ondexId: relRow.conceptId } )
			  CREATE (s) - [:hasMotifLink { graphDistance: relRow.graphDistance }] -> (d)					
				""";

			tx.run ( cyRelations, Map.of ( "smRelRows", smRelationsBatch ) );
			tx.commit ();

			/* TODO: remove. The point of UNWIND is to work with the entire batch as above
			for ( Map<String, Object> relRows : mapList )
			{
				tx.run ( baseCQLQuery, Map.of ( "relRowList", relationsBatch ) );
			}*/
		}
		
		/* TODO THIS IS EVIL! Please come to me to discuss why exceptions MUST NEVER BE 
		 * PROCESSED IN THIS WAY
		 * 
		 * https://marcobrandizi.info/a-few-notes-on-my-code-style/

		catch ( Exception e )
		{
			log.info ( "Exception popped up at Neo4j transaction: {}.", e.getMessage () );
		}		
		*/
	}
}
