package uk.ac.rothamsted.knetminer.service;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

/**
 * Tests for {@link NeoInitializer}
 * 
 * <b>WARNING</b>: These tests are actually run only when you run
 * mvn -Pneo4j ... which setup a test Neo4j with the aratiny dummy
 * dataset.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>3 Oct 2023</dd></dl>
 *
 */
public class NeoInitializerIT
{
	@ClassRule
	public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource (); 
	
	/**
	 * Calls {@link NeoDriverTestResource#ensureNeo4jMode() neoDriverResource.ensureNeo4jMode()}, to 
	 * stop everything when not in Neo mode.
	 */
	@BeforeClass
	public static void init ()
	{
		neoDriverResource.ensureNeo4jMode ();
	}
	
	@Before
	public void cleanTestData ()
	{
		var neoDriver = neoDriverResource.getDriver ();
		var cyinit = new NeoInitializer ();
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
	public void testBasics ()
	{
		var cyinit = new NeoInitializer ();
		cyinit.setDatabase ( neoDriverResource.getDriver () );
		
		cyinit.runCypher (
			"CREATE (:Foo{ id: 'cyinitTest01', descr: 'Created by unit test' })",
			"CREATE (:Foo{ id: 'cyinitTest02', descr: 'Created by unit test' })"
		);
		
		verify ();
	}
	
	@Test
	public void testReadFromConfig ()
	{
		var kinitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
		NeoInitializer cyinit = new NeoInitializer ();
		cyinit.setDatabase ( neoDriverResource.getDriver () );

		cyinit.runCypher ( kinitializer );
	
		verify ();
	}

	@Test
	public void testReadAllFromConfig ()
	{
		var kinitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
		var cyinit = new NeoInitializer ();
		cyinit.setDatabase ( kinitializer );

		cyinit.runCypher ( kinitializer );
	
		verify ();
	}
	
	@Test
	public void testReadAllFromConfigViaBoltURL ()
	{
		var kinitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
		var cyinit = new NeoInitializer ();
		cyinit.setDatabase ( "config://", null, null, kinitializer );

		cyinit.runCypher ( kinitializer );
	
		verify ();
	}
	
	
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
