package uk.ac.rothamsted.knetminer.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

import java.util.Set;

import static org.junit.Assert.*;

public class IndexInitializerIT {

    @ClassRule
    public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource ();

    @BeforeClass
    public static void init ()
    {
        neoDriverResource.ensureNeo4jMode ();
    }

    private Logger log = LogManager.getLogger();

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
    public void testIndexInitializer(){
        var neoDriver = neoDriverResource.getDriver ();
        var indexInitializer = new IndexInitializer();
        indexInitializer.setDatabase ( neoDriver );
        indexInitializer.createConceptsIndex(Set.of("prefName", "altName"));
    }
}
