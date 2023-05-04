package rres.knetminer.datasource.server.utils;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.util.Collection;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import javax.servlet.AsyncContext;
import javax.servlet.DispatcherType;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpUpgradeHandler;
import javax.servlet.http.Part;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.mutable.MutableBoolean;
import org.apache.http.HttpResponse;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import rres.knetminer.datasource.server.utils.GoogleAnalyticsHelper.Event;
import rres.knetminer.datasource.server.utils.GoogleAnalyticsHelper.Parameter;
import uk.ac.ebi.utils.opt.net.ServletUtils;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>4 May 2023</dd></dl>
 *
 */
public class GoogleAnalyticsHelperTest
{
		
	// WARNING! These are my personal credentials used for testing, DO NOT 
	// reuse elsewhere!
	//
	private static GoogleAnalyticsHelper gahelper = new GoogleAnalyticsHelper ( 
		"c9TGJqIBSVuKB1CoRcZ90Q", "G-31YFKXKSYH", "40cdb6ea-e542-4160-a7da-641f6c150d58"
	);

	private final Logger log = LogManager.getLogger ( getClass() );

	@Test
	public void testSendSingleEvent ()
	{
		var response = gahelper.sendEvents ( 
			new Event ( 
				"unitTestEvent", 
				new Parameter ( "textParam", "Hello, World!" ),
				new Parameter ( "numericParam", 2.0 )
			)
		);
		
		verifySendEvents ( response );
	}
	
	@Test
	public void testSendEventWithClientAddresses ()
	{
		String actualIp = "5.6.7.8";
		String actualHost = "somepc.somewhere.net";
		
		MockHttpServletRequest req = new MockHttpServletRequest ();
		req.setRemoteAddr ( "1.2.3.4" );
		req.addHeader ( "X-Forwarded-For", actualIp );
		req.setRemoteHost ( "knetminer.com" );
		req.addHeader ( "X-Forwarded-Host", actualHost );
		
		var response = gahelper.sendEvents ( 
			new Event ( 
				"unitTestEventWithAddrs", 
				new Parameter ( "textParam", "Hello, World!" ),
				gahelper.getClientIPParam ( req ),
				gahelper.getClientHostParam ( req )
			)
		);
		
		verifySendEvents ( response );
	}
	
	
	
	@Test @Ignore ( "The GA4 doesn't seem to support this, see Javadoc notes" )
	public void testSendMultipleEvents ()
	{
		var response = gahelper.sendEvents ( 
			new Event ( 
				"unitTestEvent.01", 
				new Parameter ( "textParam", "Hello, World!" ),
				new Parameter ( "numericParam", 2.0 )
			),
			new Event (
				"unitTestEvent.02"
			)
		);
		
		verifySendEvents ( response );
		
	}
	
	
	@Test
	public void testSendEventsAsync () throws InterruptedException, ExecutionException
	{
		MutableBoolean testFlag = new MutableBoolean ( false );
		
		HttpResponse response = gahelper.sendEventsAsync (
			new Event (
					"unitTestAsyncEvent"
				)
			).thenApply ( 
				r -> { testFlag.setTrue (); return r; }
			).get ();
		
		assertTrue ( "It seems async sendEventsAsync () didn't work!", testFlag.getValue () );
		verifySendEvents ( response );
	}
	
	@Test
	public void testClientIpTracking ()
	{
		MockHttpServletRequest req = new MockHttpServletRequest ();
		req.setRemoteAddr ( "1.2.3.4" );
		
		Parameter p = gahelper.getClientIPParam ( req );
		assertEquals ( "getClientIPParam() doesn't work!", req.getRemoteAddr (), p.getString () );
	}
	
	@Test
	public void testClientIpTrackingWithForward ()
	{
		String actualIp = "5.6.7.8";
		MockHttpServletRequest req = new MockHttpServletRequest ();
		req.setRemoteAddr ( "1.2.3.4" );
		req.addHeader ( "X-Forwarded-For", actualIp );
		
		Parameter p = gahelper.getClientIPParam ( req );
		assertEquals ( "getClientIPParam() doesn't work!", actualIp, p.getString () );
	}

	@Test
	public void testClientHostTracking ()
	{
		MockHttpServletRequest req = new MockHttpServletRequest ();
		req.setRemoteAddr ( "1.2.3.4" );
		req.setRemoteHost ( "knetminer.com" );
		
		Parameter p = gahelper.getClientHostParam ( req );
		assertEquals ( "getClientIPParam() doesn't work!", req.getRemoteHost (), p.getString () );
	}
	
	@Test
	public void testClientHostTrackingWithForward ()
	{
		String actualIp = "5.6.7.8";
		String actualHost = "somepc.somewhere.net";
		
		MockHttpServletRequest req = new MockHttpServletRequest ();
		req.setRemoteAddr ( "1.2.3.4" );
		req.addHeader ( "X-Forwarded-For", actualIp );
		req.setRemoteHost ( "knetminer.com" );
		req.addHeader ( "X-Forwarded-Host", actualHost );

		Parameter p = gahelper.getClientHostParam ( req );
		assertEquals ( "getClientIPParam() doesn't work!", actualHost, p.getString () );
	}	
	
	
	
	
	private void verifySendEvents ( HttpResponse response )
	{
		var sl = response.getStatusLine ();
		
		int rcode = sl.getStatusCode ();
		log.info ( "test event sent, answer: '{}'", sl.getReasonPhrase () );
		
		assertEquals ( "Unexpeted status answer from GA Analytics", 204, rcode );

		String rbody = ServletUtils.getResponseBody ( response );
		
		assertEquals ( "Unexpeted response body GA Analytics", 
			0, 
			StringUtils.trimToEmpty ( rbody ).length ()
		);		
	}
}
