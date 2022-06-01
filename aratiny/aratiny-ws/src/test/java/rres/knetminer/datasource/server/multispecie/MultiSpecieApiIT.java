package rres.knetminer.datasource.server.multispecie;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static rres.knetminer.api.ApiIT.CLI;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;

import rres.knetminer.api.ApiIT;
import rres.knetminer.api.client.CountHitsApiResult;
import rres.knetminer.api.client.GenomeApiResult;

public class MultiSpecieApiIT
{
	private Logger log = LogManager.getLogger ( this.getClass () );
	
	/**
	 * A wrapper of {@link ApiIT#synchToServer()} to synch the server init.
	 */
	@BeforeClass
	public static void synchToServer () throws Exception
	{
		ApiIT.synchToServer ();
	}


	/**
	 * Testing GenomeKeyword taxId.
	 */
	@Test
	public void testKeywordTaxId ()
	{
		GenomeApiResult outAra = CLI.genome ( "seed", null, null, "3702" );
		GenomeApiResult outAll = CLI.genome ( "seed", null, null, null );
		
		assertTrue ( "Ara probe gene not found in the filtered search (case 1)!",
			findAccession(outAra,"AT1G21970") );

		assertTrue ( "Ara probe gene not found in the filtered search (case 2)",
			findAccession(outAra,"AT1G66750") );

		// Must be there to be significant
		//
		var maizeProbe = "ZM00001EB097190";
		assertTrue  ( "Maize probe gene not found in the unfiltered search", findAccession ( outAll, maizeProbe) );
		assertFalse ( "Maize probe gene found in the filtered search", findAccession ( outAra, maizeProbe ) );

		assertTrue ( "Specie-filtered search yielding more results than generic search",
			outAll.getGeneCount () > outAra.getGeneCount () );
	}


	/**
	 * Testing Genes and taxId.
	 */
	@Test
	public void testKeywordGenesTaxId ()
	{
		GenomeApiResult outAll = CLI.genome (
			"seed",
			List.of ( "AT1G21970" , "AT1G80840" , "AT4G14110" , "TRAESCS5B02G381900", "ZM00001EB307230" ),
			null, // genome regions
			null
		);
		GenomeApiResult outWheatTaxId = CLI.genome (
			"seed",
			List.of ( "AT1G21970" , "AT1G80840" , "AT4G14110" , "TRAESCS5B02G381900", "ZM00001EB307230" ),
			null, // genome regions
			"4565"
		);

		assertTrue( "Accession TRAESCS5B02G381900 not found in the result",
			findAccession( outWheatTaxId, "TRAESCS5B02G381900" ) );

		assertFalse( "Ara probe gene found in the wheat-filtered search",
			findAccession ( outWheatTaxId, "AT1G21970" ) );

		assertTrue ( "Specie-filtered search yielding more results than generic search!",
			outAll.getGeneCount () > outWheatTaxId.getGeneCount () );
	}


	/**
	 * Testing region & taxId.
	 */
	@Test
	public void testRegionTaxId ()
	{
		// TODO: add a test without taxId, into ApiIT
		GenomeApiResult outMaize = CLI.genome ( null, null, List.of ( "2:1000000:900000000" ), "4577" );
		GenomeApiResult outAll = CLI.genome ( null, null, List.of ( "2:1000000:900000000" ), null );

		log.info ( "Filtered search has {} result, unfiltered search has {}", outMaize.getGeneCount (), outAll.getGeneCount () );
		
		// All specie-specifc genes must appear in the unfiltered searches
		//
		assertTrue (
			"Arabidopsis probe gene not found in the unfiltered search!", 
			findAccession ( outAll, "AT2G22440" ) 
		);
		assertTrue (
			"Maize probe gene not found in the unfiltered search!", 
			findAccession ( outAll, "ZM00001EB079100" ) 
		);
		
		// Specie-specific genes must be in their own specie-specific search and not elsewhere
		//
		assertTrue (
			"Maize probe gene not found in the filtered search!", 
			findAccession ( outMaize, "ZM00001EB079100" ) 
		);
		assertFalse (
			"Arabidopsis probe gene found in the maize-filtered search!", 
			findAccession ( outMaize, "AT2G22440" ) 
		);

		assertTrue ( "Specie-filtered search yielding more results than generic search!",
			outAll.getGeneCount () > outMaize.getGeneCount () );
	}


	/**
	 * Testing Keyword, regions & taxId.
	 */
	@Test @Ignore ( "TODO: not working" )
	public void testKeywordRegionTaxId ()
	{
		GenomeApiResult outMaize = CLI.genome ( "seed", null, List.of ( "2:1000000:900000000" ), "4577" );
		GenomeApiResult outAll = CLI.genome ( "seed", null, List.of ( "2:1000000:900000000" ), null );

		// As above
		
		// All specie-specifc genes must appear in the unfiltered searches
		//
		assertTrue (
			"Arabidopsis probe gene not found in the unfiltered search!", 
			findAccession ( outAll, "AT2G28056" ) 
		);
		assertTrue (
			"Maize probe gene not found in the unfiltered search!", 
			findAccession ( outAll, "ZM00001EB074940" ) 
		);
		
		// Specie-specific genes must be in their own specie-specific search and not elsewhere
		//
		assertTrue (
			"Maize probe gene not found in the filtered search!", 
			findAccession ( outMaize, "ZM00001EB074940" ) 
		);
		assertFalse (
			"Arabidopsis probe gene found in the maize-filtered search!", 
			findAccession ( outMaize, "AT2G28056" ) 
		);

		assertTrue ( "Specie-filtered search yielding more results than generic search!",
			outAll.getGeneCount () > outMaize.getGeneCount () );
		
	}


	/**
	 * Testing Keyword, genes, regions & taxId.
	 */
	@Test
	public void testKeywordGenesRegionTaxId ()
	{
		GenomeApiResult outWithTaxId = CLI.genome ( "seed",
				List.of( "AT1G21970", "AT1G80840", "AT4G14110", "TRAESCS5B02G381900" ,"ZM00001EB307230" ),
				List.of( "5A:580000000:590000000" ), "4577" );

		GenomeApiResult outAll = CLI.genome ( "seed",
				List.of( "AT1G21970", "AT1G80840", "AT4G14110", "TRAESCS5B02G381900" ,"ZM00001EB307230" ),
				List.of( "5A:580000000:590000000"), null );

		assertTrue ( "Maize probe gene not found by the specie-filtered search!", findAccession ( outWithTaxId, "ZM00001EB307230" ) );
		assertFalse ( "Arabidopsis probe gene found from the maize search!", findAccession ( outWithTaxId, "AT1G80840" ) );

		assertTrue (
			"Filtered search showing more results than unfiltered!",
			outAll.getGeneCount () > outWithTaxId.getGeneCount ()
		);
	}


	public void testInvalidChrRegion ()
	{
		GenomeApiResult outWithArabidopsisTaxId = CLI.genome ( null, null, List.of ( "7A:50000000-60000000:test" ), "3702" );
		assertTrue( "Chromosome results from wrong CHR region!", outWithArabidopsisTaxId.getGeneCount () == 0 );
	}

	@Test
	public void testCountHits ()
	{
		CountHitsApiResult outAll = CLI.countHits ( "seed", null );
		CountHitsApiResult outWithTaxId = CLI.countHits ( "seed", "3702" );

		log.info ( "Filtered search has {} result, unfiltered search has {}", outWithTaxId.getGeneCount (), outAll.getGeneCount () );
		
		assertTrue ( "No result for taxId filter!", outWithTaxId.getGeneCount () > 0 );
		assertTrue ( "countHits yields more results when filtered!", outAll.getGeneCount () > outWithTaxId.getGeneCount () );
	}

	
	@Test
	public void testCountHitsInvalidTaxId ()
	{
		CountHitsApiResult outFoo = CLI.countHits ( "seed", "foo" );
		assertEquals ( "Results returned with invalid taxId!", 0, outFoo.getGeneCount () );
	}
	

	@Test
	public void testCountLociWithTaxId ()
	{
		int lociWheat = CLI.countLoci ( "1A", 1000, 590000000, "4565" );
		assertTrue ( "taxId count is zero!", lociWheat > 0 );
	}

	@Test
	public void testCountLociInvalidSpecie ()
	{
		int lociAll = CLI.countLoci ( "1A", 1000, 590000000, null );
		int lociAra = CLI.countLoci ( "1A", 1000, 590000000, "3702" );

		assertTrue ( "Unfiltered result is 0!", lociAll > 0 );
		
		// Must be zero, because arabidopsis doesn't have the 1A chromosome
		// If the taxId weren't considered, it would yield >0 results, so this makes the test significant
		assertEquals ( "filtered count is > 0!", 0, lociAra );
	}
	
	/**
	 * This is very similar to {@link #testCountLociInvalidSpecie()}, but adding it just in case.
	 */
	@Test
	public void testCountLociWithInvalidChr ()
	{
		int lociAll = CLI.countLoci ( "7A", 0, 20080000, null );
		int lociFoo = CLI.countLoci ( "7A", 0, 20080000, "foo" );

		assertTrue ( "Unfiltered result is 0!", lociAll > 0 );
		assertEquals ( "Filtered result isn't 0!", 0, lociFoo );
	}

	/**
	 * Checking the given accession present in the gene table
	 * @param result
	 * @param gene
	 * @return
	 */
	boolean findAccession(GenomeApiResult result, String gene) {
		return result.getGeneTable().stream().anyMatch ( a -> a[1].toString().equalsIgnoreCase ( gene ) );
	}

}
