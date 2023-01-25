package uk.ac.rothamsted.knetminer.backend;

import java.util.concurrent.Callable;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

import net.sourceforge.ondex.parser.oxl.Parser;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.ExitCode;
import picocli.CommandLine.Option;
import uk.ac.rothamsted.knetminer.service.KnetMinerInitializer;

/**
 * A command-line (CLI) interface, which is another wrapper to the core. This allows for producing KnetMiner
 * data from the path of an OXL. The CLI interface is based on the pico-cli library. 
 *
 * @author brandizi
 * @author jojicunnunni
 * <dl><dt>Date:</dt><dd>25 Feb 2022</dd></dl>
 *
 */
@Command ( 
	name = "knet-init", 
	description = "\n\n  *** KnetMiner Data Initialiser ***\n" +
		"\nCreates/updates KnetMiner data (Lucene, traverser) for an OXL.\n",
	
	exitCodeOnVersionHelp = ExitCode.USAGE, // else, it's 0 and you can't know about this event
	exitCodeOnUsageHelp = ExitCode.USAGE, // ditto
	mixinStandardHelpOptions = true,
	usageHelpAutoWidth = true,
	usageHelpWidth = 120
)
public class KnetMinerInitializerCLI implements Callable<Integer>
{
	@Option (
		names = { "-i", "--input", "--in" },
		paramLabel = "<path/to/oxl>",		
		description = "The path of the OXL to start from",
		required = true
	)
	private String oxlInputPath = null;
	

	@Option (
		names = { "-d", "--data" },
		paramLabel = "<path/to/dir>",		
		description = "The data output path. Default is taken from configYmlPath."
	)
	private String dataPath;
		
	@Option (
		names = { "-c", "--config"},
		paramLabel = "<path/to/YML>",
		description = "The KnetMiner YML configuration file where to get options like traverser semantic motifs file.",
		required = true
	)
	private String configYmlPath;
	
	@Option (
		names = { "-f", "--force"},		
		description = "If true, reinitialises everything, independently on "
			+ "whether data files exist and are more recent than the OXL file."
	)
	private boolean doForce = false;
	
	
	private Logger log = LogManager.getLogger ( this.getClass () ); 
	
	
	@Override
	public Integer call ()
	{
		KnetMinerInitializer initializer = new KnetMinerInitializer ();
		log.info ( "Loading Knetminer configuration from: \"{}\"", this.configYmlPath );
		initializer.setKnetminerConfiguration ( configYmlPath );

		if ( this.dataPath != null )
		{
			log.info ( "Setting data dir to: \"{}\"", dataPath );
			initializer.setDatDirPath ( dataPath );
		}
		
		log.info ( "Loading the OXL from: \"{}\"", this.oxlInputPath );
		initializer.setOxlFilePath ( oxlInputPath );
		var graph = Parser.loadOXL ( oxlInputPath );
		initializer.setGraph ( graph );

		log.info ( "Doing the data initialisation" );
		initializer.initKnetMinerData ( this.doForce );
		
		return 0;
	}

	/**
	 * Does all the job of {@link #main(String...)}, except exiting, useful for 
	 * testing.
	 * 
	 * This uses {@link CommandLine}, as prescribed by the picocli library.
	 */
	public static int invoke ( String... args )
	{
    int exitCode = new CommandLine ( new KnetMinerInitializerCLI () ).execute ( args );
    return exitCode; 
	}
	
	/**
	 * The usual wrapper for the external invocation. This just invokes {@link #invoke(String...)}
	 * and exits with its result.
	 * 
	 */
	public static void main ( String... args )
	{
		System.exit ( invoke ( args ) );
	}	
	
}
