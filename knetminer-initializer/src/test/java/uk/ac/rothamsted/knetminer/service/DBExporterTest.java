package uk.ac.rothamsted.knetminer.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.harness.Neo4j;
import org.neo4j.harness.Neo4jBuilders;

import org.junit.Test;

import org.apache.commons.lang3.tuple.Pair;

import java.time.Instant;
import java.util.Map;

public class DBExporterTest {

        private Neo4j embeddedDatabaseServer = Neo4jBuilders.newInProcessBuilder()
                .withDisabledServer()
                .withFixture("CREATE (:Gene {ondexId: 1})")
                .withFixture("CREATE (:Concept {ondexId: 2})")
                .build();

        private Driver driver = GraphDatabase.driver(embeddedDatabaseServer.boltURI());

        private KnetMinerInitializer knetMinerInitializer = new KnetMinerInitializer();

        private DBExporter exporter = new DBExporter(knetMinerInitializer);

        private Map<Pair<Integer, Integer>, Integer> testGenes2PathLengths = Map.of(Pair.of(1, 2), 1);

        private static final Logger log = LogManager.getLogger(DBExporterTest.class);

        @Test
        public void testDBExportation() {
        log.info("Size of testGenes2PathLengths map: " + testGenes2PathLengths.size());
        log.info("Entry set of testGenes2PathLengths map: " + testGenes2PathLengths.entrySet().toString());
        long exportStart = Instant.now().toEpochMilli();
        exporter.batchExportToDB(testGenes2PathLengths);
        long exportEnd = Instant.now().toEpochMilli();
        log.info("Exportation time: " + (exportEnd - exportStart));
        }

        @Test
        public void testAltDBExportation() {
        log.info("Size of testGenes2PathLengths map: " + testGenes2PathLengths.size());
        log.info("Entry set of testGenes2PathLengths map: " + testGenes2PathLengths.entrySet().toString());
        long exportStart = Instant.now().toEpochMilli();
        exporter.altBatchExportToDB(testGenes2PathLengths);
        long exportEnd = Instant.now().toEpochMilli();
        log.info("Alternative exportation time: " + (exportEnd - exportStart));
        }

}
