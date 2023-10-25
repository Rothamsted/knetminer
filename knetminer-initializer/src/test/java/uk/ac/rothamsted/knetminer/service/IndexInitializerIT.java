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

import static org.junit.Assert.assertEquals;

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

        //indexInitializer.runCypher ( "MATCH (f:Foo) DELETE f" );

        try ( Session session = neoDriver.session() )
        {
            String cyVerify = """
				MATCH (c:Concept) RETURN COUNT(c) AS ct
				""";
            Result result = session.run( cyVerify );
            int ct = result.next ().get ( 0 ).asInt ();
            log.info("Number of concepts in database: {}", ct);
        }
    }

    @Test
    public void testIndexInitializer(){
        //IndexInitializer indexInitializer = new IndexInitializer();
        var neoDriver = neoDriverResource.getDriver ();
        var indexInitializer = new IndexInitializer();
        indexInitializer.setDatabase ( neoDriver );
        /*int returnInt =*/ indexInitializer.createConceptsIndex(Set.of("prefName", "altName"));
        //assertEquals("Return integer has gotten to be 0", returnInt, 0);
    }
}
