package uk.ac.rothamsted.knetminer.backend;

import static org.junit.Assert.assertTrue;

import java.io.File;
import java.nio.file.Path;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;


/**
 * Tests {@link KnetMinerInitializerCLI}
 *  
 * @author brandizi
 * @author jojicunnunni
 * <dl><dt>Date:</dt><dd>25 Feb 2022</dd></dl>
 *
 */
public class KnetMinerInitializerCLITest
{
	public static String datasetPath;
	public static String oxlPath;


	@BeforeClass
	public static void init()
	{
		var mavenBuildPath = System.getProperty ( "maven.buildDirectory", "target" );
		mavenBuildPath = Path.of ( mavenBuildPath ).toAbsolutePath ().toString ();
		mavenBuildPath = mavenBuildPath.replace ( '\\', '/' );

		// Maven copies test files here.
		datasetPath = mavenBuildPath + "/test-classes/test-dataset";
		
		// This is both here and in target/test-classes/test-dataset/data/poaceae-sample.oxl
		// Using this path to test config overriding
		oxlPath = mavenBuildPath + "/dependency/poaceae-sample.oxl";
	}
		
	@Test
	public void testBasics ()
	{
		var exitCode = KnetMinerInitializerCLI.invoke (
			"-i", oxlPath, 
			"-c" , datasetPath + "/config/config.yml"
		);
		
		Assert.assertEquals ( "Wrong exit code!", 0, exitCode );
		
		assertTrue ( "Lucene output not found!", new File ( datasetPath + "/data/index" ).exists () );
		assertTrue ( "Traverser output not found!", new File ( datasetPath + "/data/concepts2Genes.ser" ).exists () );
	}

}
