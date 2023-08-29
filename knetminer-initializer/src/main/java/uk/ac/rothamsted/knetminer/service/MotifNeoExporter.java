package uk.ac.rothamsted.knetminer.service;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.*;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.runcontrol.PercentProgressLogger;

import java.util.*;

/**
 *
 * TODO: comment me!
 *
 * <dl><dt>Date:</dt><dd>25 Aug 2023</dd></dl>
 *
 */
public class MotifNeoExporter {
	private Driver driver;

	private Logger log = LogManager.getLogger();

	public void setDatabase(Driver driver) {
		this.driver = driver;
	}

	public void saveMotifs(Map<Pair<Integer, Integer>, Integer> genes2PathLengths) {
		try {
			final int batchSize = 2000;
			PercentProgressLogger progressLogger = new PercentProgressLogger(
					"{}% semantic motif endpoints processed",
					genes2PathLengths.size()
			);
			List<Map<String, Object>> relsBatch = null;

			for (var smEntry : genes2PathLengths.entrySet()) {
				var gene2Concept = smEntry.getKey();
				int geneId = gene2Concept.getLeft();
				int conceptId = gene2Concept.getRight();
				int distance = smEntry.getValue();

				if (relsBatch == null) relsBatch = new ArrayList<>();

				relsBatch.add(Map.of(
						"geneId", geneId,
						"conceptId", conceptId,
						"graphDistance", distance
				));

				progressLogger.updateWithIncrement();

				if (relsBatch.size() == batchSize || progressLogger.getProgress() == genes2PathLengths.size()) {
					processBatch(relsBatch);
					relsBatch = null;
				}
			}
		} catch (Exception ex) {
			ExceptionUtils.throwEx(RuntimeException.class, ex,
					"Error while saving semantic motif endpoints to Neo4j: $cause"
			);
		}
	}

	private void processBatch(List<Map<String, Object>> smRelationsBatch) {
		try (Session session = driver.session()) {
			Transaction tx = session.beginTransaction();
			String cyRelations =
					"""
							  UNWIND $smRelRows AS relRow 
							MATCH ( s:Gene { ondexId: relRow.geneId } )
							  MATCH ( t:Concept { ondexId: relRow.conceptId } )
							CREATE (s) - [:hasMotifLink { graphDistance: relRow.graphDistance }] -> (t)					
							  """;
			tx.run(cyRelations, Map.of("smRelRows", smRelationsBatch));
			tx.commit();
			// TODO: remove or use a lower level, like trace
			// This is going to happen tens of times, we don't 
			// want the log to be so verbose
			// log.info("Cypher transaction is committed.");
		}
	}
}
