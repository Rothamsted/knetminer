package uk.ac.rothamsted.knetminer.backend;

import java.nio.file.Path;
import java.util.concurrent.Callable;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.parser.oxl.Parser;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.ExitCode;
import picocli.CommandLine.Option;
import uk.ac.rothamsted.knetminer.service.KnetMinerInitializer;
import uk.ac.rothamsted.knetminer.service.NeoConceptIndexer;
import uk.ac.rothamsted.knetminer.service.NeoGenePubIdIndexer;
import uk.ac.rothamsted.knetminer.service.NeoInitializer;
import uk.ac.rothamsted.knetminer.service.NeoMotifImporter;

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
		description = "The path of the OXL to start from (default: taken from config when necessary)"
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
		description = "The KnetMiner YML configuration file where to get options like traverser semantic motifs file."
	)
	private String configYmlPath;

	@Option (
		names = { "-f", "--force"},
		description = "Reinitialises everything, independently on "
			+ "whether data files exist and are more recent than the OXL file."
	)
	private boolean doForce = false;

	/**
	 * TODO: alternatively, pick the driver from the config.
	 */
	@Option (
		names = { "-sm", "--neo-motifs"},
		description = "Imports sematic motif endopoints into Neo4j (requires --neo-xxx options)."
	)
	private boolean doNeoMotifs = false;

	@Option (
		names = { "-nl", "--neo-url"},
		paramLabel = "<bolt:// URL>|config://",
		description = "Neo4j BOLT URL for related commands. config:// to get Neo coordinates from --config (--neo-user and --neo-password are ignored)."
	)
	private String neoUrl = "config://";

	@Option (
		names = { "-nu", "--neo-user"},
		paramLabel = "<user>",
		description = "Neo4j user for related commands."
	)
	private String neoUser;

	@Option (
		names = { "-np", "--neo-password"},
		paramLabel = "<neoPassword>",
		description = "Neo4j neoPassword for related commands."
	)
	private String neoPassword;

	@Option (
		names = { "-cy", "--cy-script"},
		paramLabel = "<path>|config://",
		description =
			"Runs Cypher init commands from a file, (if config://, takes the path from --config, customOptions/"
			+ NeoInitializer.CY_INIT_SCRIPT_PROP + ")."
	)
	private String neoInitCypherPath = null;

	@Option (
		names = { "-dx", "--neo-index"},
		paramLabel = "<path>|config://",
		description =
		"Create Neo4j indexes to support applications (see the documentation for details). " +
		"If the path is config://, takes the path from --config, customOptions/"
		+ NeoConceptIndexer.INDEX_KEYS_PROP + ")."
	)
	private String neoIndexPropertiesPath = null;


	private Logger log = LogManager.getLogger ( this.getClass () );


	@Override
	public Integer call ()
	{
		KnetMinerInitializer initializer = null;

		if ( configYmlPath != null )
		{
			initializer = new KnetMinerInitializer ();
			log.info ( "Loading Knetminer configuration from: \"{}\"", this.configYmlPath );
			initializer.setKnetminerConfiguration ( configYmlPath );

			if ( this.dataPath != null )
			{
				log.info ( "Setting data dir to: \"{}\"", dataPath );
				initializer.setDatDirPath ( dataPath );
			}

			String oxlPath = this.oxlInputPath;
			if ( oxlPath == null ) oxlPath = initializer.getOxlFilePath ();

			log.info ( "Loading the OXL from: \"{}\"", oxlPath );
			initializer.setOxlFilePath ( oxlPath );
			var graph = Parser.loadOXL ( oxlPath );
			initializer.setGraph ( graph );

			log.info ( "Doing the data initialisation" );
			initializer.initKnetMinerData ( this.doForce );
		}

		if ( doNeoMotifs )
		{
			log.info ( "Populating Neo4j with semantic motif summaries" );

			if ( initializer == null ) throw new IllegalArgumentException (
				"--neo-motifs can't be used without --config"
			);

			var motifNeoExporter = new NeoMotifImporter ();
			motifNeoExporter.setDatabase ( neoUrl, neoUser, neoPassword, initializer );
			motifNeoExporter.saveMotifs ( initializer );
		}

		if ( neoInitCypherPath != null )
		{
			log.info ( "Running Neo4j initialisation script" );

			var cyInit = new NeoInitializer ();
			cyInit.setDatabase ( neoUrl, neoUser, neoPassword, initializer );

			if ( !"config://".equals ( neoInitCypherPath ) )
				cyInit.runCypher ( Path.of ( neoInitCypherPath ) );
			else
				cyInit.runCypher ( initializer );
		}

		if ( neoIndexPropertiesPath != null )
		{
			log.info ( "Creating Neo4j full text indexes" );

			var conceptIndexer = new NeoConceptIndexer ();
			conceptIndexer.setDatabase ( neoUrl, neoUser, neoPassword, initializer );

			if ( !"config://".equals ( neoIndexPropertiesPath ) )
				conceptIndexer.createConceptsIndex ( Path.of ( neoIndexPropertiesPath ) );
			else
				conceptIndexer.createConceptsIndex ( initializer );
			
			var geneIdIndexer = new NeoGenePubIdIndexer ();
			geneIdIndexer.setDatabase ( neoUrl, neoUser, neoPassword, initializer );
			geneIdIndexer.createIndex ();
		}

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
