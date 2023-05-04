package rres.knetminer.server.test;

import java.nio.charset.Charset;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Ignore;
import org.junit.Test;

/**
 * Some manual experiment with the new GA4.
 * 
 * TODO: remove. We have implemented a proper way to manage this.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>17 Apr 2023</dd></dl>
 *
 */
public class GoogleAnalytics4Test
{
	private final Logger log = LogManager.getLogger ( getClass() );

	@Test @Ignore ( "Not a real test, not completed")
	public void testBasics () throws Exception
	{
		var userAgent = "Java-http-client/" + System.getProperty ( "java.version" );
		
		log.info ( "User agent is: \"{}\"", userAgent );

		HttpClient gacli = HttpClientBuilder.create ().build ();
		
		URIBuilder uriBuilder = new URIBuilder ();
		uriBuilder.setScheme ( "https" ).setHost ( "www.google-analytics.com" ).setPath ( "/collect" )
			.addParameter ( "v", "2" )
			.addParameter ( "tid", "G-31YFKXKSYH" ) // MB's personal test property ID
			// Anonymous Client Identifier. Ideally, this should be a UUID that
			// is associated with particular user, device, or browser instance.
			// Can be generated via uuidgen | tr '[:upper:]' '[:lower:]'
			.addParameter ( "cid", "40cdb6ea-e542-4160-a7da-641f6c150d58" )
			// .addParameter("t", "event") // Event hit type.
			// .addParameter("ec", "test") // Event category.
			// .addParameter("ea", "my-test") // Event action.
			.addParameter ( "ua", userAgent );
		
		var request = new HttpPost ( uriBuilder.build () );
		
		HttpResponse response = gacli.execute ( request );
		
		log.info ( "Response Status: {}", response.getStatusLine () );

		HttpEntity responseEntity = response.getEntity ();
		var responseBody = IOUtils.toString ( responseEntity.getContent (), Charset.forName ( "UTF-8" ) );

		log.info ( "Response body:\n{}", responseBody );
	}
}
