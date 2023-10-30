package uk.ac.rothamsted.knetminer.backend;

import static org.junit.Assert.assertEquals;

import java.io.IOException;

import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.rothamsted.knetminer.service.CypherInitializer;
import uk.ac.rothamsted.knetminer.service.CypherInitializerIT;
import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>11 Oct 2023</dd></dl>
 *
 */
public class KnetMinerInitializerCLICypherInitIT
{
	@ClassRule
	public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource (); 
	
	@BeforeClass
	public static void init () throws IOException
	{
		neoDriverResource.ensureNeo4jMode ();
		KnetMinerInitializerCLITest.init ();
	}
	
	/**
	 * TODO: this is a copy of the same method in {@link CypherInitializerIT}. Needs
	 * some refactoring, together with {@link #verify()}.
	 */
	@Before
	public void cleanTestData ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		var cyinit = new CypherInitializer ();
		cyinit.setDatabase ( neoDriver );

		cyinit.runCypher ( "MATCH (f:Foo) DELETE f" );

		try ( Session session = neoDriver.session() ) 
		{
			String cyVerify = """
				MATCH (f:Foo) RETURN COUNT(f) AS ct
				""";
			Result result = session.run( cyVerify );
			int ct = result.next ().get ( 0 ).asInt ();
			
			assertEquals ( "runCypher() didn't clean up!", 0, ct );
		}		
	}	
	
		
	@Test
	public void testAllFromParams ()
	{
		var exitCode = KnetMinerInitializerCLI.invoke (
			// "-i", KnetMinerInitializerCLITest.oxlPath, 
			// "-c" , KnetMinerInitializerCLITest.datasetPath + "/config/test-config-neo4j.yml",
		  "--neo-init-script", KnetMinerInitializerCLITest.datasetPath + "/config/neo4j/neo-init.cypher",
		  "--neo-url", "bolt://localhost:" + neoDriverResource.getBoltPort (),
		  "--neo-user", "neo4j",
		  "--neo-password", "testTest"
		);
		
		Assert.assertEquals ( "Wrong exit code!", 0, exitCode );

		verify ();
	}

	@Test
	public void testCmdsFromConfig ()
	{
		var exitCode = KnetMinerInitializerCLI.invoke (
			"-i", KnetMinerInitializerCLITest.oxlPath, 
			"-c" , KnetMinerInitializerCLITest.datasetPath + "/config/test-config-neo4j.yml",
		  "--neo-init-script", "config://",
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
		  "--neo-init-script", "config://",
		  "--neo-url", "config://"
		);
		
		Assert.assertEquals ( "Wrong exit code!", 0, exitCode );

		verify ();
	}
	
	
	/**
	 * TODO: this is a copy from {@link CypherInitializerIT}, see {@link #cleanTestData()}.
	 */
	private void verify ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		try ( Session session = neoDriver.session() ) 
		{
			String cyVerify = "MATCH (f:Foo) RETURN COUNT(f) AS ct";
			Result result = session.run( cyVerify );
			int ct = result.next ().get ( 0 ).asInt ();
			
			assertEquals ( "runCypher() failed, count verification doesn't match!", 2, ct );
		}
	}	
}
