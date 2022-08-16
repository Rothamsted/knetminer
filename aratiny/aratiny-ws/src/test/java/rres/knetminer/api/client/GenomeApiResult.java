package rres.knetminer.api.client;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;


/**
 * Helper to deal with the result from the /genome API
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>23 May 2022</dd></dl>
 *
 */
public class GenomeApiResult
{
	private int geneCount = -1;
	private int docSize = -1;
	private int totalDocSize = -1;
	
	private List<List<Object>> geneTable = List.of();
	private List<List<Object>> evidenceTable = List.of ();
	private String gviewer = "";
	

		
	/**
	 * Invoke it with the JSON coming from the /genome API invocation.
	 * 
	 * This has the same shape as the structure of this class:
	 * 
	 * <pre>
	 * {
	 *   "geneTable": "ONDEX-ID\tACCESSION\tGENE_NAME\tCHRO\tSTART..."
	 *   "evidenceTable": "TYPE\tNAME\tSCORE\tP-VALUE\tGENES\tUSER_GENES\t..."
	 *   "geneCount": 12,
	 *	 "docSize": 3643,
	 *   "totalDocSize": 5153,
	 *    "gviewer": "<?xml version=\"1.0\" standalone=\"yes\"?>\n<genome>\n<feature id=\"0\">...."
	 * }
	 * </pre>
	 * 
	 */
	public GenomeApiResult ( JSONObject jsResult )
	{
		geneCount = jsResult.getInt ( "geneCount" );
		docSize = jsResult.getInt ( "docSize" );
		totalDocSize = jsResult.getInt ( "totalDocSize" );
		
		this.geneTable =   json2Table ( jsResult.get ( "geneTable" ) ) ;
		this.evidenceTable = json2Table ( jsResult.get ( "evidenceTable" ) );
		this.gviewer = jsResult.getString ( "gviewer" );
	}
	
	@SuppressWarnings ( "unchecked" )
	private static List<List<Object>> json2Table ( Object tableObject )
	{
		Map<String, Object> jsonMap = ( (JSONObject ) tableObject ).toMap ();
		
		List<List<Object>> table = new ArrayList<> ();
		
		table.add ( (List<Object>) jsonMap.get ( "headers" ) );
		table.addAll ( (List<List<Object>>)jsonMap.get ( "rows" ) );
		
		return table;
	}
	
	public int getGeneCount ()
	{
		return geneCount;
	}

	public int getDocSize ()
	{
		return docSize;
	}

	public int getTotalDocSize ()
	{
		return totalDocSize;
	}

	/**
	 * This corresponds gene table view in the KnetMiner application.
	 * First element contains the headers.
	 * 
	 * This is a (hopefully) convenient simplification of the JSON that the API 
	 * returns (which is a map with "headers" and "rows").
	 */
	public List<List<Object>> getGeneTable ()
	{
		return geneTable;
	}

	/**
	 * This corresponds to the evidence table view in the KnetMiner application.
	 * First element contains the headers.
	 *
	 * @see #getGeneTable().
	 */
	public List<List<Object>> getEvidenceTable ()
	{
		return evidenceTable;
	}

	/**
	 * This contains XML that is used to render the chromosome view in the KnetMiner application.
	 */
	public String getGviewer ()
	{
		return gviewer;
	}
}
