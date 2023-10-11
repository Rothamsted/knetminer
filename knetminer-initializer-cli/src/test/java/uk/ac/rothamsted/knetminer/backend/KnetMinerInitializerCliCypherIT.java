package uk.ac.rothamsted.knetminer.backend;

import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;

import uk.ac.rothamsted.knetminer.service.CypherInitializerIT;
import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>11 Oct 2023</dd></dl>
 *
 */
public class KnetMinerInitializerCliCypherIT
{
	@ClassRule
	public static NeoDriverTestResource neoDriverResource = new NeoDriverTestResource (); 
	
	@BeforeClass
	public static void init ()
	{
		neoDriverResource.ensureNeo4jMode ( CypherInitializerIT.class );
	}

	
	@Test
	public void testCypherInit ()
	{
		
	}
	
}
