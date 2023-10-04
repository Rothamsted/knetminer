package uk.ac.rothamsted.knetminer.service;

import org.junit.BeforeClass;
import org.junit.ClassRule;

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
	
	
	public void testBasics ()
	{
		CypherInitializer cynit = new CypherInitializer ();
	}
}
