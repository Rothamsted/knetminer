package uk.ac.rothamsted.knetminer.service;

import static java.lang.String.format;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.stream.Stream;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.Test;

import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.parser.oxl.Parser;

/**
 * The usual Junit tests for {@link KnetMinerInitializer}.
 *
 * TODO: review and consider the recent migrations from the web app.
 *
 * @author brandizi
 * @author jojicunnunni
 *
 * <dl><dt>Date:</dt><dd>13 Feb 2022</dd></dl>
 *
 */
public class KnetMinerInitializerTest
{

	private static KnetMinerInitializer initializer;

	private static String datasetPath;

	private Logger log = LogManager.getLogger ( this.getClass () );


	@BeforeClass
	public static void initKnetMinerInitializer() throws IOException
	{
		initializer = createKnetMinerInitializer ( true );
	}

	/**
	 * This serves both this class, via {@link #initKnetMinerInitializer()} and
	 * {@link MotifNeoExporterIT}.
	 *
	 * Here, it is invoked with doReset = true, so that new support data are created from scratch
	 * and tested.
	 *
	 * In {@link MotifNeoExporterIT}, it is invoked with doReset = false, so that the initialisation
	 * isn't repeated.
	 * 
	 * isNeo4jMode is sued by Neo4j initialisation-related tests, to tell this method it should 
	 * load the Neo4j mode test configuration.
	 *
	 * Both the OXL and the support data are either to be created or loaded in both cases, since
	 * the integration tests (*IT.java) have to happen after regular tests and are run by a
	 * different JVM process.
	 */
	static KnetMinerInitializer createKnetMinerInitializer ( boolean doReset, boolean isNeo4jMode )
	{
		var mavenBuildPath = System.getProperty ( "maven.buildDirectory", "target" );
		mavenBuildPath = Path.of ( mavenBuildPath ).toAbsolutePath ().toString ();
		mavenBuildPath = mavenBuildPath.replace ( '\\', '/' );

		// Maven copies test files here.
		datasetPath = mavenBuildPath + "/test-classes/test-dataset";

		// The maven-dependency plug-in downloads this here and I don't know any way to change it
		var oxlPath = mavenBuildPath + "/dependency/poaceae-sample.oxl";

		ONDEXGraph graph = Parser.loadOXL ( oxlPath );

		var configFName = isNeo4jMode ?  "test-config-neo4j" : "config";
		configFName += ".yml";
		
		var initializer = new KnetMinerInitializer ();
		initializer.setGraph ( graph );
		initializer.setKnetminerConfiguration ( datasetPath + "/config/" + configFName );

		initializer.initKnetMinerData ( doReset );
		//System.out.println("The Genes2PathLengths map: " + initializer.getGenes2PathLengths().toString());
		return initializer;
	}

	/**
	 * Defaults to no Neo4j mode.
	 */
	static KnetMinerInitializer createKnetMinerInitializer ( boolean doReset )
	{
		return createKnetMinerInitializer ( doReset, false );
	}


	@Test
	public void testGetConfig ()
	{
		var config = initializer.getKnetminerConfiguration ();

		assertNotNull ( "No configuration fetched!", config );

		assertEquals ( "Dataset path is wrong!", datasetPath, config.getDatasetDirPath () );

		assertEquals (
			"Wrong value for StateMachineFilePath property!",
			new File( "file:///" + datasetPath + "/config/SemanticMotifs.txt").getPath(),
			new File ( config.getGraphTraverserOptions ().getString ( "StateMachineFilePath" )).getPath()
		);

		assertTrue(
			"Wrong value for StateMachineFilePath config property!",
			config.getServerDatasetInfo().containsTaxId ( "4565" )
		);
	}

	@Test
	public void testInitLuceneData ()
	{
		// check Lucene index files exist
		File luceneDir = new File ( datasetPath + "/data/index" );
		assertTrue ( "Lucene dir not created!", luceneDir.exists () );
		assertTrue ( "Lucene dir not a dir!", luceneDir.isDirectory () );

		File[] idxFiles = luceneDir.listFiles ();
		assertTrue ( "No file found in the Lucene dir!", idxFiles != null && idxFiles.length > 0 );
	}

	@Test
	public void testInitSemanticMotifData ()
	{				
		BiConsumer<String, Map<?, ?>> verifier = (name, map) -> 
		{
			assertNotNull ( String.format ( "%s is null!", name ), map );
			assertFalse ( format ( "%s is empty!", name ), map.isEmpty () );
			log.info ( "{} has {} mappings", name, map.size() );
		};

		verifier.accept ( "concepts2Genes", initializer.getConcepts2Genes () );
		verifier.accept ( "genes2Concepts", initializer.getGenes2Concepts () );
		verifier.accept ( "genes2PathLengths", initializer.getGenes2PathLengths () );


		Stream.of ( "concepts2Genes", "genes2Concepts", "genes2PathLengths"  )
			.map ( name -> datasetPath + "/data/" + name + ".ser" )
			.forEach ( path ->
				assertTrue (
					format ( "Traverser File '%s' not created!", path ),
					new File ( path ).exists ()
				)
			);
	}

	/**
	 * TODO: to be implemented, we don't need it in the short time (very likely, the OXL building pipeline will need
	 * to rebuild everything at each invocation).
	 */
	public void testLuceneFilesReuse ()
	{
		// 1) read the modification date/time for the Lucene index directory
		// 2) reissue initLuceneData() (in the test it would be a second execution after the one in initKnetMinerInitializer())
		// 3) read the directory's date/time again and check it didn't change.
		// This verifies that files are not re-created when they already exist.
	}

	/**
	 * TODO: like {@link #testInitLuceneData()}, not immediately needed.
	 */
	public void testTraverserFilesReuse ()
	{
		// Same as testLuceneFilesReuse
	}

}
