package uk.ac.rothamsted.knetminer.service;

import static java.lang.String.format;

import java.io.IOException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.checkerframework.common.reflection.qual.GetClass;
import org.junit.Assume;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>25 Aug 2023</dd></dl>
 *
 */
public class MotifNeoExporterIT
{
	private static KnetMinerInitializer initializer;

	private Logger log = LogManager.getLogger ();
	private static Logger slog = LogManager.getLogger ();


	@BeforeClass
	public static void initKnetMinerInitializer() throws IOException
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
		
		// This is already initialised during regular tests, so 'false' avoids to redo it
		// from scratch.
		initializer = KnetMinerInitializerTest.createKnetMinerInitializer ( false );
	}

	@Test
	public void testBasics()
	{
		log.info ( "===== HELLO FROM {} =====", getClass () );
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
