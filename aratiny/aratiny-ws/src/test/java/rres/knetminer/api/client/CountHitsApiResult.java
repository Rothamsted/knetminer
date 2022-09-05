package rres.knetminer.api.client;

import org.json.JSONObject;

/**
 * Helper to deal with the result from the /countHits API
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>23 May 2022</dd></dl>
 *
 */
public class CountHitsApiResult
{ 
  private int geneCount = -1;
	private int luceneCount = -1;
	private int luceneLinkedCount = -1;
  
	public CountHitsApiResult ( JSONObject jsResult )
	{
		this.geneCount = jsResult.getInt ( "geneCount" );
		this.luceneCount = jsResult.getInt ( "luceneCount" );
		this.luceneLinkedCount = jsResult.getInt ( "luceneLinkedCount" );
	}

	public int getGeneCount ()
	{
		return geneCount;
	}

	public int getLuceneCount ()
	{
		return luceneCount;
	}

	public int getLuceneLinkedCount ()
	{
		return luceneLinkedCount;
	}
	
}
