/*
 * TODO: replaced by MotifNeoExporterIT. 
 * Read the TODO: comments below and then remove this file
 *  
 */
//package uk.ac.rothamsted.knetminer.service;
//
//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;
//import org.neo4j.driver.*;
//import org.neo4j.harness.Neo4j;
//import org.neo4j.harness.Neo4jBuilders;
//
//import uk.ac.ebi.utils.time.XStopWatch;
//
//import org.junit.Test;
//
//import org.apache.commons.lang3.tuple.Pair;
//
//import java.time.Instant;
//import java.util.Map;
//import java.util.stream.Collectors;
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
//        private MotifNeoExporter exporter = new MotifNeoExporter();
//
//        private Map<Pair<Integer, Integer>, Integer> testGenes2PathLengths = Map.of(Pair.of(1, 2), 1);
//
//        private static final Logger log = LogManager.getLogger(MotifNeoExporterTest.class);
//
//        @Test
//        public void testDBExportation() {
//        log.info("Size of testGenes2PathLengths map: " + testGenes2PathLengths.size());
//        log.info("Entry set of testGenes2PathLengths map: " + testGenes2PathLengths.entrySet().toString());
//        
//        /* TODO: we don't always need to time everything, and for the cases where we need, use helpers like
//         * this:
//         */
//        // var exportTime = XStopWatch.profile ( () -> exporter.saveMotifs(testGenes2PathLengths) ); 
//        
//        long exportStart = Instant.now().toEpochMilli();
//        exporter.saveMotifs(testGenes2PathLengths);
//        long exportEnd = Instant.now().toEpochMilli();
//        log.info("Exportation time: " + (exportEnd - exportStart));
//        }
//
//    @Test
//    public void hasNode(){
//        exporter.saveMotifs(testGenes2PathLengths);
//        Session session = null;
//        try {
//            session = driver.session();
//            String cqlQuery = "MATCH (g:Gene)\n" +
//                    "WHERE g.ondexId = 1\n" +
//                    "RETURN g.ondexId";
//            Result result = session.run(cqlQuery);
//            log.info("Node: " + result.list().toString());
//        } catch (Exception e) {
//            // TODO: NEVER EVER deal with exceptions this way!!!
//            log.info("Exception popped up at Neo4j session: {}.", e.getMessage());
//        } finally {
//            session.close();
//        }
//    }
//}
