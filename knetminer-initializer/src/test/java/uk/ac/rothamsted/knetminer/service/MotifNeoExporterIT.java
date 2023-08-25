package uk.ac.rothamsted.knetminer.service;

import static java.lang.String.format;

import java.io.IOException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Assume;
import org.junit.BeforeClass;
import org.junit.Test;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;

/**
 * Tests for MotifNeoExporter. 
 *
 * <b>WARNING</b>: These tests are actually run only when you run 
 * mvn -Pneo4j ... which setup a test Neo4j with the aratiny dummy
 * dataset.
 * 
 * <dl><dt>Date:</dt><dd>25 Aug 2023</dd></dl>
 *
 */
public class MotifNeoExporterIT
{
	private static KnetMinerInitializer knetInitializer;
	private static Driver neoDriver;
	
	private Logger log = LogManager.getLogger ();
	private static Logger slog = LogManager.getLogger ();

	/**
	 * Initialises the test instance.
	 * 
	 * As explained in {@link KnetMinerInitializerTest}, this reloads the data initialised
	 * in that test and makes them available via {@link #knetInitializer}. 
	 *  
	 */
	@BeforeClass
	public static void init ()
	{
		// This is not always reported by test runners, so...
		if ( !isMavenNeo4jMode () )
		{
			slog.info ( 
				"Not in Neo4j mode, tests in {} will be ignored", 
				MotifNeoExporterIT.class.getSimpleName ()
			);
		}

		Assume.assumeTrue ( 
			format ( 
				"Not in Neo4j mode, tests in %s will be ignored", 
			  MotifNeoExporterIT.class.getSimpleName () ),
			isMavenNeo4jMode() 
		);
		
		
		slog.info ( "Getting k-initialiser with existing semantic motif data" );
		
		// As said above, with false, it just reloads the already generated data 
		knetInitializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false );
		
		
		slog.info ( "Initialising Neo4j connection to test DB" );
		
		var boltPort = System.getProperty ( "neo4j.server.boltPort" );
		neoDriver = GraphDatabase.driver (
			"bolt://localhost:" + boltPort, AuthTokens.basic ( "neo4j", "testTest" )
		);
		
		
		slog.info ( "Saving semantic motifs endpoints into Neo4j" );
		
		var smData = knetInitializer.getGenes2PathLengths ();
		
		var motifNeoExporter = new MotifNeoExporter ();
		motifNeoExporter.setDatabase ( neoDriver );
		motifNeoExporter.saveMotifs ( smData );
	}
	
	public static void closeDriver ()
	{
		slog.info ( "Closing the Neo4j connection" );
		if ( neoDriver != null && neoDriver.session ().isOpen () )
			neoDriver.close ();
	}
	

	@Test
	public void testSavedSize ()
	{
		/* TODO: Use the neoDriver for something like:
		 * 
		 * MATCH (g:Gene) - [r:hasMotifLink] -> (c:Concept)
		 * RETURN COUNT(r) AS smRelsCount
		 *  
		 * and verify that smRelsCount matches knetInitializer.getGenes2PathLengths().size()
	  */
	}

	@Test
	public void testRelationsExist ()
	{
		/* TODO: Use the neoDriver to run something like this:
		 * 
		 * run cypher: 
		 *   MATCH (g:Gene) - [r:hasMotifLink] -> (c:Concept)
		 *   RETURN g.ondexId AS geneId, r.graphDistance AS distance, c.ondexId AS conceptId, 
		 *     rand() AS rnd
		 *   ORDER BY rnd
		 *   LIMIT 100
		 *   
		 * This fetches 100 SM relations randomly.
		 * Loop over the cypher results and, for each, verify that:
		 *   
		 * smData = knetInitializer.getGenes2PathLengths ()
		 * 
		 * for each result from cypher:   
		 *   key = Pair.of ( geneId, conceptId )
		 *   smData.get ( key ) == distance 
		 * 
	  */
	}
	
	
	/**
	 * Tells if we're running Maven with the neo4j profile. This is used to establish if the tests
	 * in this class have to be run or not.
	 * 
	 * TODO: copy-pasted from ApiIT, to be factorised into a utility class.
	 * 
	 */
	private static boolean isMavenNeo4jMode ()
	{
		String profileIdProp = "maven.profileId";
		// This is set by the profile in the POM
		String result = System.getProperty ( profileIdProp, null );
		
		if ( result == null )
			slog.warn ( "Property {} is null, Neo4j-related tests will be skipped", result );
		return "neo4j".equals ( result );
	}	

}
