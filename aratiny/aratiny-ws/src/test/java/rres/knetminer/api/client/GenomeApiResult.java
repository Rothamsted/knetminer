package rres.knetminer.api.client;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
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
	
	private List<String[]> geneTable = List.of();
	private List<String[]> evidenceTable = List.of ();
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
		
		this.geneTable = str2Table ( jsResult.getString ( "geneTable" ) );
		this.evidenceTable = str2Table ( jsResult.getString ( "evidenceTable" ) );
		this.gviewer = jsResult.getString ( "gviewer" );
	}
	
	private static List<String[]> str2Table ( String tableString )
	{
		StringUtils.trimToNull ( tableString );
		if ( tableString == null ) return List.of ();

		String[] lines = tableString.split ( "\n" );
		List<String[]> table = new ArrayList<> ();
		for ( String line: lines )
			table.add ( line.split ( "\t" ) );
		
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
	 * This corresponds to the gene table view in the KnetMiner application.
	 * First element contains the headers.
	 */
	public List<String[]> getGeneTable ()
	{
		return geneTable;
	}

	/**
	 * This corresponds to the evidence table view in the KnetMiner application.
	 * First element contains the headers.
	 *  
	 */
	public List<String[]> getEvidenceTable ()
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