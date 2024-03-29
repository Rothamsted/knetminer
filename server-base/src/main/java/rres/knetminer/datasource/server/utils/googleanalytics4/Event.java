package rres.knetminer.datasource.server.utils.googleanalytics4;

import static rres.knetminer.datasource.server.utils.googleanalytics4.GoogleAnalyticsUtils.validateGAName;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;

/**
 * A GA4/MP tracking request must receive at least one event. This is something like: 
 * "api_search_call" and can have parameters like "keyword: blah".
 *
 * @see GoogleAnalyticsHelper
 *
 * TODO: items isn't supported yet. According to <a href = "https://tinyurl.com/2mys5cth">docs</a>,
 * they're a parameter names 'items', which of value is an array of objects, and each object
 * can have values of string or number type only (ie, {@link Parameter} only). I've no idea
 * what these are for, the GA4 dashboard doesn't seem to show them anywhere.
 * 
 */
public class Event
{
	private String name;
	// Storing them with a name index, just in case
	private Map<String, Parameter<?>> parameters = new HashMap<> ();
	
	/**
	 * The name is validated via {@link GoogleAnalyticsUtils#validateGAName(String)}, to ensure
	 * GA accepts it. You can use {@link GoogleAnalyticsUtils#normalizeGAName(String)} to tame
	 * possibly invalid names.
	 * 
	 * TODO: the values are restricted too, validation to be added.
	 */
	public Event ( String name, Parameter<?>... parameters )
	{
		super ();

		validateGAName ( name );
		if ( name.length () > 40 ) ExceptionUtils.throwEx ( 
			IllegalArgumentException.class,
			"GA Analyitcs event ID \"%s\" is too long, can't be >40 chars",
			name
		);		
		
		this.name = name;

		
		if ( parameters == null ) return;
		for ( var p: parameters )
			// This enforces name uniquess, via overriding
			this.parameters.put ( p.getName (), p );
	}

	/**
	 * The JSON format needed by GA. This makes use of {@link Parameter#getValue()}
	 */
	public JSONObject toJSON ()
	{
		JSONObject js = new JSONObject ();
		
		js.put ( "name", name );

		JSONObject jparams = new JSONObject ();
		parameters.forEach ( (k, p) -> jparams.put ( p.getName (), p.getValue () ) );
		js.put ( "params", jparams );
		
		return js;
	}

	public String getName ()
	{
		return name;
	}
	
	public Map<String, Parameter<?>> getParameters ()
	{
		return Collections.unmodifiableMap ( parameters );
	}
	
	public String toString ()
	{
		return "Event" + toJSON ().toString ();
	}
}