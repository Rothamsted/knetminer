package rres.knetminer.datasource.server.multispecie;

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
		// TODO: Inspect the API manually (Use manual-test and PostMan, ask me a demo if needed)
		// to pick up a result and check it is returned here
		
		// TODO: verify (use the counts ) that the results without taxId filter are more than the ones with the taxId  
		
		// Note that the test without taxId isn't needed here, ApiIT takes care of that 
		
		// TODO: DELETE these instruction comments after use!
		
		// Use this, see ApiIT
		GenomeApiResult outAra = CLI.genome ( "seed", null, null, "3702" );
		GenomeApiResult outAll = CLI.genome ( "seed", null, null, null );
	}
	
	
	/**
	 * Testing Genes and taxId.
	 */
	@Test
	public void testKeywordGenesTaxId () 
	{
		// TODO: search the gene list with taxId = 4565 (wheat)
		
		// Manually inspect the API and verify some result here 
		
		// Check that there isn't anything about AT*** genes (cause they aren't about wheat)
				
		
		// Use this
		GenomeApiResult out = CLI.genome (
			"seed", 
			List.of ( "AT1G21970" , "AT1G80840" , "AT4G14110" , "TRAESCS5B02G381900", "ZM00001EB307230" ), 
			null, // genome regions
			"4565" 
		);
	}
	
	
	/**
	 * Testing region & taxId.
	 */
	@Test
	public void testRegionTaxId () 
	{
		// TODO: inspect the API manually to see what this region returns and bring some result here
		// as test case.

		// TODO: verify that the test without taxId yields more results (count them) than with taxId
				
		// As above, the simple test without taxId should be put into ApiIT, not a priority for now
		

		// Use this
		GenomeApiResult out = CLI.genome ( "seed", null, List.of ( "5A:580000000:590000000" ), "4565" );
	}
	
			
	/**
	 * Testing Keyword, regions & taxId.
	 */
	@Test
	public void testKeywordRegionTaxId () 
	{
		// TODO: Test some kind of picked result is returned 
		// test the case with taxId has fewer results than the case without taxId restriction  
		// testGenome( "keyword->seed", "qtl->qtl1=5A:580000000:590000000", "taxId->4577" );
	}
	
	
	/**
	 * Testing Keyword, genes, regions & taxId.
	 */
	@Test
	public void testKeywordGenesRegionTaxId () 
	{
		// TODO: as above, verify that only relevant genes are returned, inspect the API manually to see if there are 
		// genes in the specified regions, only them should come up. 
		
		// TODO: compare (counts) the same search with and without taxId
		
//		testGenome( "keyword->seed", "list->AT1G21970,AT1G80840,AT4G14110,TRAESCS5B02G381900,ZM00001EB307230",
//				"qtl->qtl1=5A:580000000:590000000", "taxId->4577" );
	}
	
	
	public void testInvalidChrRegion ()
	{
		// TODO: search a keyword with region = "5A:0:10000000:10000000:test", taxId = 4565 (wheat)
		// and verify there are > 0 results
		// then re-issue the same search with taxId = 3702 (arabidopsis), and verify there are 0 results (because Ara. has not 5A chromosome)
		// 
	}

	
	
	@Test
	public void testCountHitsWithTaxId () 
	{
		// TODO: verify the null taxId search has more hits than the other case 
		
		// Use this
		CountHitsApiResult outAll = CLI.countHits ( "seed", null );
		CountHitsApiResult outAra = CLI.countHits ( "seed", "3702" );
	}
	
	@Test
	public void testCountHitsWithInvalidChr () {
		// TODO: As for testInvalidChr(), test that it returns 0 or > 0 when there is no taxId vs
		// when an input chromosome doesn't belogn to the specified taxId.		
	}
	
	
	@Test
	public void testCountLociWithTaxId ()
	{
		// TODO: as above,
		// verify a given count with taxId is > 0
		
		// verify that the null taxId yields more results than the count with the taxId 

		
		// Use this:
		int lociAll = CLI.countLoci ( "4", 9920000, 10180000, null );
		int lociAra = CLI.countLoci ( "4", 9920000, 10180000, "3702" );
	}
	
	@Test
	public void testCountLociWithInvalidChr ()
	{
		// TODO: As for testInvalidChr(), test that it returns 0 or > 0 when there is no taxId vs
		// when an input chromosome doesn't belogn to the specified taxId.
	}
	
}
