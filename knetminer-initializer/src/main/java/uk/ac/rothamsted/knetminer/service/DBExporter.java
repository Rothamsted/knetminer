package uk.ac.rothamsted.knetminer.service;

import com.kitfox.svg.A;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.*;

public class DBExporter {
    @Value(value = "${neo4j.uri}")
    private String uri = "bolt://127.0.0.1:7687";
    @Value("${neo4j.username}")
    private String username = "neo4j";
    @Value("${neo4j.password")
    private String password = "neo4j-nova";

    private Driver driver = GraphDatabase.driver(uri, AuthTokens.basic(username, password));
    @Autowired
    private KnetMinerInitializer knetMinerInitializer;// = new KnetMinerInitializer();

    private Logger log = LogManager.getLogger ( this.getClass () );

    public DBExporter(KnetMinerInitializer knetMinerInitializer) {
        this.knetMinerInitializer = knetMinerInitializer;
    }

    /**
     * Launch of the unwind implementation of adding edges in Neo4j database.
     */
    public void launchEdgesExport(){
        batchExportToDB(knetMinerInitializer.getGenes2PathLengths());
        driver.close();
    }

    public void batchExportToDB(Map<Pair<Integer, Integer>, Integer> genes2PathLengthsMap) {
        int count = 0;
        int totalCount = 0;
        List<Map<String, Object>> relRowsMap = new ArrayList<>();
        //List<Map.Entry<Pair<Integer, Integer>, Integer>> mapEntriesList = new LinkedList<>();
        Set<Map.Entry<Pair<Integer, Integer>, Integer>> entries = genes2PathLengthsMap.entrySet();
        for (Map.Entry<Pair<Integer, Integer>, Integer> entry : entries) {
            while (count < 2000) {
                //mapEntriesList.add(entry);

                Map<String, Object> relRows = new HashMap<>();
                relRows.put("geneId", entry.getKey().getKey());
                relRows.put("conceptId", entry.getKey().getValue());
                relRows.put("graphDistance", entry.getValue());
                relRowsMap.add(relRows);

                count++;
                totalCount++;
                if (totalCount == genes2PathLengthsMap.size()) break;
            }
            this.exportToDB(relRowsMap);
            relRowsMap.clear();
            //this.exportToDB(mapEntriesList);
            //mapEntriesList.clear();
            count = 0;
        }
    }

    public void altBatchExportToDB(Map<Pair<Integer, Integer>, Integer> genes2PathLengthsMap) {
        int count = 0;
        int totalCount = 0;
        List<Map<String, Object>> relRowsMap = new ArrayList<>();
        //List<Map.Entry<Pair<Integer, Integer>, Integer>> mapEntriesList = new LinkedList<>();
        Set<Map.Entry<Pair<Integer, Integer>, Integer>> entries = genes2PathLengthsMap.entrySet();
        for (Map.Entry<Pair<Integer, Integer>, Integer> entry : entries) {
            while (count < 2000) {
                //mapEntriesList.add(entry);

                Map<String, Object> relRows = new HashMap<>();
                relRows.put("geneId", entry.getKey().getKey());
                relRows.put("conceptId", entry.getKey().getValue());
                relRows.put("graphDistance", entry.getValue());
                relRowsMap.add(relRows);

                count++;
                totalCount++;
                if (totalCount == genes2PathLengthsMap.size()) break;
            }
            this.altExportToDB(relRowsMap);
            relRowsMap.clear();
            //this.exportToDB(mapEntriesList);
            //mapEntriesList.clear();
            count = 0;
        }
    }

    private void exportToDB (List<Map<String, Object>> relRowsMap) {
        Session session = driver.session();
        Transaction tx = session.beginTransaction();
        String baseCQLQuery = "UNWIND $relRowList AS relRow \n" +
                "MATCH ( s:Gene { ondexId: relRow.geneId } ) \n" +
                "MATCH ( t:Concept { ondexId: relRow.conceptId } ) \n" +
                "CREATE (s) - [:hasMotifLink { graphDistance: relRow.graphDistance }] -> (d)";
        for (Map<String, Object> relRows : relRowsMap){
            tx.run(baseCQLQuery, Map.of("relRowList", relRows));
        }
        tx.commit();
        log.info("CQL transaction is committed.");
        session.close();
    }

    public void altExportToDB (List<Map<String, Object>> relRowsMap) {
        Session session = driver.session();
        Transaction tx = session.beginTransaction();
        String baseCQLQuery =
                "MATCH ( s:Gene { ondexId: $geneId } ) \n" +
                "MATCH ( t:Concept { ondexId: $conceptId } ) \n" +
                "CREATE (s) - [:hasMotifLink { graphDistance: $graphDistance }] -> (d)";
        for (Map<String, Object> relRows : relRowsMap){
            tx.run(baseCQLQuery, relRows);
        }
        tx.commit();
        log.info("CQL transaction is committed.");
        session.close();
    }
}
