//package uk.ac.rothamsted.knetminer.service;
//
//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;
//import org.neo4j.driver.Driver;
//import org.neo4j.driver.GraphDatabase;
//import org.neo4j.harness.Neo4j;
//import org.neo4j.harness.Neo4jBuilders;
//
//import org.junit.Test;
//
//import org.apache.commons.lang3.tuple.Pair;
//
//import java.time.Instant;
//import java.util.Map;
//
//public class MotifNeoExporterTest {
//
//			 /**
//			  * TODO: As already said, this can't be tested with Harness. 
//			  * 
//			  * I'll prepare a test skeleton, which will be similar to test classes 
//			  * in aratiny-ws (eg, ApiIT.java)
//			  * 
//			  * Before that is ready, this test is good, but you should make more verifications 
//			  * using Cypher. That is, test that there are 'hasMotifLink' relations are created 
//			  * and they match the test nodes and the testGenes2PathLengths dummy map that 
//			  * you are creating programmatically.
//			  * 
//			  * You don't need the initialiser at all to perform this basic test, since you're 
//			  * injecting completely mock-up data, which is a good basic test case, to be tried
//			  * before using a more realistic test dataset. 
//			  *  
//			  */
//       private Neo4j embeddedDatabaseServer = Neo4jBuilders.newInProcessBuilder()
//                .withDisabledServer()
//                .withFixture("CREATE (:Gene {ondexId: 1})")
//                .withFixture("CREATE (:Concept {ondexId: 2})")
//                .build();
//
//        private Driver driver = GraphDatabase.driver(embeddedDatabaseServer.boltURI());
//
//        private KnetMinerInitializer knetMinerInitializer = new KnetMinerInitializer();
//
//        private MotifNeoExporter exporter = new MotifNeoExporter(knetMinerInitializer);
//
//        private Map<Pair<Integer, Integer>, Integer> testGenes2PathLengths = Map.of(Pair.of(1, 2), 1);
//
//        private static final Logger log = LogManager.getLogger(MotifNeoExporterTest.class);
//
//        @Test
//        public void testDBExportation() {
//        log.info("Size of testGenes2PathLengths map: " + testGenes2PathLengths.size());
//        log.info("Entry set of testGenes2PathLengths map: " + testGenes2PathLengths.entrySet().toString());
//        long exportStart = Instant.now().toEpochMilli();
//        exporter.batchExportToDB(testGenes2PathLengths);
//        long exportEnd = Instant.now().toEpochMilli();
//        log.info("Exportation time: " + (exportEnd - exportStart));
//        }
//
//        @Test
//        public void testAltDBExportation() {
//        log.info("Size of testGenes2PathLengths map: " + testGenes2PathLengths.size());
//        log.info("Entry set of testGenes2PathLengths map: " + testGenes2PathLengths.entrySet().toString());
//        long exportStart = Instant.now().toEpochMilli();
//        exporter.altBatchExportToDB(testGenes2PathLengths);
//        long exportEnd = Instant.now().toEpochMilli();
//        log.info("Alternative exportation time: " + (exportEnd - exportStart));
//        }
//
//}
