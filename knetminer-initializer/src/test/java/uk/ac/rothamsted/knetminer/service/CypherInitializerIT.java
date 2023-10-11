package uk.ac.rothamsted.knetminer.service;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>3 Oct 2023</dd></dl>
 *
 */
public class CypherInitializerIT
{
	@ClassRule
	public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource (); 
	
	@BeforeClass
	public static void init ()
	{
		MotifNeoExporterIT.ensureNeo4jMode ( CypherInitializerIT.class );
	}
	
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
	public void testBasics ()
	{
		var cyinit = new CypherInitializer ();
		cyinit.setDatabase ( neoDriverResource.getDriver () );
		
		cyinit.runCypher (
			"CREATE (:Foo{ id: 'cyinitTest01', descr: 'Created by unit test' })",
			"CREATE (:Foo{ id: 'cyinitTest02', descr: 'Created by unit test' })"
		);
		
		verify ( cyinit );
	}
	
	@Test
	public void testReadFromConfig ()
	{
		var kinitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
		CypherInitializer cyinit = new CypherInitializer ();
		cyinit.setDatabase ( neoDriverResource.getDriver () );

		cyinit.runCypher ( kinitializer );
	
		verify ( cyinit );
	}

	@Test
	public void testReadAllFromConfig ()
	{
		var kinitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
		var cyinit = new CypherInitializer ();
		cyinit.setDatabase ( kinitializer );

		cyinit.runCypher ( kinitializer );
	
		verify ( cyinit );
	}
	
	@Test
	public void testReadAllFromConfigViaBoltURL ()
	{
		var kinitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false, true );
		var cyinit = new CypherInitializer ();
		cyinit.setDatabase ( "config://", null, null, kinitializer );

		cyinit.runCypher ( kinitializer );
	
		verify ( cyinit );
	}
	
	
	private void verify ( CypherInitializer cyinit )
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
