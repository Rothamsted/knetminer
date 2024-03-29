package rres.knetminer.datasource.api.config;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static rres.knetminer.datasource.api.config.KnetminerConfigTestUtils.testChromosomeIds;
import static rres.knetminer.datasource.api.config.KnetminerConfigTestUtils.testSpecieInfo;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.junit.Test;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>10 Jun 2022</dd></dl>
 *
 */
public class KnetminerConfigurationTest
{
	@Test
	public void testBasics ()
	{
		var cfg = KnetminerConfiguration.load ( "target/test-classes/config-test/dataset-cfg.yml" );
		assertEquals ( "dataDirPath is wrong!", "/path/to/data-dir", cfg.getDataDirPath () );
		
		ServerDatasetInfo dsi = cfg.getServerDatasetInfo ();
		assertEquals ( "Dataset title wrong!", "Aratiny dataset", dsi.getTitle () );
		
		List<SpecieInfo> species = new ArrayList<> ( dsi.getSpeciesMap ().values () );
		assertEquals ( "Species is wrong!", 2, species.size () );
	}
	
	@Test
	public void testFetchedFiles ()
	{
		var cfg = KnetminerConfiguration.load ( "target/test-classes/config-test/dataset-cfg.yml" );
		ServerDatasetInfo dsi = cfg.getServerDatasetInfo ();
		String qxml = dsi.getSampleQueriesXML ();

		assertTrue  ( "SampleQuery XML is wrong!", qxml.contains ( "<sampleQueries>" ) );
		assertTrue ( "Background is wrong!", dsi.getBackgroundImage ().length > 0 );
		assertEquals ( "Background's MIME is wrong!", "image/jpeg", dsi.getBackgroundImageMIME () );
	}
		
	@Test
	public void testDefaults ()
	{
		var cfgDir = Path.of ( "target/test-classes/config-test" )
				.toAbsolutePath ()
				.toString ();
		var cfgPath = cfgDir + "/defaults-test-cfg.yml";
		var cfg = KnetminerConfiguration.load ( cfgPath );
		
		assertEquals ( "configFielPath is wrong!", cfgPath, cfg.getConfigFilePath () );
		assertEquals ( "datasetDirPath is wrong!", cfgDir, cfg.getDatasetDirPath () );
		assertEquals ( "dataDirPath is wrong!", cfgDir + "/data", cfg.getDataDirPath () );
		assertEquals ( "oxlFilePath is wrong!",
			cfgDir + "/data/knowledge-network.oxl",
			cfg.getOxlFilePath ()
		);
		assertEquals ( 
			"title wasn't overridden!", "Aratiny dataset", cfg.getServerDatasetInfo ().getTitle ()
		);
	}
	
	@Test
	public void testSpecieData ()
	{
		var cfg = KnetminerConfiguration.load ( "target/test-classes/config-test/dataset-cfg.yml" );
		ServerDatasetInfo dsi = cfg.getServerDatasetInfo ();
		
		Set<String> taxIds = dsi.getTaxIds ();
		assertEquals ( "Wrong no. of taxIds!", 2, taxIds.size () );
		assertTrue ( "No Arabidopsis tax-ID!", taxIds.contains ( "3702" ) );
		assertTrue ( "No wheat tax-ID!", taxIds.contains ( "4565" ) );
		
		ServerSpecieInfo araInfo = dsi.getSpecie ( "3702" );
		testSpecieInfo ( araInfo, "3702", "Arabidopsis Thaliana", "Thale cress" );

		ServerSpecieInfo wheatInfo = dsi.getSpecie ( "4565" );
		testSpecieInfo ( wheatInfo, "4565", "Triticum aestivum", "Bread Wheat" );
	}

	@Test
	public void testChromosomeData ()
	{
		var cfg = KnetminerConfiguration.load ( "target/test-classes/config-test/dataset-cfg.yml" );
		ServerDatasetInfo dsi = cfg.getServerDatasetInfo ();
				
		ServerSpecieInfo araInfo = (ServerSpecieInfo) dsi.getSpecie ( "3702" );
		testChromosomeIds( "3702", 5, "4", araInfo.getChromosomeIds () );
	}
		
}
