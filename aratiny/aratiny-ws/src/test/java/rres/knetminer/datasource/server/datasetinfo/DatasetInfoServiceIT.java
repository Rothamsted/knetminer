package rres.knetminer.datasource.server.datasetinfo;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static rres.knetminer.api.ApiIT.CLI;

import org.apache.commons.lang3.ArrayUtils;
import org.junit.BeforeClass;
import org.junit.Ignore;
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
		String dataset = CLI.basemapXml ( taxId );
		assertTrue  ( "Proper basemap.xml not exists for taxId " + taxId , dataset.contains ( "chromosome index" ) );
		
	}
	
	/**
	 * Testing ChromosomeIds for different taxIds.
	 */
	@Test 
	public void testChromosomeIds ()
	{
		// TODO: find out the expectedLen and probeChr values in the mockup files
		testChromosomeIds( "4577", 10, "6" );
		testChromosomeIds( "4565", 22, "1D" );
		testChromosomeIds( "3702", 5, "4" );
	}
	
	/**
	 * Testing ChromosomeIds.
	 */
	private void testChromosomeIds ( String taxId, int expectedLen, String expectedChr )
	{
		String[] chrIds = CLI.chromosomeIds ( taxId );
		assertEquals ( 
			String.format ( "/chromosomeIds/%s, wrong result size!", taxId ), expectedLen, chrIds.length );
		assertTrue (
			String.format ( "/chromosomeIds/%s, %s not found in the result!", taxId, expectedChr ), 
			ArrayUtils.contains ( chrIds, expectedChr )
		);		
	}
	
	/**
	 * Testing sample-query.xml.
	 */
	@Test
	public void testSampleQueryXml ()
	{
		String queries = CLI.sampleQueryXml ();
		assertTrue  ( "SampleQuery XML is wrong", queries.contains ( "<sampleQueries>" ) );
	}
	
	/**
	 * Testing release-notes.html.
	 */
	@Test
	public void testReleaseNotes ()
	{
		String notes = CLI.releaseNotesHtml ();
		assertTrue  ( "ReleaseNotes html not exists", notes.contains ( "<strong>ENSEMBL PLANTS (Arabidopsis thaliana)</strong>") );
		
	}
	
	/**
	 * Testing BackgroundImage
	 */
	@Test
	public void testBackgroundImage ()
	{
		byte[] img = CLI.backgroundImage ();
		assertTrue  ( "Background image not exists", img.length > 0 );
		
	}
}
