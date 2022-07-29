package rres.knetminer.datasource.api;

/**
 * Manages pure-JSON export from /network, @see {@link NetworkResponse}.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>29 Jul 2022</dd></dl>
 *
 */
public class JsonLikeNetworkResponse extends NetworkResponse
{
	private String graph;
	
	public JsonLikeNetworkResponse ()
	{
		super ();
	}

	public JsonLikeNetworkResponse ( String graph )
	{
		this ();
		this.graph = graph;
	}

	public String getGraph() {
		return graph;
	}

	public void setGraph(String graph) {
		this.graph = graph;
	}
}
