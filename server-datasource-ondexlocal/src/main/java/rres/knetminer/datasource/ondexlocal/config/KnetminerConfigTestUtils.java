package rres.knetminer.datasource.ondexlocal.config;

import static java.lang.String.format;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;

/**
 * TODO: comment me!
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
	
	
	public static void testChromosomeIds ( String taxId, int expectedLen, String expectedChr, List<String> probeChrIds )
	{
		assertEquals ( 
			format ( "/chromosomeIds/%s, wrong result size!", taxId ), expectedLen, probeChrIds.size ()
		);
		assertTrue (
			format ( "/chromosomeIds/%s, %s not found in the result!", taxId, expectedChr ), 
			probeChrIds.contains ( expectedChr )
		);		
	}
}
