package uk.ac.rothamsted.knetminer.service;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import uk.ac.rothamsted.knetminer.backend.cypher.genesearch.CypherGraphTraverser;

import java.sql.SQLException;
import java.util.*;

public class MotifNeoExporter 
{
    @Value(value = "${neo4j.uri}")
    private String uri = "bolt://127.0.0.1:7687";
    @Value("${neo4j.username}")
    private String username = "neo4j";
    @Value("${neo4j.password")
    private String password = "neo4j-nova";

    private Driver driver;

    private Map<Integer, Set<Integer>> genes2PathLengths;

    private Logger log = LogManager.getLogger ( this.getClass () );

    public MotifNeoExporter() {
        this.genes2PathLengths = new KnetMinerInitializer().getConcepts2Genes();
        setDefaultDatabase();
    }

    public void setDatabase ( Driver driver ){
        this.driver = driver;
        log.info("Neo4j driver is set.");
    };

    private void setDefaultDatabase (){
        this.driver = GraphDatabase.driver(uri, AuthTokens.basic(username, password));
        log.info("Default Neo4j driver is set.");
    };
    public void saveMotifs( Map<Pair<Integer, Integer>, Integer> genes2PathLengths ){
        int count = 0;
        int totalCount = 0;
        List<Map<String, Object>> relRowsMapList = new ArrayList<>();
        List<List<Map<String, Object>>> relRowsMapLists = new ArrayList<>();
        Set<Map.Entry<Pair<Integer, Integer>, Integer>> entries = genes2PathLengths.entrySet();
        for (Map.Entry<Pair<Integer, Integer>, Integer> entry : entries) {
            while (count < 2000) {
                Map<String, Object> relRows = new HashMap<>();
                relRows.put("geneId", entry.getKey().getKey());
                relRows.put("conceptId", entry.getKey().getValue());
                relRows.put("graphDistance", entry.getValue());
                relRowsMapList.add(relRows);

                count++;
                totalCount++;
                if (totalCount == genes2PathLengths.size()) break;
            }
            relRowsMapLists.add(relRowsMapList);
            relRowsMapList.clear();
            count = 0;
        }
        for(List<Map<String, Object>> mapList : relRowsMapLists) {
            Session session = null;
            try {
                session = driver.session();
                Transaction tx = session.beginTransaction();
                String baseCQLQuery = "UNWIND $relRowList AS relRow \n" +
                        "MATCH ( s:Gene { ondexId: relRow.geneId } ) \n" +
                        "MATCH ( t:Concept { ondexId: relRow.conceptId } ) \n" +
                        "CREATE (s) - [:hasMotifLink { graphDistance: relRow.graphDistance }] -> (d)";
                for (Map<String, Object> relRows : mapList) {
                    tx.run(baseCQLQuery, Map.of("relRowList", relRows));
                }
                tx.commit();
                log.info("CQL transaction is committed.");
            } catch (Exception e) {
                log.info("Exception popped up at Neo4j transaction: {}.", e.getMessage());
            } finally {
                session.close();
            }
        }
    }
}
