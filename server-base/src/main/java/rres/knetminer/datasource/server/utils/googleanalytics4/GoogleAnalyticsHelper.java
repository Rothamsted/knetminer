package rres.knetminer.datasource.server.utils.googleanalytics4;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URISyntaxException;
import java.util.concurrent.CompletableFuture;

import org.apache.http.HttpEntity;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedValueException;
import uk.ac.ebi.utils.opt.net.ServletUtils;

/**
 * TODO: this has to be moved to its own project about GA4, so see it as it was a 3rd-party dependency and 
 * DO NOT mix ANY Knetminer-specific thing with it!
 * 
 * TODO: comment me!
 * 
 * TODO: <a href = "https://support.google.com/analytics/answer/9355671">user properties</a> 
 * aren't supported yet.
 * 
 * @author brandizi
 * <dl><dt>Date:</dt><dd>3 May 2023</dd></dl>
 *
 */
public class GoogleAnalyticsHelper
{
	private String apiSecret;
	private String measurementId;
	private String clientId;
	
	private boolean nonPersonalizedAds = true;
	
	private String userAgent = "Java-http-client/" + System.getProperty ( "java.version" );

	private final Logger log = LogManager.getLogger ( getClass() );
	
	
	public GoogleAnalyticsHelper ( String apiSecret, String measurementId, String clientId )
	{
		log.info ( 
			"Initialising Google Analytics 4 with, measurement ID: {}, client ID: {}", 
			measurementId, clientId
		);
		this.apiSecret = apiSecret;
		this.measurementId = measurementId;
		this.clientId = clientId;
	}
	
	/**
	 *
	 * <b>WARNING</b>: Apparently, it is possible to send multiple events and if you try, you'll
	 * get a 204 result, so, all looks fine, <b>however</b>, I don't see any record on the GA4
	 * dashboard when I try this. So, at least for now, it's best to stick with sending 
	 * one event only. 
	 *  
	 * @see ServletUtils#getResponseBody(HttpResponse)
	 */
	public HttpResponse sendEvents ( Event ... events )
	{
		try
		{	
			if ( events == null || events.length == 0 ) throw new IllegalArgumentException ( 
				"Can't send a null/empty event array to GA4"
			);
			
			if ( events.length > 1 ) throw new UnsupportedOperationException ( 
				"Sending multiple events in one request isn't supported yet" 
			);
			
			// The events JSON (and other needed details)
			var jsBody = getBody ( events ).toString ( 2 );
			HttpEntity httpBody = new StringEntity ( jsBody, ContentType.APPLICATION_JSON );	
			
			// The URL with needed params
			URIBuilder uriBuilder = new URIBuilder ( "https://www.google-analytics.com/mp/collect" );
			uriBuilder.addParameter ( "api_secret", this.apiSecret );
			uriBuilder.addParameter ( "measurement_id", this.measurementId );
			
			// Put it all together and send
			var request = new HttpPost ( uriBuilder.build () );
			request.setHeader ( HttpHeaders.USER_AGENT, this.userAgent );
			request.setEntity ( httpBody );

			HttpClient gacli = HttpClientBuilder.create ().build ();
			HttpResponse response = gacli.execute ( request );
			
			
			// Report results
			
			String eventStr = events.length > 0 
				? events [ 0 ].getName ()
				: "<NA>";
			
			var respStatus = response.getStatusLine ();
			// Apparently, it returns 204/NoContent when the request is valid, else it returns
			// 200 and an image
			if ( respStatus.getStatusCode () != 204 )
				log.error ( 
						"Google Analytics, request failed, event[0]: {}"
					+ ", HTTP code: {}, HTTP message: {}",
					eventStr,
					respStatus.getStatusCode (),
					respStatus.getReasonPhrase ()
				);
			else
				log.info ( 
					"Google Analytics, request sent, event[0]: {}, status: {}/{}",
					eventStr,
					respStatus.getStatusCode (),
					respStatus.getReasonPhrase ()
			);
			
			if ( log.isTraceEnabled () )
			{
				log.trace ( 
					"Google Analytics, details, sent events: {}, measurementId: {}",
					jsBody, this.measurementId 
				);
			}
			
			return response;
		}
		catch ( URISyntaxException ex )
		{
			throw ExceptionUtils.buildEx ( UnexpectedValueException.class, ex, 
				"Error while sending data to Google Analytics: $cause"
			);
		}
		catch ( IOException ex )
		{
			throw ExceptionUtils.buildEx ( UncheckedIOException.class, ex, 
				"Error while sending data to Google Analytics: $cause"
			);
		}
	}
	
	public CompletableFuture<HttpResponse> sendEventsAsync ( Event ... events )
	{
		return CompletableFuture.supplyAsync ( () -> sendEvents ( events ) );
	}
	
	private JSONObject getBody ( Event[] events )
	{
		JSONObject js = new JSONObject ();
		js.put ( "client_id", this.clientId );
		js.put ( "non_personalized_ads", this.nonPersonalizedAds );
		
		JSONArray jsevents = new JSONArray ();
		for ( Event event: events )
			jsevents.put ( event.toJSON () );
		
		js.put ( "events", jsevents );
		
		return js;
	}

	public String getApiSecret ()
	{
		return apiSecret;
	}


	public void setApiSecret ( String apiSecret )
	{
		this.apiSecret = apiSecret;
	}


	public String getMeasurementId ()
	{
		return measurementId;
	}


	public void setMeasurementId ( String measurementId )
	{
		this.measurementId = measurementId;
	}


	public String getClientId ()
	{
		return clientId;
	}


	public void setClientId ( String clientId )
	{
		this.clientId = clientId;
	}


	public boolean isNonPersonalizedAds ()
	{
		return nonPersonalizedAds;
	}


	public void setNonPersonalizedAds ( boolean nonPersonalizedAds )
	{
		this.nonPersonalizedAds = nonPersonalizedAds;
	}


	public String getUserAgent ()
	{
		return userAgent;
	}


	public void setUserAgent ( String userAgent )
	{
		this.userAgent = userAgent;
	}	
}
