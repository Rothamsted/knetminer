package rres.knetminer.datasource.server.datasetinfo;

import static org.junit.Assert.assertTrue;
import static rres.knetminer.api.ApiIT.CLI;

import org.junit.BeforeClass;
import org.junit.Test;

import rres.knetminer.api.ApiIT;

public class DatasetInfoServiceIT
{
	/**
	 * A wrapper of {@link ApiIT#synchToServer()} to synch the server init.
	 */
	@BeforeClass
	public static void synchToServer () throws Exception
	{
		ApiIT.synchToServer ();
	}


	/**
	 * Testing DatasetInfo.
	 */
	@Test
	public void testDatasetInfo ()
	{
		DatasetInfo dataset = CLI.datasetInfo ();
		assertTrue  ( "Dataset species size is zero", dataset.getSpecies().size() > 0 );
	}

	/**
	 * Testing basemapXml for different taxIds.
	 */
	@Test
	public void testBasemapXml ()
	{
		testBasemapXml("4577");
		testBasemapXml("4565");
		testBasemapXml("3702");
	}
	
	/**
	 * Testing basemapXml.
	 */
	public void testBasemapXml (String taxId)
	{
		String dataset = CLI.datasetInfoStr ( "basemap.xml?taxId=" + taxId );
		assertTrue  ( "Proper basemap.xml not exists for taxId " + taxId , dataset.contains ( "chromosome index" ) );
		
	}
	
	/**
	 * Testing ChromosomeIds for different taxIds.
	 */
	@Test
	public void testChromosomeIds ()
	{
		testChromosomeIds( "4577" );
		testChromosomeIds( "4565" );
		testChromosomeIds( "3702" );
	}
	
	/**
	 * Testing ChromosomeIds.
	 */
	public void testChromosomeIds ( String taxId )
	{
		String[] dataset = CLI.datasetInfo ( "chromosome-ids?taxId=" + taxId );
		assertTrue  ( "Chromosome ids not exists", dataset.length > 0 );
		
	}
	
	/**
	 * Testing sample-query.xml.
	 */
	@Test
	public void testSampleQueryXml ()
	{
		String dataset = CLI.datasetInfoStr ( "sample-query.xml" );
		assertTrue  ( "SampleQuery Xml not exists", dataset.contains ( "<sampleQueries>" ) );
		
	}
	
	/**
	 * Testing release-notes.html.
	 */
	@Test
	public void testReleaseNotes ()
	{
		String dataset = CLI.datasetInfoStr( "release-notes.html" );
		assertTrue  ( "ReleaseNotes html not exists", dataset.contains ( "<strong>ENSEMBL PLANTS (Arabidopsis thaliana)</strong>") );
		
	}
	
	/**
	 * Testing BackgroundImage
	 */
	@Test
	public void testBackgroundImage ()
	{
		String dataset = CLI.datasetInfoStr( "background-image" );
		assertTrue  ( "Background image not exists", dataset.getBytes ().length > 0 );
		
	}
}
