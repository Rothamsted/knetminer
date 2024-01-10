package uk.ac.rothamsted.knetminer.backend;

import static org.junit.Assert.assertTrue;

import java.io.IOException;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.rothamsted.knetminer.service.NeoMotifImporter;
import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

/**
 * Tests the {@link NeoMotifImporter} CLI wrapper.
 *
 * <b>WARNING</b>: These tests are actually run only when you run
 * mvn -Pneo4j ... which setup a test Neo4j with the aratiny dummy
 * dataset.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>21 Oct 2023</dd></dl>
 *
 */
public class KnetMinerInitializerCLIMotifImporterIT
{
	@ClassRule
	public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource ();
	
	@BeforeClass
	public static void init () throws IOException
	{
		KnetMinerInitializerCLICypherInitIT.init ();
		NeoMotifImporter.setSampleSize ( 100 );
	}
			
	
	@AfterClass
	public static void resetTestMode ()
	{
		// Just in case other classes needs it
		NeoMotifImporter.resetSampleSize ();
	}
	
	@Test // @Ignore ( "TODO: Cypher is still too slow, to be improved with parallel batches" )
	public void testAllFromParams ()
	{
		var exitCode = KnetMinerInitializerCLI.invoke (
			"--neo-motifs",
			//"--input", KnetMinerInitializerCLITest.oxlPath, 
			"--config", KnetMinerInitializerCLITest.datasetPath + "/config/test-config-neo4j.yml",
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
			"--neo-motifs",
		  "--neo-url", "config://"
		);
		
		Assert.assertEquals ( "Wrong exit code!", 0, exitCode );

		verify ();
	}
	
	
	private void verify ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		
		try ( Session session = neoDriver.session() ) 
		{
			String cyVerify = """
				MATCH () - [lnk:hasMotifLink] -> () RETURN COUNT ( lnk ) AS cnt
				""";
			Result result = session.run( cyVerify );
			int ct = result.next ().get ( 0 ).asInt ();
			
			assertTrue ( "Semantic motif links not created!", ct > 0);
		}			
	}
}
