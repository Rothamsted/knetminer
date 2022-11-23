package uk.ac.rothamsted.knetminer.backend;

import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

import org.apache.commons.io.FileUtils;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;


/**
 * Junit test class for KnetMinerInitializerCLI
 * 
 * @author brandizi
 * @author jojicunnunni
 * <dl><dt>Date:</dt><dd>25 Feb 2022</dd></dl>
 *
 */
public class KnetMinerInitializerCLITest
{
	private static String datasetPath;

	private static String oxlPath;
	
	@BeforeClass
	public static void init() throws IOException
	{
		var mavenBuildPath = System.getProperty ( "maven.buildDirectory", "target" );
		mavenBuildPath = Path.of ( mavenBuildPath ).toAbsolutePath ().toString ();
		mavenBuildPath = mavenBuildPath.replace ( '\\', '/' );

		// Maven copies test files here.
		datasetPath = mavenBuildPath + "/test-classes/test-dataset";
		
		// The maven-dependency plug-in downloads this here and I don't know any way to change it
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


//	@Test
//	public void testAdvancedOpts () throws IOException
//	{
//		testCaseOut = testCasePath + "/output-cli-advanced";
//		FileUtils.deleteQuietly ( new File ( testCaseOut ) );
//
//		var exitCode = KnetMinerInitializerCLI.invoke (
//			"-i", testCasePath + "/test-case/poaceae-sample.oxl", 
//			"-d", testCaseOut, 
//			"-o", "StateMachineFilePath=file:///" + testCasePath + "/SemanticMotifs.txt",  
//			"--tax-id", "4565",
//			"--tax-id", "3702",
//			"-c" , testCasePath + "/config-test/dataset-cfg.yml"
//		);
//		
//		Assert.assertEquals ( "Wrong exit code!", 0, exitCode );
//				
//		assertTrue ( "Lucene output not found!", new File ( testCasePath + "/config-test" + "/index" ).exists () );
//		assertTrue ( "Traverser output not found!", new File ( testCasePath + "/config-test" + "/concepts2Genes.ser" ).exists () );
//			
//	}

}
