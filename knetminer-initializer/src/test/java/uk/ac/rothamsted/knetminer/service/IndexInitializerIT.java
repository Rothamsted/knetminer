package uk.ac.rothamsted.knetminer.service;

import java.util.List;
import java.util.Set;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.*;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

import static org.junit.Assert.assertEquals;

public class IndexInitializerIT {

    @ClassRule
    public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource ();

    private Logger log = LogManager.getLogger();

    @BeforeClass
    public static void init ()
    {
        neoDriverResource.ensureNeo4jMode ();
    }

    @AfterClass
    public static void removeIndex ()
    {
        var neoDriver = neoDriverResource.getDriver ();
        var indexInitializer = new IndexInitializer();
        indexInitializer.setDatabase ( neoDriver );

        try ( Session session = neoDriver.session() )
        {
            String cypherQuery = """
				DROP INDEX concept_index IF EXISTS
				""";
            session.run( cypherQuery );
        }
    }

    @Test
    public void testIndexBuildingFromPropertiesSet () {
        var neoDriver = neoDriverResource.getDriver ();
        var indexInitializer = new IndexInitializer();
        indexInitializer.setDatabase ( neoDriver );

        indexInitializer.createConceptsIndex(Set.of ( "prefName", "altName", "Phenotype" ));

        testIndexBuilding ();
/*
        try ( Session session = neoDriver.session() )
        {
            String cypherQuery = """
				SHOW ALL INDEXES WHERE name = "concept_index"
				""";
            Result result = session.run( cypherQuery );
            var propertiesList = result.next().get("properties").asList();
            log.info("Returned properties list: {}", propertiesList);
            var basePropertiesList = List.of("Phenotype", "Phenotype_1", "altName", "prefName");
            assertEquals("Returned properties list has gotten to be equal to the base properties list" ,propertiesList.toString(), basePropertiesList.toString());
        }
*/
    }

    @Test
    public void testReadFromConfig ()
    {
        var knetInitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
        var indInit = new IndexInitializer ();
        indInit.setDatabase ( neoDriverResource.getDriver () );

        indInit.createConceptsIndex ( knetInitializer );

        testIndexBuilding ();
    }

    @Test
    public void testReadAllFromConfig ()
    {
        var knetInitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
        var indInit = new IndexInitializer ();
        indInit.setDatabase ( knetInitializer );

        indInit.createConceptsIndex ( knetInitializer );

        testIndexBuilding ();
    }

    @Test
    public void testReadAllFromConfigViaBoltURL ()
    {
        var knetInitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
        var indInit = new IndexInitializer ();
        indInit.setDatabase ( "config://", null, null, knetInitializer );

        indInit.createConceptsIndex ( knetInitializer );

        testIndexBuilding ();
    }

    private void testIndexBuilding ()
    {
        var neoDriver = neoDriverResource.getDriver ();
        try ( Session session = neoDriver.session() )
        {
            String cypherQuery = """
				SHOW ALL INDEXES WHERE name = "concept_index"
				""";
            Result result = session.run( cypherQuery );
            var propertiesList = result.next().get("properties").asList();
            log.info("Returned properties list: {}", propertiesList);
            var basePropertiesList = List.of("Phenotype", "Phenotype_1", "altName", "prefName");
            assertEquals("Returned properties list has gotten to be equal to the base properties list" ,propertiesList.toString(), basePropertiesList.toString());
        }
    }
}