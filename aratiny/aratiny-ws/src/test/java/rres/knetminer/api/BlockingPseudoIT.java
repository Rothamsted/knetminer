package rres.knetminer.api;

import java.io.IOException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Assume;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 * It's a pseudo-test that works with the 'console' profile. It just stops the Maven build at the integration-test phase,
 * so that the test Jetty server is kept on for manual inspection.
 *  
 * See the POM for details.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>10 Nov 2023</dd></dl>
 *
 */
public class BlockingPseudoIT
{
	private Logger log = LogManager.getLogger ( this.getClass () );
	
	/**
	 * A wrapper of {@link ApiIT#synchToServer()} to synch the server init.
	 */
	@BeforeClass
	public static void synchToServer () throws Exception
	{
		ApiIT.synchToServer ();
	}
	
	/**
	 * It's a pseudo-test that works with the 'run' profile. It just stops the Maven build at the integration-test phase,
	 * so that the test Jetty server is kept on for manual inspection.
	 *  
	 * See the POM for details.
	 */
	@Test
	public void blockingPseudoTest () throws IOException
	{
		Assume.assumeTrue ( "console".equals ( ApiIT.getMavenProfileId () ) ); 
				
		log.info ( "\n\n\n\t======= SERVER RUNNING MODE, Press [Enter] key to shutdown =======\n\n" );
		log.info ( "The API should be available at " + ApiIT.CLI.getBaseUrl () );
		log.info ( "NOTE: DON'T use Ctrl-C to stop the hereby process, I need to run proper shutdown" );
		System.in.read ();
	}

}
