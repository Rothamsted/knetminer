package uk.ac.rothamsted.knetminer.service;

import static org.junit.Assert.assertEquals;
import static org.neo4j.driver.Values.parameters;

import java.util.List;

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
public class NeoChromosomeFixIT
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
		var chrFix = new NeoChromosomeFix ();
		chrFix.setDatabase ( neoDriver );
		
		chrFix.processChromosomes ();
		
		try ( Session session = neoDriver.session () ) 
		{
			// Int properties
			//
			Result rs = session.run ( """
				MATCH (g:Gene)
				WHERE 
				  g.BEGIN IS NOT NULL AND g.BEGIN IS::String
				  OR g.END IS NOT NULL AND g.END IS::String
				RETURN COUNT ( g ) AS count
			""" );
			
			int wrongGenes = rs.next ().get ( "count", -1 );
			assertEquals ( "chromosome properties fix went wrong!", 0, wrongGenes );
			
			// Indexes
			//
			var idxProps = List.of ( "Chromosome", "BEGIN", "END", "TAXID" );
			int nrows = idxProps.stream ()
			.map ( prop -> 
				session.run (
					"""
					  SHOW ALL INDEXES 
					  WHERE properties = [ $idxProp ] AND labelsOrTypes = [ "Gene" ]
					""", 
					parameters ( "idxProp", prop ) 
				)
				.list ()
				.size ()
			)
			.reduce ( (x, y) -> x + y )
			.orElse ( 0 );
			
			assertEquals  ( "Chromosome indexes not created!", idxProps.size (), nrows );
		}
	}
}
