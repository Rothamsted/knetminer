package rres.knetminer.datasource.ondexlocal.config;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Assert;
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
		assertEquals ( "dataDirPath is wrong!", "path/to/data-dir", cfg.getDataDirPath () );
		
		DatasetInfo dsi = cfg.getDatasetInfo ();
		assertEquals ( "Dataset title wrong!", "Aratiny dataset", dsi.getTitle () );
		
		List<SpecieInfo> species = dsi.getSpecies ();
		assertEquals ( "Species is wrong!", 1, species.size () );
		
		SpecieInfo ara = species.get ( 0 );
		assertEquals ( "Ara taxId is wrong!", "3702", ara.getTaxId () );
		assertEquals ( "Ara sci name is wrong!", "Arabidopsis Thaliana", ara.getScientificName () );
	}
	
	@Test
	public void testFetchedFiles ()
	{
		var cfg = KnetminerConfiguration.load ( "target/test-classes/config-test/dataset-cfg.yml" );
		DatasetInfo dsi = cfg.getDatasetInfo ();
		String qxml = dsi.getSampleQueriesXML ();

		assertTrue  ( "SampleQuery XML is wrong!", qxml.contains ( "<sampleQueries>" ) );
		assertTrue ( "Background is wrong!", dsi.getBackgroundImage ().length > 0 );
		assertEquals ( "Background's MIME is wrong!", "image/jpeg", dsi.getBackgroundImageMIME () );
	}
	
	@Test
	public void testDefaults ()
	{
		Assert.fail ( "TODO: implement me!" );
	}
}
