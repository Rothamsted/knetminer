package uk.ac.rothamsted.knetminer.service;

import static org.junit.Assert.assertEquals;
import static uk.ac.rothamsted.knetminer.service.NeoConceptIndexer.CY_INDEX_NAME;

import java.util.HashSet;
import java.util.Set;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.Value;

import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

/**
 * Tests for {@link NeoConceptIndexer}.
 * 
 * <b>WARNING</b>: These tests are actually run only when you run
 * mvn -Pneo4j ... which setup a test Neo4j with the aratiny dummy
 * dataset.
 * 
 * @author Vitaly Vyurkov
 * @author Marco Brandizi
 * 
 * <dl><dt>Date:</dt><dd>22 Nov 2023</dd></dl>
 *
 */
public class NeoConceptIndexerIT
{
	@ClassRule
	public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource ();

	private Logger log = LogManager.getLogger ();

	/**
	 * Calls {@link NeoDriverTestResource#ensureNeo4jMode() neoDriverResource.ensureNeo4jMode()}, to 
	 * stop everything when not in Neo mode.
	 */
	@BeforeClass
	public static void init ()
	{
		neoDriverResource.ensureNeo4jMode ();
	}


	@Test
	public void testBasics ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		var indexer = new NeoConceptIndexer ();
		indexer.setDatabase ( neoDriver );

		indexer.createConceptsIndex ( "prefName", "altName", "Phenotype" );

		verify ( "prefName", "altName", "Phenotype", "Phenotype_1" );
	}

	/**
	 * Reads indexing params from config.
	 */
	@Test
	public void testReadFromConfig ()
	{
		var knetInitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
		
		var indexer = new NeoConceptIndexer ();
		indexer.setDatabase ( neoDriverResource.getDriver () );
		indexer.createConceptsIndex ( knetInitializer );

		verify ( "prefName", "altName", "Phenotype", "Phenotype_1", "PUB_1", "PUB_2" );
	}

	/**
	 * Reads both indexing params and Neo4j params from config.
	 */
	@Test
	public void testReadAllFromConfig ()
	{
		var knetInitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );

		var indexer = new NeoConceptIndexer ();
		indexer.setDatabase ( knetInitializer );
		indexer.createConceptsIndex ( knetInitializer );

		verify ( "prefName", "altName", "Phenotype", "Phenotype_1", "PUB_1", "PUB_2" );
	}

	/**
	 * Reads indexing params from config and Neo4j params from config, inferring the latter
	 * from the {@code config://} pattern.
	 */	
	@Test
	public void testReadAllFromConfigViaBoltURL ()
	{
		var knetInitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
		
		var indexer = new NeoConceptIndexer ();
		indexer.setDatabase ( "config://", null, null, knetInitializer );
		indexer.createConceptsIndex ( knetInitializer );

		verify ( "prefName", "altName", "Phenotype", "Phenotype_1", "PUB_1", "PUB_2" );
	}
	

	private void verify ( String ...exptProperties )
	{
		var neoDriver = neoDriverResource.getDriver ();
		try ( Session session = neoDriver.session () )
		{
			String cypherQuery = String.format ( 
				"SHOW ALL INDEXES WHERE name = '%s'", CY_INDEX_NAME
			);
			Result result = session.run ( cypherQuery );
			
			Set<String> properties = new HashSet<> ( result
			.next ()
			.get ( "properties" )
			.asList ( v -> v.asString () ) );
			
			log.debug ( "Returned properties list: {}", properties );
			
			var exptPropertiesSet = Set.of ( exptProperties );
			
			assertEquals ( 
				"Indexed properties don't match expected ones!",
				exptPropertiesSet, properties
			);
		}
	}
}