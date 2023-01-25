package rres.knetminer.datasource.server.datasetinfo;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static rres.knetminer.api.ApiIT.CLI;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;

import org.junit.BeforeClass;
import org.junit.Test;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import rres.knetminer.api.ApiIT;
import rres.knetminer.datasource.api.config.DatasetInfo;
import rres.knetminer.datasource.api.config.KnetminerConfigTestUtils;
import rres.knetminer.datasource.api.config.SpecieInfo;

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
	 * Testing {@link DatasetInfo}.
	 * TODO: we need a test for {@link SpecieInfo} too.
	 */
	@Test
	public void testDatasetInfo ()
	{
		DatasetInfo dataset = CLI.datasetInfo ();
		assertNotNull ( "/data-set-info returns null!", dataset );
		assertTrue  (
			"no specie from /data-set-info!", 
			Optional.ofNullable ( dataset.getSpecies () )
			.map ( List::size )
			.orElse ( 0 ) > 0
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
		List<String> chrIds = CLI.chromosomeIds ( taxId );
		KnetminerConfigTestUtils.testChromosomeIds ( taxId, expectedLen, expectedChr, chrIds );
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
	 * TODO: to be removed.
	 */
	@Test @Ignore ( "/release-notes.html is to be removed" )
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
	
	
	@Test
	public void testCustomOptions ()
	{
		Map<String, Object> customOpts = CLI.customOptions ();
		assertNotNull ( "customOptions() is null!", customOpts );
		
		@SuppressWarnings ( "unchecked" )
		Map<String, Object> ui = (Map<String, Object>) customOpts.get ( "ui" );
		assertNotNull ( "customOptions.ui is null!", ui );
		
		assertEquals ( "Wrong value for betaFeedbackBannerEnabled", true, ui.get ( "betaFeedbackBannerEnabled" ) );
		
		@SuppressWarnings ( "unchecked" )
		Map<String, Object> customObj = (Map<String, Object>) customOpts.get ( "fooObject" );
		assertNotNull ( "fooObject is null!", customObj );
		assertEquals ( "Wrong value for fooObject.name", "Hello", customObj.get ( "name" ) );
		assertEquals ( "Wrong value for fooObject.surname", "World", customObj.get ( "surname" ) );
	}
	
	
	@Test
	public void testNetworkStats ()
	{
		Map<String, Object> netStats = CLI.networkStats ();
		assertNotNull ( "networkStats() is null!", netStats );
		
		DocumentContext jsCtx = JsonPath.parse ( netStats );
		Consumer<String> tester = path -> {
			Number value = jsCtx.read ( "$." + path  );
			assertNotNull ( "'" + path + " not found!", value );
			assertTrue ( 
				String.format ( "Invalid value for '%s' (%s)", path, value ), 
				value.doubleValue () > 0
			);
		};
		
		tester.accept ( "graphSummaries.totalGenes" );
		tester.accept ( "semanticMotifStats.maxConceptsPerGene" );
		tester.accept ( "semanticMotifStats.totalEvidenceConcepts" );
		for ( var statType: new String[] { "avgRelationsPerConcept", "conceptClassTotals", "conceptsPerGene" } )
			for ( var cc: new String[] { "Gene", "BioProc", "Publication" } )
				tester.accept ( "graphStats." + statType + '.' + cc );
	}
}
