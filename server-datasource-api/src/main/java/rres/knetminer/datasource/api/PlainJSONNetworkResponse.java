package rres.knetminer.datasource.api;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;


/**
 * Manages plain JSON exports from /network, @see {@link NetworkResponse}
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>29 Jul 2022</dd></dl>
 *
 */
public class PlainJSONNetworkResponse extends NetworkResponse
{
	private Map<String, Object> graph;

	public PlainJSONNetworkResponse ()
	{
		super ();
	}

	/**
	 * Parses the pay load as JSON, using {@link #setGraph(String)}.
	 */
	public PlainJSONNetworkResponse ( String jsGraph )
	{
		this ();
		setGraph ( jsGraph );
	}

	/**
	 * This is obtained from re-parsing the JSON output coming from the Ondex exporter.
	 */
	public Map<String, Object> getGraph ()
	{
		return graph;
	}

	public void setGraph ( Map<String, Object> jsGraph )
	{
		this.graph = jsGraph;
	}
	
	/**
	 * This parses the String as JSON and then {@link #setGraph(Map) sets the JSON pay load}.
	 */
	@SuppressWarnings ( "unchecked" )
	public void setGraph ( String strJsGraph )
	{
		var mapper = new ObjectMapper ();
		try {
			this.graph = mapper.readValue ( strJsGraph, HashMap.class );
		}
		catch ( JsonProcessingException ex ) {
			throw new IllegalArgumentException (
				"Error while sending back response to /network: " + ex.getMessage (), ex 
			);
		}
	}
	
}
