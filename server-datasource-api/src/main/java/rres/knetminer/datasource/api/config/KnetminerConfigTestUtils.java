package rres.knetminer.datasource.api.config;

import static java.lang.String.format;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;

/**
 * Some utilities for testing configuration components. These are are in the main part of the modules, to make it 
 * available to other modules using this for their tests (ie, *IT tests against the API calls) 
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>11 Jul 2022</dd></dl>
 *
 */
public class KnetminerConfigTestUtils
{
	public static void testSpecieInfo ( SpecieInfo specieInfo, String expectedTaxId, String expectedSciName, String expectedCommonName )
	{
		var prefix = "SpecieInfo for " + expectedTaxId + ", ";
		assertEquals ( prefix + "bad taxId!", expectedTaxId, specieInfo.getTaxId () );
		assertEquals ( prefix + "bad latin name!", expectedSciName, specieInfo.getScientificName () );
		assertEquals ( prefix + "bad common name!", expectedCommonName, specieInfo.getCommonName () );
	}
	
	/**
	 * Tests that probedChrIds has the right length and contains the given chromosome ID.
	 */
	public static void testChromosomeIds ( String taxId, int expectedLen, String expectedChr, List<String> probedChrIds )
	{
		assertEquals ( 
			format ( "/chromosomeIds/%s, wrong result size!", taxId ), expectedLen, probedChrIds.size ()
		);
		assertTrue (
			format ( "/chromosomeIds/%s, %s not found in the result!", taxId, expectedChr ), 
			probedChrIds.contains ( expectedChr )
		);		
	}
}
