package rres.knetminer.datasource.server.multispecie;

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
	 * Keeps probing the API server until it seems initialized. A wrapper of {@link ApiIT#synchToServer()}.
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

		assertTrue( "Accession AT1G21970 not found in the result",
				( findAccession(outAra,"AT1G21970") ) );

		assertTrue( "Accession AT1G66750 not found in the result",
				( findAccession(outAra,"AT1G66750") ) );

		assertFalse( "Accession ZM00001EB097190 is found in the result",
				( findAccession(outAra,"ZM00001EB097190") ) );

		assertTrue( "Specie-filtered search yielding more results than generic search",
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
				( findAccession(outWheatTaxId,"TRAESCS5B02G381900") ) );

		assertFalse( "Accession AT1G21970 is found in the result",
				( findAccession(outWheatTaxId,"AT1G21970") ) );

		assertTrue ( "Specie-filtered search yielding more results than generic search!",
			outAll.getGeneCount () > outWheatTaxId.getGeneCount () );
	}


	/**
	 * Testing region & taxId.
	 */
	@Test @Ignore ( "TOD: not working" )
	public void testRegionTaxId ()
	{
		// TODO: add a test without taxId, into ApiIT
		GenomeApiResult outWheatTaxId = CLI.genome ( null, null, List.of ( "5A:580000000:590000000" ), "4565" );
		GenomeApiResult outAll = CLI.genome ( null, null, List.of ( "5A:580000000:590000000" ), null );

		log.info ( "Filtered search has {} result, filtered search has {}", outWheatTaxId.getGeneCount (), outAll.getGeneCount () );
		

		assertTrue( "Accession TRAESCS5A02G383800 not found in the result",
			findAccession(outWheatTaxId,"TRAESCS5A02G383800") );

		assertFalse( "Accession AT1G21970 is found in the result about another specie",
			findAccession(outWheatTaxId,"AT1G21970") );

		assertTrue ( "Specie-filtered search yielding more results than generic search!",
			outAll.getGeneCount () > outWheatTaxId.getGeneCount () );
	}


	/**
	 * Testing Keyword, regions & taxId.
	 */
	@Test @Ignore ( "TOD: not working" )
	public void testKeywordRegionTaxId ()
	{
		GenomeApiResult outWithTaxId = CLI.genome ( "seed", null, List.of ( "5A:580000000:590000000" ), "4577" );
		GenomeApiResult outAll = CLI.genome ( "seed", null, List.of ( "5A:580000000:590000000" ), null );

		assertTrue( "Accession ZM00001EB039210 not found in the result",
				( findAccession(outWithTaxId,"ZM00001EB039210") ) );

		assertFalse( "Accession AT1G21970 is found in the result",
				( findAccession(outWithTaxId,"AT1G21970") ) );

		assertTrue ( "Generic search yielding more results than specie-filtered search",
				( outAll.getGeneCount () > outWithTaxId.getGeneCount () ) );
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

		assertTrue ( "Accession ZM00001EB307230 not found by the specie-filtered search", findAccession(outWithTaxId, "ZM00001EB307230") );
		assertFalse ( "Accession AT1G80840 found from the mais search", findAccession(outWithTaxId,"AT1G80840") );

		assertTrue ( "Filtered search showing more results than unfiltered!", 
			outAll.getGeneCount () > outWithTaxId.getGeneCount () );
	}


	public void testInvalidChrRegion ()
	{
		GenomeApiResult outWithArabidopsisTaxId = CLI.genome ( null, null, List.of ( "7A:50000000-60000000:test" ), "3702" );

		assertTrue( "Chromosome results from wrong CHR region!", outWithArabidopsisTaxId.getGeneCount () == 0 );
	}



	@Test @Ignore ( "TOD: not working" )
	public void testCountHits ()
	{
		CountHitsApiResult outAll = CLI.countHits ( "seed", null );
		CountHitsApiResult outWithTaxId = CLI.countHits ( "seed", "3702" );

		log.info ( "Filtered search has {} result, filtered search has {}", outWithTaxId.getGeneCount (), outAll.getGeneCount () );
		
		assertTrue ( "No result for taxId filter!", outWithTaxId.getGeneCount () > 0 );
		assertTrue ( "countHits yields more results when filtered!", outAll.getGeneCount () > outWithTaxId.getGeneCount () );
	}


	@Test @Ignore ( "TOD: not working" )
	public void testCountLociWithTaxId ()
	{
		int lociAll = CLI.countLoci ( "4", 9920000, 10180000, null );
		int lociAra = CLI.countLoci ( "7A", 9920000, 10180000, "3702" );

		assertTrue ( "taxId count is zero!", lociAra > 0 );
		assertTrue ( "Filtered count > unfiltered!", lociAll > lociAra );
	}

	@Test @Ignore ( "TOD: not working" )
	public void testCountLociWithInvalidChr ()
	{
		int lociAra = CLI.countLoci ( "7A", 0, 20080000, "3702" );

		assertTrue ( "Results from wrong region!", lociAra > 0);
	}

	/**
	 * Checking the given accession present in the gene table
	 * @param result
	 * @param gene
	 * @return
	 */
	boolean findAccession(GenomeApiResult result, String gene){
		return result.getGeneTable().stream().anyMatch ( a -> a[1].toString().equalsIgnoreCase(gene));
	}

}
