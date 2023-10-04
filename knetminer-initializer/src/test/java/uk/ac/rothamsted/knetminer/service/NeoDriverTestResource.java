package uk.ac.rothamsted.knetminer.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.rules.ExternalResource;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>3 Oct 2023</dd></dl>
 *
 */
public class NeoDriverTestResource extends ExternalResource
{
	private Boolean isMavenNeo4jMode;
	
	private Driver driver;

	private Logger log = LogManager.getLogger ();
	

	@Override
	protected synchronized void before ()
	{
		if ( !isMavenNeo4jMode () ) return;
		
		if ( driver != null ) return;
		
		log.info ( "Initialising Neo4j connection to test DB" );

		var boltPort = System.getProperty ( "neo4j.server.boltPort" );

		driver = GraphDatabase.driver (
		  "bolt://localhost:" + boltPort, AuthTokens.basic ( "neo4j", "testTest" )
		);
	}

	@Override
	protected synchronized void after ()
	{
		if ( driver != null ) driver.close ();
	}

	public Driver getDriver () {
		return driver;
	}
		
	/**
	 * Tells if we're running Maven with the neo4j profile. This is used to establish if the 
	 * Neo4j-related tests have to be run or not. Here, it's also used to decide if to try to get
	 * driver coordinates from the test configuration or not. In other words, if this methods returns
	 * false, then {@link #getDriver()} will return null.
	 * 
	 */
	public boolean isMavenNeo4jMode ()
	{
		if ( isMavenNeo4jMode != null ) return isMavenNeo4jMode;
		
		String profileIdProp = "maven.profileId";

		// This is set by the profile in the POM
		String mavenProfileId = System.getProperty ( profileIdProp, null );

		if ( mavenProfileId == null )
			log.warn ( "Property {} is null, Neo4j-related tests will be skipped", profileIdProp );
		
		return isMavenNeo4jMode = "neo4j".equals ( mavenProfileId );
	}
	
}
