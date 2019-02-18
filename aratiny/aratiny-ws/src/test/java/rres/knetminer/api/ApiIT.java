package rres.knetminer.api;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static uk.ac.ebi.utils.exceptions.ExceptionUtils.buildEx;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.stream.Stream;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpException;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedEventException;
import uk.ac.ebi.utils.xml.XPathReader;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;


/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>11 Feb 2019</dd></dl>
 *
 */
public class ApiIT
{
	private static Logger clog = LogManager.getLogger ( ApiIT.class );
	
	public static JSONObject invokeApi ( String callName, Object... jsonFields )
	{
		String url = System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/" + callName;
		try
		{
			JSONObject js = new JSONObject ();
			for ( int i = 0; i < jsonFields.length; i++ )
				js.put ( (String) jsonFields [ i ], jsonFields [ ++i ] );
			
			HttpPost post = new HttpPost ( url );
			StringEntity jsEntity = new StringEntity( js.toString (), ContentType.APPLICATION_JSON );
			post.setEntity ( jsEntity );

			HttpClient client = HttpClientBuilder.create ().build ();

			HttpResponse response = client.execute ( post );
			int httpCode = response.getStatusLine ().getStatusCode ();
			if ( httpCode != 200 ) ExceptionUtils.throwEx ( 
				HttpException.class, "Http response code %s is not 200", Integer.valueOf ( httpCode ) 
			);
			String jsStr = IOUtils.toString ( response.getEntity ().getContent (), "UTF-8" );
			clog.info ( "JSON got from <{}>:\n{}", url, jsStr );
			
			return new JSONObject ( jsStr );
		}
		catch ( JSONException | IOException | HttpException ex )
		{
			throw buildEx (
				UnexpectedEventException.class,
				"Error while invoking <%s>: %s",
				url,
				ex.getMessage ()
			);
		}
	}
	
	
	@Test
	public void testCountHits () throws JSONException, IOException, URISyntaxException
	{
		JSONObject js = new JSONObject ( IOUtils.toString ( 
			new URI ( System.getProperty ( "knetminer.api.baseUrl" ) + "/aratiny/countHits?keyword=seed" ),
			"UTF-8"
		));
		
		Stream.of ( "luceneCount", "luceneLinkedCount", "geneCount" )
		.forEach ( key -> 
		  assertTrue ( "countHits returned a wrong result (" + key + ")!", js.getInt ( key ) > 0 )
		);
	}
	
	@Test
	public void testGenome ()
	{
		JSONObject js = invokeApi ( "genome", "keyword", "growth", "qtl", new String[0] );
		
		assertTrue ( "geneCount from /genome is wrong!", js.getInt ( "geneCount" ) > 0 );
		
		String xmlView = js.getString ( "gviewer" );
		assertNotNull ( "gviewer from /genome is null!", xmlView );
		
		XPathReader xpath = new XPathReader ( xmlView );
		
		assertNotNull (
			"Gene ABI3 not returned by /genome", 
			xpath.readString ( "/genome/feature[./label = 'ABI3']" )
		);
	}
}
