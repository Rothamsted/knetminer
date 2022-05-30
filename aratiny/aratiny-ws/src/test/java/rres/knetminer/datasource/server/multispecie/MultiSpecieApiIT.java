package rres.knetminer.datasource.server.multispecie;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static rres.knetminer.api.ApiIT.CLI;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.BeforeClass;
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
		
		assertTrue( "Genome Api Result showing a higher Gene Count in keyword search with taxid",
				( outAll.getGeneCount () > outAra.getGeneCount () ) );
	}
	
	
	/**
	 * Testing Genes and taxId.
	 */
	@Test
	public void testKeywordGenesTaxId () 
	{
		GenomeApiResult outWithOutTaxId = CLI.genome (
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
		
		assertTrue ( "Genome Api Result showing a higher Gene Count in keyword,gene search with taxid",
				( outWithOutTaxId.getGeneCount () > outWheatTaxId.getGeneCount () ) );
	}
	
	
	/**
	 * Testing region & taxId.
	 */
	@Test
	public void testRegionTaxId () 
	{
		// As above, the simple test without taxId should be put into ApiIT, not a priority for now
		GenomeApiResult outWheatTaxId = CLI.genome ( null, null, List.of ( "5A:580000000:590000000" ), "4565" );
		GenomeApiResult outWithTaxId = CLI.genome ( null, null, List.of ( "5A:580000000:590000000" ), null );
		
		assertTrue( "Accession TRAESCS5A02G383800 not found in the result",
				( findAccession(outWheatTaxId,"TRAESCS5A02G383800") ) );
		
		assertFalse( "Accession AT1G21970 is found in the result",
				( findAccession(outWheatTaxId,"AT1G21970") ) );
		
		assertTrue ( "Genome Api Result showing a higher Gene Count in region search with taxid",
				(  outWithTaxId.getGeneCount () >= outWheatTaxId.getGeneCount () ) );
	}
	
			
	/**
	 * Testing Keyword, regions & taxId.
	 */
	@Test
	public void testKeywordRegionTaxId () 
	{
		GenomeApiResult outWithTaxId = CLI.genome ( "seed", null, List.of ( "5A:580000000:590000000" ), "4577" );
		GenomeApiResult outWithOutTaxId = CLI.genome ( "seed", null, List.of ( "5A:580000000:590000000" ), null );
		
		assertTrue( "Accession ZM00001EB039210 not found in the result",
				( findAccession(outWithTaxId,"ZM00001EB039210") ) );
		
		assertFalse( "Accession AT1G21970 is found in the result",
				( findAccession(outWithTaxId,"AT1G21970") ) );
		
		assertTrue ( "Genome Api Result showing a higher Gene Count in keyword, region search with taxid",
				( outWithTaxId.getGeneCount () > outWithOutTaxId.getGeneCount () ) );
	}
	
	
	/**
	 * Testing Keyword, genes, regions & taxId.
	 */
	@Test
	public void testKeywordGenesRegionTaxId () 
	{
		GenomeApiResult outWithTaxId = CLI.genome ( "seed",
				List.of( "AT1G21970,AT1G80840,AT4G14110,TRAESCS5B02G381900,ZM00001EB307230" ),
				List.of( "5A:580000000:590000000" ), "4577" );
		
		GenomeApiResult outWithOutTaxId = CLI.genome ( "seed",
				List.of( "AT1G21970,AT1G80840,AT4G14110,TRAESCS5B02G381900,ZM00001EB307230" ),
				List.of( "5A:580000000:590000000"), null );
		
		assertTrue( "Accession ZM00001EB307230 not found in the result",
				( findAccession(outWithTaxId,"ZM00001EB307230") ) );
		
		assertFalse( "Accession AT1G80840 is found in the result",
				( findAccession(outWithTaxId,"AT1G80840") ) );
		
		assertTrue ( "Genome Api Result showing a higher Gene Count in keyword, genes, region search with taxid",
				( outWithTaxId.getGeneCount () > outWithOutTaxId.getGeneCount () ) );
	}
	
	
	public void testInvalidChrRegion ()
	{
		GenomeApiResult outWithWheatTaxId = CLI.genome ( null, null, List.of ( "5A:0:10000000:10000000:test" ), "4565" );

		GenomeApiResult outWithArabidopsisTaxId = CLI.genome ( null, null, List.of ( "5A:0:10000000:10000000:test" ), "3702" );
		
		assertTrue( "Accession ZM00001EB307230 not found in the result",
				( findAccession(outWithWheatTaxId,"ZM00001EB307230") ) );
		
		assertTrue( "Accession AT4G14110 not found in the result",
				( findAccession(outWithArabidopsisTaxId,"AT4G14110") ) );

		assertTrue( "Genome Api gene count is zero",
				  outWithWheatTaxId.getGeneCount () > 0 );
		
		assertTrue( "Genome Api gene count is greater than 0",
				outWithArabidopsisTaxId.getGeneCount () == 0 );
	}

	
	
	@Test
	public void testCountHitsWithTaxId () 
	{
		CountHitsApiResult outWithOutTaxId = CLI.countHits ( "seed", null );
		CountHitsApiResult outWithTaxId = CLI.countHits ( "seed", "3702" );
		
		assertTrue ( "CountHits Api Result showing a higher Gene Count in keyword with taxid",
				( outWithOutTaxId.getGeneCount () >= outWithTaxId.getGeneCount () ) );
	}
	
	@Test
	public void testCountHitsWithInvalidChr () {
		
		CountHitsApiResult outWithOutTaxId = CLI.countHits ( "seed", null );
		CountHitsApiResult outWithTaxId = CLI.countHits ( null, "4577" );
		
		assertTrue ( "CountHits Api Result showing a higher Gene Count in keyword as null",
				( outWithOutTaxId.getGeneCount () > outWithTaxId.getGeneCount () ) );
	}
	
	
	@Test
	public void testCountLociWithTaxId ()
	{
		int lociAll = CLI.countLoci ( "4", 9920000, 10180000, null );
		int lociAra = CLI.countLoci ( null, 9920000, 10180000, "3702" );
		
		assertTrue ( "CountLoci Api Result showing a higher Count in keyword, region search with taxid",
				( lociAll > lociAra ) );
	}
	
	@Test
	public void testCountLociWithInvalidChr ()
	{
		int lociAll = CLI.countLoci ( "4", 9920000, 10180000, null );
		int lociAra = CLI.countLoci ( null, 9920000, 10180000, "3702" );
		
		assertTrue ( "CountLoci Api Result showing a higher Count in keyword search as null",
				( lociAll > lociAra ) );
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
