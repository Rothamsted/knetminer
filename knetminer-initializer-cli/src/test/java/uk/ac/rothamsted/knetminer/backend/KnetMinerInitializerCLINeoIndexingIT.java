package uk.ac.rothamsted.knetminer.backend;

import static org.junit.Assert.assertTrue;
import static uk.ac.rothamsted.knetminer.service.NeoConceptIndexer.CY_INDEX_NAME;

import java.io.IOException;

import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.rothamsted.knetminer.service.NeoConceptIndexer;
import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

/**
 * Tests the {@link NeoConceptIndexer} CLI wrapper.
 * 
 * <b>WARNING</b>: These tests are actually run only when you run
 * mvn -Pneo4j ... which setup a test Neo4j with the aratiny dummy
 * dataset.
 *
 * @author Marco Brandizi
 * <dl><dt>Date:</dt><dd>29 Nov 2023</dd></dl>
 *
 */
public class KnetMinerInitializerCLINeoIndexingIT
{
	@ClassRule
	public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource (); 
	
	@BeforeClass
	public static void init () throws IOException
	{
		KnetMinerInitializerCLICypherInitIT.init ();
	}
	
	/**
	 * The component removes the index, but we do this here, to be sure that {@link #verify()}
	 * catches a newly-created index.
	 */
	@Before
	public void removeIndex ()
	{
		var neoDriver = neoDriverResource.getDriver ();

		try ( Session session = neoDriver.session () )
		{
			String cypherQuery = String.format (
				"DROP INDEX %s IF EXISTS", CY_INDEX_NAME
			);
			session.run ( cypherQuery );
		}
	}	
		
	@Test
	public void testAllFromParams ()
	{
		var exitCode = KnetMinerInitializerCLI.invoke (
			//"-i", KnetMinerInitializerCLITest.oxlPath, 
			//"-c" , KnetMinerInitializerCLITest.datasetPath + "/config/test-config-neo4j.yml",
		  "--neo-index", KnetMinerInitializerCLITest.datasetPath + "/config/neo4j/concept-index-properties.txt",
		  "--neo-url", "bolt://localhost:" + neoDriverResource.getBoltPort (),
		  "--neo-user", "neo4j",
		  "--neo-password", "testTest"
		);
		
		Assert.assertEquals ( "Wrong exit code!", 0, exitCode );

		verify ();
	}

	@Test
	public void testPropNamesFromConfig ()
	{
		var exitCode = KnetMinerInitializerCLI.invoke (
			//"-i", KnetMinerInitializerCLITest.oxlPath, 
			"-c" , KnetMinerInitializerCLITest.datasetPath + "/config/test-config-neo4j.yml",
		  "--neo-index", "config://",
		  "--neo-url", "bolt://localhost:" + neoDriverResource.getBoltPort (),
		  "--neo-user", "neo4j",
		  "--neo-password", "testTest"
		);
		
		Assert.assertEquals ( "Wrong exit code!", 0, exitCode );

		verify ();
	}

	@Test
	public void testAllFromConfig ()
	{
		var exitCode = KnetMinerInitializerCLI.invoke (
			// From config when omitted "-i", KnetMinerInitializerCLITest.oxlPath, 
			"-c" , KnetMinerInitializerCLITest.datasetPath + "/config/test-config-neo4j.yml",
		  "--neo-index", "config://"
		  // "--neo-url", "config://" // this is the default
		);
		
		Assert.assertEquals ( "Wrong exit code!", 0, exitCode );

		verify ();
	}
	
	
	/**
	 * TODO: this is a copy from {@link uk.ac.rothamsted.knetminer.service.NeoInitializerIT}, 
	 * see {@link #cleanTestData()}.
	 */
	private void verify ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		try ( Session session = neoDriver.session () )
		{
			String cypherQuery = String.format ( 
				"SHOW ALL INDEXES WHERE name = '%s'", CY_INDEX_NAME
			);
			Result result = session.run ( cypherQuery );
			
			assertTrue ( "Indexer didn't create an index!", result.hasNext () );
		}
	}	
}
