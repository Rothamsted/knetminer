package rres.knetminer.datasource.server.utils.googleanalytics4;

import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import uk.ac.ebi.utils.regex.RegEx;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>24 May 2023</dd></dl>
 *
 */
public class GoogleAnalyticsUtils
{
	private final static Logger slog = LogManager.getLogger ( GoogleAnalyticsUtils.class );
	
	public static StringParam getClientIPParam ( HttpServletRequest httpRequest )
	{
		String clientIP = httpRequest.getHeader ( "X-Forwarded-For" );
		
		if ( clientIP == null )
			clientIP = httpRequest.getRemoteAddr ();
		else
		{
			slog.debug ( "Preparing Google Analytics, splitting X-Forwarded-For IP: {}", clientIP );
			if ( clientIP.indexOf ( ',' ) != -1 ) clientIP = clientIP.split ( "," )[ 0 ];
		}
		
		slog.debug ( "Preparing Google Analytics, clientIP: {}", clientIP );
		return new StringParam ( "clientIP", clientIP );
	}
	
	public static StringParam getClientHostParam ( HttpServletRequest httpRequest )
	{
		String clientHost = Optional.ofNullable ( httpRequest.getHeader ( "X-Forwarded-Host" ) )
			.orElse ( httpRequest.getRemoteHost () );
		slog.debug ( "Preparing Google Analytics, client host: {}", clientHost );
		return new StringParam ( "clientHost", clientHost );
	}
	
	
	/**
	 * GA4 expects names having alphanumeric characters only.
	 * 
	 */
	public static boolean isValidGAName ( String name )
	{
		if ( name == null ) return false;
		var re = RegEx.of ( "\\w+" );
		return re.matches ( name );
	}
	
	
	/**
	 * Uses {@link #isValidGAName(String)} and raises an exception if the name isn't valid. 
	 * Used for validation in various GA-related code.
	 */
	public static void validateGAName ( String name ) throws IllegalArgumentException
	{
		if ( !isValidGAName ( name ) ) throw new IllegalArgumentException ( String.format ( 
			"The name \"%s\" is invalid for Google Analytics", name
		));
	}
	
	/**
	 * Turns an invalid GA name an acceptable one, eg, normalise invalid chars into '_'
	 * 
	 * @param name
	 * @return
	 */
	public static String normalizeGAName ( String name ) {
		if ( name == null ) return null;
		var matcher = RegEx.of ( "\\W" ).matcher ( name );
		return matcher.replaceAll ( "_" );
	}

}
