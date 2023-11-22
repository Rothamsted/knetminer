package uk.ac.rothamsted.knetminer.service;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.nio.file.Path;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UncheckedFileNotFoundException;
import uk.ac.ebi.utils.runcontrol.ProgressLogger;

/**
 * Allows for sending Cypher commands to a Neo4j database, used as a DB initialisation option.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>2 Oct 2023</dd></dl>
 *
 */
public class CypherInitializer extends NeoInitComponent
{
	public static final String CY_INIT_SCRIPT_PROP = "cypherInitScript";
	
	private Logger log = LogManager.getLogger();
	

	public void runCypher ( String... cypherCommands )
	{
		if ( cypherCommands == null || cypherCommands.length == 0 ) {
			log.warn ( "Cypher initialiser called with empty command list, doing nothing" );
			return;
		}
		
		log.info ( "Cypher initialiser, running {} commands", cypherCommands.length );
		
		ProgressLogger progressLogger = new ProgressLogger ( "Cypher initialiser, {} commands processed", 10 );
		
		try ( var session = driver.session () )
		{
			for ( var cypher: cypherCommands )
			{
				try {
					session.run ( cypher );
					progressLogger.updateWithIncrement ();
				}
				catch ( RuntimeException ex ) {
					ExceptionUtils.throwEx ( RuntimeException.class, ex, 
						"Error while running Cypher query: $cause, query is:\n%s\n", cypher 
					);
				}
			}
		}
		log.info ( "Cypher initialiser, finished" );
	}
	
	public void runCypher ( Reader reader )
	{
		try
		{
			var cypher = IOUtils.toString ( reader );
			var cyphers = cypher.split ( ";" );
			
			cyphers = Stream.of ( cyphers )
			.filter ( cy -> cy != null )
			.filter ( cy -> !StringUtils.isWhitespace ( cy ) )
			.collect ( Collectors.toList () )
			.toArray ( new String[ 0 ] );
			
			runCypher ( cyphers );
		}
		catch ( IOException ex )
		{
			throw ExceptionUtils.buildEx ( 
				UncheckedIOException.class, ex, "Error while reading Cypher query: $cause" 
			);
		}
	}

	public void runCypher ( Path path )
	{
		try
		{
			log.info ( "Running Cypher commands from: {}", path.toAbsolutePath () );
			Reader reader = new FileReader ( path.toFile () );
			runCypher ( reader );
		}
		catch ( FileNotFoundException ex )
		{
			throw ExceptionUtils.buildEx ( 
				UncheckedFileNotFoundException.class, ex, 
				"Cypher command file \"%s\" not found: $cause",
				path.toAbsolutePath ()
			);
		}
	}

	public void runCypher ( KnetMinerInitializer kinitializer )
	{
		String cyInitScriptPath = kinitializer.getKnetminerConfiguration ()
		.getCustomOptions ()
		.getString ( CY_INIT_SCRIPT_PROP );
		
		if ( cyInitScriptPath == null ) return;
		
		this.runCypher ( Path.of ( cyInitScriptPath ) );
	}
}
