package rres.knetminer.datasource.api;

/**
 * 
 * Manages the response to the /network call.
 * 
 * This has the original subclass {@link JsonLikeNetworkResponse}, used to deal with the 
 * non-plain JSON export (the original one), plus the new {@link PlainJSONNetworkResponse}, which 
 * emebeds a pure-JSON export, as per #652.
 * 
 * @author brandizi
 * <dl><dt>Date:</dt><dd>29 Jul 2022</dd></dl>
 *
 */
public abstract class NetworkResponse extends KnetminerResponse
{	
	// TODO: probably the graph property could be factored here.
}
