package com.knetminer.datasource;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.function.Consumer;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.harness.Neo4j;
import org.neo4j.harness.Neo4jBuilder;
import org.neo4j.harness.Neo4jBuilders;

import com.knetminer.datasource.configs.Neo4jTestHarnessConfig;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;

/**
 * Utility to initialise an harness Neo DB that is shared between all the tests.
 * 
 * This populates the DB from a batch Cypher file and it's currently not used, 
 * since we use {@link Neo4jTestHarnessConfig} instead.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>10 Aug 2023</dd></dl>
 *
 */
public class TestDbHelper
{
  private static Driver driver;
	
  private static final Logger log = LogManager.getLogger ();
	
	static
	{
		// Silly way to synch, but it's just for the test framework
		
		synchronized ( TestDbHelper.class )
		{
      Neo4jBuilder neoBuilder = Neo4jBuilders.newInProcessBuilder()
        .withDisabledServer();
			
			long nqueries = processCypherBatch ( "target/test-classes/test-db.cypher", neoBuilder );


			// This is an alternative way, which contains one commit only, but it doesn't work
			// (Cannot perform schema updates in a transaction that has performed data updates).
			//
			neoBuilder.withFixture ( db -> { 
				processCypherBatch ( "target/test-classes/test-db.cypher", db );
				return null;
			});
			
			// TODO: this is where the upload actually happens and it looks too slow, like 1.5min
			// to load ~2k nodes.
			// We need to investigate it more if other faster ways exist to do this. 
			// - Maybe AbstractInProcessNeo4jBuilder.copyFrom( path ) ?
			// - Maybe using .withConfig("dbms.directories.data", ...) ?
			//   See https://github.com/neo4j/neo4j/issues/9622#issuecomment-388208963
			//
			log.info ( "Creating test DB, starting at: {}", Instant.now() );
			Neo4j embeddedDatabaseServer = neoBuilder.build();
			log.info ( "Database creation finished at {}, populated with {} statements", Instant.now (), nqueries );
			//log.info ( "Database creation finished at {}", Instant.now () );

			driver = GraphDatabase.driver ( embeddedDatabaseServer.boltURI() );
		}
	}
	
	public static synchronized Driver getDriver ()
	{
		return driver;
	}



	/**
	 * An helper to process Cypher statements in a batch file.
	 * 
	 * This assumes there is one statement per line coming from the reader, it reads each statement and
	 * passes it to the processor parameter.
	 * 
	 * TODO: in future, a better version needs to split statements based on ';', not lines
	 * 
	 * TODO: in future, it needs to become a general utility, in a project like 
	 * https://github.com/Rothamsted/rdf2pg/tree/master/neo4j-utils
	 */
	public static long processCypherBatch ( BufferedReader reader, Consumer<String> cypherProcessor )
	{
		// TODO: remove after reading. Try to use lambda, streams, modern Java, often they're better than
		// constructs like loops.
		//
		long readQueries = 
			// TODO: as said above, at some point, we'd like to split by ';', not by \n  
			reader.lines ()
			.peek ( line ->  log.trace ( "Loading statement: \"{}\"", line ) )
			.peek ( cypherProcessor )
			.count ();
		
		return readQueries;
	}
	
	/**
	 * Populates a Neo4j harness DB builder using {@link Neo4jBuilder#withFixture(String)}.
	 * 
	 * TODO: needs to become a general helper, as said in {@link #processCypherBatch(BufferedReader, Consumer)}. 
	 */
	public static long processCypherBatch ( BufferedReader reader, Neo4jBuilder neoBuilder )
	{
		return processCypherBatch ( reader, neoBuilder::withFixture );
	}
	
	
	public static long processCypherBatch ( String path, Neo4jBuilder neoBuilder )
	{
		return processCypherBatch ( path, neoBuilder::withFixture );
	}
	
	public static long processCypherBatch ( String path, Consumer<String> cypherProcessor )
	{
		try ( BufferedReader reader = new BufferedReader ( new FileReader ( path, StandardCharsets.UTF_8 ) ) )
		{
			return processCypherBatch ( reader, cypherProcessor );
		}
    catch ( IOException ex )
    {
      /*
       * ====> TODO: NEVER EVER DO THIS!!!
       * 
       * (at least, not in production code)
       * 
       * Refs:
       *   https://marcobrandizi.info/a-few-notes-on-my-code-style/ (see 'Exceptions')
       *   https://www.quora.com/As-a-software-engineer-developer-or-programmer-what-code-made-you-think-you-cant-be-serious/answer/Marco-Brandizi
       *     (see the comment thread started by Mirko Leonardo) 
       */ 
      // e.printStackTrace();
    	
      // This is one of the ways to manage this case: via wrapping a checked ex into an unchecked
      // one. This can be done with this utility of mine
    	throw ExceptionUtils.buildEx ( 
    		UncheckedIOException.class, "Error while populating the test DB: $cause" 
    	);
    }		
	}
	
	
	/**
	 * An experiment that has only one commit
	 */
	public static long processCypherBatch ( BufferedReader reader, GraphDatabaseService dbService )
	{
	  try ( var tx = dbService.beginTx () )
	  {
			long readQueries = 
				// TODO: as said above, at some point, we'd like to split by ';', not by \n  
				reader.lines ()
				.peek ( line ->  log.trace ( "Loading statement: \"{}\"", line ) )
				.peek ( tx::execute )
				.count ();

			tx.commit ();
			
			return readQueries;
	  }
	}

	public static long processCypherBatch ( String path, GraphDatabaseService dbService  )
	{
		try ( BufferedReader reader = new BufferedReader ( new FileReader ( path, StandardCharsets.UTF_8 ) ) )
		{
			return processCypherBatch ( reader, dbService );
		}
    catch ( IOException ex )
    {
    	throw ExceptionUtils.buildEx ( 
    		UncheckedIOException.class, "Error while populating the test DB: $cause" 
    	);
    }		
	}	
}
