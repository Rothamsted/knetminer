package rres.knetminer.datasource.server.graphinfo;

import static org.junit.Assert.assertNotNull;
import static rres.knetminer.api.ApiIT.apiCli;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;

import rres.knetminer.api.ApiIT;

public class GraphInfoApiIT 
{		
	private Logger log = LogManager.getLogger ( this.getClass () );

	/**
	 * Keeps probing the API server until it seems initialised. A wrapper of {@link ApiIT#synchToServer()}. 
	 */
	@BeforeClass
	public static void synchToServer () throws Exception
	{
		ApiIT.synchToServer ();
	}
	
	
	/**
	 * Testing GraphInfo of an id.
	 */
	@Test
	public void testConceptInfo () throws JSONException, IOException, URISyntaxException {
		testConceptInfo ( 6652015 );
	}
	
	@Test
	public void testConceptInfoMultiId () throws JSONException, IOException, URISyntaxException {
		testConceptInfo ( 6641999, 6650736, 6647870 );
	}
	
	
	/**
	 * Invokes /concept-info with the given ids and verifies that the result present accessions.
	 * This is used by test methods below with various id.
	 */
	private void testConceptInfo ( int... ids  ) throws JSONException, IOException, URISyntaxException
	{
		String idStr = Arrays.stream ( ids )
		.mapToObj ( id -> Integer.toString ( id ) )
		.collect ( Collectors.joining ( "," ) );
		
		JSONArray js = apiCli.invokeApiArray ( "/graphinfo/concept-info?ids=" + idStr, null );
		
		log.info ( "JSON from GraphInfo API:\n{}", js.toString () );
		assertNotNull ( "No accessions in the result", ((JSONObject)js.get(0)).get("accessions") );
	}	
	
}
