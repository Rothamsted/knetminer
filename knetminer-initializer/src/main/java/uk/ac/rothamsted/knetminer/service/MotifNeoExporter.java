package uk.ac.rothamsted.knetminer.service;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import uk.ac.rothamsted.knetminer.backend.cypher.genesearch.CypherGraphTraverser;

import java.util.*;

public class MotifNeoExporter 
{
		/**
		 * TODO: It can't come from yet another configuration, cause the initialiser has its own
		 * Spring context inside {@link CypherGraphTraverser}, this gets the Neo4j driver 
		 * from a Spring config file and I'll write a getter to access such driver here. 
		 * 
		 * For the moment, these should be parameters coming from the outside, 
		 * 
		 * Re-read the ticket #3, I've simplified things so that we
		 * only need: 
		 * 
		 * setDatabaseDriver ( driver )
		 * 
		 * And this class should keep just a driver field, without dealing with its opening or
		 * closing (cause we need to do that elsewhere, eg, let it to Spring).
		 */
    @Value(value = "${neo4j.uri}")
    private String uri = "bolt://127.0.0.1:7687";
    @Value("${neo4j.username}")
    private String username = "neo4j";
    @Value("${neo4j.password")
    private String password = "neo4j-nova";

    private Driver driver = GraphDatabase.driver(uri, AuthTokens.basic(username, password));
    
    /**
     * TODO: no, it can't depend on the initialiser this way and at least for now, 
     * this class can't be a Spring component, since Spring is not used in the CLI
     * wrapper.
     * 
     * Here, we only needs {@link KnetMinerInitializer#getGenes2PathLengths()}, so 
     * there is no need for this field, and it is against the separation-of-concerns.
     * 
     */
    @Autowired
    private KnetMinerInitializer knetMinerInitializer;// = new KnetMinerInitializer();

    private Logger log = LogManager.getLogger ( this.getClass () );

    public MotifNeoExporter(KnetMinerInitializer knetMinerInitializer) {
        this.knetMinerInitializer = knetMinerInitializer;
    }

    /**
     * Launch of the unwind implementation of adding edges in Neo4j database.
     * 
     * TODO: Please read #3 and stick to the proposed methods described there
     * We need only:
     * 
     * saveMotifs( Map<Pair<Integer, Integer>, Integer> genes2PathLengths )
     * 
     * and we need it to work with the UNWIND approach, remove all the other approaches.
     * 
     * Also, don't close the driver, as said above, it's not a concern of this class.
     * 
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
    	  // As suggested by the compiler, use try-with to get auto-closing of 
    	  // objects like session. Do not close them explicitly and outside of 
    	  // a try/catch (since it's less readable and you might miss closure 
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
