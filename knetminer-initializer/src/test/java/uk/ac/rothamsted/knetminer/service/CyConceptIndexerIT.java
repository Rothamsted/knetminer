package uk.ac.rothamsted.knetminer.service;

import static org.junit.Assert.assertEquals;
import static uk.ac.rothamsted.knetminer.service.CyConceptIndexer.CY_INDEX_NAME;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

/**
 * Tests for {@link CyConceptIndexer}.
 *
 * @author Vitaly Vyurkov
 * @author Marco Brandizi
 * <dl><dt>Date:</dt><dd>22 Nov 2023</dd></dl>
 *
 */
public class CyConceptIndexerIT
{
	@ClassRule
	public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource ();

	private Logger log = LogManager.getLogger ();

	@BeforeClass
	public static void init ()
	{
		neoDriverResource.ensureNeo4jMode ();
	}


	@Test
	public void testBasics ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		var indexer = new CyConceptIndexer ();
		indexer.setDatabase ( neoDriver );

		indexer.createConceptsIndex ( "prefName", "altName", "Phenotype" );

		verify ();
	}

	@Test
	public void testReadFromConfig ()
	{
		var knetInitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
		
		var indexer = new CyConceptIndexer ();
		indexer.setDatabase ( neoDriverResource.getDriver () );
		indexer.createConceptsIndex ( knetInitializer );

		verify ();
	}

	@Test
	public void testReadAllFromConfig ()
	{
		var knetInitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );

		var indexer = new CyConceptIndexer ();
		indexer.setDatabase ( knetInitializer );
		indexer.createConceptsIndex ( knetInitializer );

		verify ();
	}

	@Test
	public void testReadAllFromConfigViaBoltURL ()
	{
		var knetInitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
		
		var indexer = new CyConceptIndexer ();
		indexer.setDatabase ( "config://", null, null, knetInitializer );
		indexer.createConceptsIndex ( knetInitializer );

		verify ();
	}

	private void verify ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		try ( Session session = neoDriver.session () )
		{
			String cypherQuery = String.format ( 
				"SHOW ALL INDEXES WHERE name = '%s'", CY_INDEX_NAME
			);
			Result result = session.run ( cypherQuery );
			
			var properties = result
				.next ()
				.get ( "properties" )
				.asList ();
			
			log.info ( "Returned properties list: {}", properties );
			
			var exptProperties = List.of ( "Phenotype", "Phenotype_1", "altName", "prefName" );
			assertEquals ( 
				"Indexed properties don't match expected ones!",
				properties, exptProperties
			);
		}
	}
}