package rres.knetminer.datasource.server.datasetinfo;

import static java.lang.String.format;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static rres.knetminer.api.ApiIT.CLI;

import java.util.List;
import java.util.Optional;

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
		assertNotNull ( "/data-set-info returns null!", dataset );
		assertTrue  (
			"no specie from /data-set-info!", 
			Optional.ofNullable ( dataset.getSpecies() )
			.map ( List::size )
			.orElse ( null ) > 0
		);
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
			format ( "/chromosomeIds/%s, wrong result size!", taxId ), expectedLen, chrIds.length
		);
		assertTrue (
			format ( "/chromosomeIds/%s, %s not found in the result!", taxId, expectedChr ), 
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
		assertTrue  ( "Wrong result from /release-notes.html", notes.contains ( "<strong>ENSEMBL PLANTS (Arabidopsis thaliana)</strong>") );
		
	}
	
	/**
	 * Testing BackgroundImage
	 */
	@Test
	public void testBackgroundImage ()
	{
		byte[] img = CLI.backgroundImage ();
		assertTrue  ( "Empty result from /background-image!", img.length > 0 );
		
	}
}
