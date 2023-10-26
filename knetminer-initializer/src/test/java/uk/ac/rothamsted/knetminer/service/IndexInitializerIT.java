package uk.ac.rothamsted.knetminer.service;

import java.util.Set;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

public class IndexInitializerIT {

    @ClassRule
    public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource ();

    private Logger log = LogManager.getLogger();

    /* TODO: (remove after reading) don't declare class members in random order.
     * Usually, the order is: inner classes, fields, methods, and usually from the most abstract
     * or most important to the least ones (eg, log is the latest in the fields section)
     */
    
    @BeforeClass
    public static void init ()
    {
        neoDriverResource.ensureNeo4jMode ();
    }

    /*
     * TODO: clean existing index, see CypherInitializerIT.cleanTestData(). 
     * Without this, we can't know if the verified index was created by the test 
     */


    /**
     * TODO: remove, what's the point? 
     */
    @Before
    public void getDBSize ()
    {
        var neoDriver = neoDriverResource.getDriver ();
        var indexInitializer = new IndexInitializer();
        indexInitializer.setDatabase ( neoDriver );

        try ( Session session = neoDriver.session() )
        {
            String cypherQuery = """
				MATCH (c:Concept) RETURN COUNT(c) AS ct
				""";
            Result result = session.run( cypherQuery );
            int ct = result.next ().get ( 0 ).asInt ();
            log.info("Number of concepts in database: {}", ct);
        }
    }
    
    @Test
    public void testIndexCreation () {
        var neoDriver = neoDriverResource.getDriver ();
        var indexInitializer = new IndexInitializer();
        indexInitializer.setDatabase ( neoDriver );
        
        /* We need to test properties like Phenotype, which has Phenotype_NN in the DB,
         * else we wouldn'd have much test coverage.
         */
        indexInitializer.createConceptsIndex(Set.of ( "prefName", "altName", "Phenotype" ));
        
        // TODO: verify the index exists and that it contains the expected properties
        // https://neo4j.com/docs/cypher-manual/current/indexes-for-search-performance/#indexes-list-indexes
    }
}
