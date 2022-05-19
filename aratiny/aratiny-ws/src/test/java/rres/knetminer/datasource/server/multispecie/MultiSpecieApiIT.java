package rres.knetminer.datasource.server.multispecie;

import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.io.Serializable;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;

import rres.knetminer.api.ApiIT;

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
	 * Testing GenomeKeyword.
	 */
	@Test
	public void testKeyword () throws JSONException, IOException, URISyntaxException {
		testGenome ( "keyword->seed" );
	}
	
	/**
	 * Testing GenomeKeyword taxId.
	 */
	@Test
	public void testKeywordTaxId () throws JSONException, IOException, URISyntaxException {
		testGenome ( "keyword->seed","taxId->3702" );
	}
	
	/**
	 * Testing Genes only.
	 */
	@Test
	public void testGenes () throws JSONException, IOException, URISyntaxException {
		testGenome ( "list->AT1G21970,AT1G80840,AT4G14110,TRAESCS5B02G381900,ZM00001EB307230" );
	}
	
	/**
	 * Testing Genes and taxId.
	 */
	@Test
	public void testGenesTaxId () throws JSONException, IOException, URISyntaxException {
		testGenome( "list->AT1G21970,AT1G80840,AT4G14110,TRAESCS5B02G381900,ZM00001EB307230", "taxId->4577" );
	}
	
	/**
	 * Testing Keyword, genes & regions.
	 */
	@Test
	public void testRegion () throws JSONException, IOException, URISyntaxException {
		testGenome( "qtl->qtl1=5A:580000000:590000000" );
	}
	
	/**
	 * Testing Keyword, genes & regions.
	 */
	@Test
	public void testRegionTaxId () throws JSONException, IOException, URISyntaxException {
		testGenome( "qtl->qtl1=5A:580000000:590000000", "taxId->4565" );
	}
	
	/**
	 * Testing Keyword & regions.
	 */
	@Test
	public void testKeywordRegion () throws JSONException, IOException, URISyntaxException {
		testGenome( "keyword->seed","qtl->qtl1=5A:580000000:590000000" );
	}
	
	/**
	 * Testing Keyword, regions & taxId.
	 */
	@Test
	public void testKeywordRegionTaxId () throws JSONException, IOException, URISyntaxException {
		testGenome( "keyword->seed", "list->AT1G21970,AT1G80840,AT4G14110,TRAESCS5B02G381900,ZM00001EB307230",
				"qtl->qtl1=5A:580000000:590000000", "taxId->4577" );
	}
	
	/**
	 * Testing Keyword, genes & taxId.
	 */
	@Test
	public void testKeywordGenesTaxId () throws JSONException, IOException, URISyntaxException {
		testGenome( "keyword->seed", "list->AT1G21970,AT1G80840,AT4G14110,TRAESCS5B02G381900,ZM00001EB307230",
				"taxId->4577" );
	}
	
	/**
	 * Testing Keyword, genes & regions.
	 */
	@Test
	public void testKeywordGenesRegion () throws JSONException, IOException, URISyntaxException {
		testGenome( "keyword->seed", "list->AT1G21970,AT1G80840,AT4G14110,TRAESCS5B02G381900,ZM00001EB307230",
				"qtl->qtl1=5A:580000000:590000000" );
	}
	
	/**
	 * Testing Keyword, genes, regions & taxId.
	 */
	@Test
	public void testKeywordGenesRegionTaxId () throws JSONException, IOException, URISyntaxException {
		testGenome( "keyword->seed", "list->AT1G21970,AT1G80840,AT4G14110,TRAESCS5B02G381900,ZM00001EB307230",
				"qtl->qtl1=5A:580000000:590000000", "taxId->4577" );
	}
	
	/**
	 * Invokes /genome with the given params and verifies the result.
	 * 
	 */
	private void testGenome ( String... params  ) throws JSONException, IOException, URISyntaxException
	{
		Pattern arrayPattern  = Pattern.compile ( ",|:" );
		List<Serializable> objects = Arrays.stream ( params ).map ( a -> a.split ( "->" ) )
				.flatMap ( list -> Stream.of ( list[0], arrayPattern.matcher(list[1]).find() ? list[1].split ( "," ) : list[1] ) )
				.collect ( Collectors.toList () );
		
		JSONObject js = ApiIT.invokeApi ( "genome" , objects.toArray () );
		
		log.info ( "JSON from GraphInfo API:\n{}", js.toString () );
		assertTrue ( "geneCount from /genome + " + params[0] + " is wrong!", js.getInt ( "geneCount" ) > 0 );
		assertTrue ( "evidenceTable from /genome is not exists !", js.getString ( "evidenceTable" ).length () > 0  );
		assertTrue ( "geneTable from /genome is not exists !", js.getString ( "geneTable" ).length () > 0  );
		assertTrue ( "gviewer from /genome is not exists !", js.getString ( "gviewer" ).length () > 0  );
		assertTrue ( "totalDocSize from /genome + " + params[0] + " is wrong!", js.getInt ( "totalDocSize" ) > 0 );
	}	 
}
