package uk.ac.rothamsted.knetminer.service.test;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Assume;
import org.junit.BeforeClass;
import org.junit.rules.ExternalResource;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;

/**
 * An {@link ExternalResource} rule, which can be used to manage Neo4j-related tests.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>3 Oct 2023</dd></dl>
 *
 */
public class NeoDriverTestResource extends ExternalResource
{
	private Boolean isMavenNeo4jMode;
	
	private Driver driver;
	private int boltPort = -1;

	private Logger log = LogManager.getLogger ();
	
	/**
	 * If not {@link #isMavenNeo4jMode()}, stops everything. If we're in neo mode, 
	 * inits {@link #getDriver() the test Neo4j driver}, using the system property
	 * {@code neo4j.server.boltPort}, which is set in the corresponding 'neo4j' profile
	 * and defaults for host, user, password.
	 * 
	 */
	@Override
	protected synchronized void before ()
	{
		if ( !isMavenNeo4jMode () ) return;
		
		if ( driver != null ) return;
		
		log.info ( "Initialising Neo4j connection to test DB" );

		this.boltPort = Integer.valueOf ( System.getProperty ( "neo4j.server.boltPort" ) );

		driver = GraphDatabase.driver (
		  "bolt://localhost:" + boltPort, AuthTokens.basic ( "neo4j", "testTest" )
		);
	}

	/**
	 * Closes {@link #getDriver() the test driver}, so don't need to do it explicitly.
	 */
	@Override
	protected synchronized void after ()
	{
		if ( driver != null ) driver.close ();
	}

	/**
	 * If in {@link #isMavenNeo4jMode() Neo build mode}, 
	 * gets the driver that points to the test database. This is configured and started by the Maven
	 * configuration, using the Maven server plug-in.
	 */
	public Driver getDriver () {
		return driver;
	}
		
	/**
	 * Gets the BOLT port for the build test DB, running on localhost. Like {@link #getDriver()}, this
	 * is set by Maven and depends on {@link #isMavenNeo4jMode()}.
	 */
	public int getBoltPort () {
		return boltPort;
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
	
	/**
	 * Uses {@link Assume#assumeTrue(String, boolean)} to stop a test when !{@link #isMavenNeo4jMode()}.
	 * 
	 * You should invoke somewhere like a {@link BeforeClass} method.
	 */
	public void ensureNeo4jMode ()
	{
		final String msg = "Not in Neo4j mode, tests in this class will be skipped";
		
		// This is not always reported by test runners, so...
		if ( !isMavenNeo4jMode () ) log.info ( msg );

		Assume.assumeTrue ( msg, isMavenNeo4jMode() );		
	}
}
