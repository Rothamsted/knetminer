package uk.ac.rothamsted.knetminer.service;

import static org.neo4j.driver.Values.parameters;
import static uk.ac.rothamsted.knetminer.service.NeoGenePubIdIndexer.CY_ACC_INDEX_NAME;
import static uk.ac.rothamsted.knetminer.service.NeoGenePubIdIndexer.CY_NAME_INDEX_NAME;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;
import org.neo4j.driver.Session;

import uk.ac.rothamsted.knetminer.service.test.NeoDriverTestResource;

/**
 * @author Marco Brandizi
 * <dl><dt>Date:</dt><dd>30 Jan 2024</dd></dl>
 *
 */
public class NeoGenePubIdIndexerIT
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
		var indexer = new NeoGenePubIdIndexer ();
		indexer.setDatabase ( neoDriver );
		
		indexer.createIndex ();
		
		try ( Session session = neoDriver.session () )
		{
			int nrows = session.run (
				"SHOW ALL INDEXES WHERE name IN $names", 
				parameters ( "names", List.of ( CY_ACC_INDEX_NAME, CY_NAME_INDEX_NAME ) ) 
			)
			.list ()
			.size ();
			
			Assert.assertEquals ( "Name/accession index creation failed!", 2, nrows );
		}		
	}

}
