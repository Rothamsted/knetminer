package uk.ac.rothamsted.knetminer.backend;

import static java.lang.String.format;
import static org.junit.Assert.assertEquals;
import static org.neo4j.driver.Values.parameters;
import static uk.ac.rothamsted.knetminer.service.NeoConceptIndexer.CY_INDEX_NAME;
import static uk.ac.rothamsted.knetminer.service.NeoGenePubIdIndexer.CY_ACC_INDEX_NAME;
import static uk.ac.rothamsted.knetminer.service.NeoGenePubIdIndexer.CY_NAME_INDEX_NAME;

import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
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
	
	/**
	 * Calls {@link KnetMinerInitializerCLICypherInitIT#init()}, that is, checks if we're in 
	 * Neo mode  build and possibly do some initialisation.
	 * 
	 */
	@BeforeClass
	public static void init ()
	{
		KnetMinerInitializerCLICypherInitIT.init ();
	}
	
	/**
	 * The component removes the index, but we do this here, to be sure that methods like {@link #verify()}
	 * catches a newly-created index.
	 */
	@Before
	public void removeIndex ()
	{
		var neoDriver = neoDriverResource.getDriver ();

		for ( String idxName: new String[] { CY_INDEX_NAME, CY_ACC_INDEX_NAME, CY_NAME_INDEX_NAME } )
		{
			try ( Session session = neoDriver.session () ) {
				session.run ( format ( "DROP INDEX %s IF EXISTS", idxName ) );
			}
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
			var nrows = session.run (
				"SHOW ALL INDEXES WHERE name IN $idxNames",
				parameters ( "idxNames", List.of ( CY_INDEX_NAME, CY_ACC_INDEX_NAME, CY_NAME_INDEX_NAME ) )
			)
			.list ()
			.size ();
			
			assertEquals ( "Indexer didn't create an index!", 3, nrows );
		}
	}	
}
