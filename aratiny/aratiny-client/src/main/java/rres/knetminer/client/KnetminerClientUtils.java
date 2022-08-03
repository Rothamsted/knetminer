package rres.knetminer.client;

import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;


/**
 * Small utilities to support Knetminer client/UI web functionality.
 * 
 * @author brandizi
 * <dl><dt>Date:</dt><dd>28 Jul 2022</dd></dl>
 *
 */
public class KnetminerClientUtils
{
	public static final String API_URL_PROP_NAME = "knetminer.api.url";
	
	private static Logger slog = LogManager.getLogger ( KnetminerClientUtils.class );

	/**
	 * <p>An helper class used to in api-url.jsp, to have a web service on the client that returns the URL of
	 * the Knetminer API root URL. This method is supposed to be invoked by a JSP</p>
	 * 
	 * <p>Writes the Knetminer API URL base (something like: http://root.org/ws/wheat) on jspOut, which is 
	 * the out writer in the JSP page using this method.</p>
	 * 
	 * <p>The URL is taken first from the {@link #API_URL_PROP_NAME} property (eg, passed via -D). If this  
	 * isn't defined, then the method tries to make a reasonable guess, this way: it takes the client's 
	 * URL from request (ie, URL the browser used to reach the invoking JSP), and it takes whatever
	 * comes from jspCallerPath. Then, it appends a well-known path to such URL base.</p>
	 * 
	 * <p>For instance, suppose the client called api-url.jsp with http://knetminer.org/myknet/html/api-url.jsp.
	 * And that jspCallerPath is: /html/api-url.jsp. Then, the method takes http://knetminer.org/myknet and 
	 * adds /ws/wheat, so the final API URL is assumed to be http://knetminer.org/myknet/ws/wheat.
	 * The 'wheat' part is the ID of the configured dataset, and it's obtained by initially calling 
	 * http://knetminer.org/myknet/ws/default/dataset-info.</p>
	 * 
	 * <p>Also note that, if the initial URL that the method sees ends with /client, something like 
	 * http://knetminer.org/myknet/client/html/api-url.jsp, then the final API URL will also be
	 * http://knetminer.org/myknet/ws/wheat. In other words, the /client/ bit is removed. That's because
	 * /client and /ws are the two paths that The docker container uses for the two Knetminer web 
	 * applications.  
	 */
	public static void outputApiUrl ( 
		HttpServletRequest request, HttpServletResponse response, Writer jspOut, String jspCallerPath
	)
	{
		try
		{
			// First, check if it is given explicitly
			var apiUrl = System.getProperty ( API_URL_PROP_NAME );
			if ( apiUrl != null ) { 
				jspOut.write ( apiUrl );
				slog.info ( "Returning the API URL: {}", apiUrl );
				return;
			}
			
			// Else, try some heuristics, as explained above.
			//
			var myUrl = request.getRequestURL ().toString ();
			var idx = myUrl.indexOf ( jspCallerPath );
			var clientBaseUrl = myUrl.substring ( 0, idx );
			
			var wsBaseUrl = clientBaseUrl;
			
			// As explained, /client is a special case in the Docker container
			wsBaseUrl = wsBaseUrl.replaceAll ( "/client$", "" );
				
			// OK, now get the dataset ID
			// TODO: one day we will migrate towards paths where the DS ID isn't needed in any URL
			//
			wsBaseUrl = wsBaseUrl + "/ws";
			
			HttpGet req = new HttpGet ( wsBaseUrl + "/default/dataset-info" );
			HttpClient client = HttpClientBuilder.create ().build ();

			HttpResponse resp = client.execute ( req );
			InputStream in = resp.getEntity ().getContent ();

			int httpCode = resp.getStatusLine ().getStatusCode ();
			if ( httpCode >= 400 ) {
				// TODO: it's not getting it, probably needs setStatus() only
				jspOut.write ( IOUtils.toString ( in, "UTF-8" ) );
				// Sending 500, cause it's the only code that makes Tomcat to display something
				response.sendError ( HttpStatus.SC_INTERNAL_SERVER_ERROR, "Knetminer API not available" );
				return;
			}
			
			// Parse the resulting JSON
			
			var jsmap = new ObjectMapper ();
			@SuppressWarnings ( "unchecked" )
			Map<String, Object> js = jsmap.readValue ( in, HashMap.class );
			String dataSetId = (String) js.get ( "id" );
			
			apiUrl = wsBaseUrl + "/" + dataSetId;
			jspOut.write ( apiUrl );
			slog.info ( "Returning the API URL: {}", apiUrl );
		}
		catch ( UnsupportedOperationException | IOException ex )
		{
			throw new RuntimeException ( 
				"Internal error while getting Knetminer API URL: " + ex.getMessage (), ex
			);
		} 
	}
}
