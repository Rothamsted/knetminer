package uk.ac.rothamsted.knetminer.service;

import static org.junit.Assert.assertEquals;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

/**
 * @author Marco Brandizi
 * <dl><dt>Date:</dt><dd>7 Mar 2024</dd></dl>
 *
 */
public class NeoPrefNamesFixIT
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
		var prefNameFix = new NeoPrefNamesFix ();
		prefNameFix.setDatabase ( neoDriver );
		
		prefNameFix.fixNames ();
		
		try ( Session session = neoDriver.session () ) 
		{
			Result rs = session.run ( """
				MATCH (c:Concept) 
				WHERE c.prefName IS NOT NULL AND c.prefName IS::LIST<String>
				RETURN COUNT ( c ) AS count
			""" );
			
			int wrongGenes = rs.next ().get ( "count", -1 );
			assertEquals ( "chromosome properties fix went wrong!", 0, wrongGenes );			
		}
	}
}
