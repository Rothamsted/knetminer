package rres.knetminer.api.client;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import rres.knetminer.datasource.api.datamodel.EvidenceTableEntry;
import rres.knetminer.datasource.api.datamodel.GeneTableEntry;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;


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
	
	private List<GeneTableEntry> geneTable = List.of();
	private List<EvidenceTableEntry> evidenceTable = List.of ();
	private String gviewer = "";
	
	private Logger log = LogManager.getLogger ( this.getClass () );
		
	/**
	 * Invoke it with the JSON coming from the /genome API invocation.
	 * 
	 * This has the same shape as the structure of this class:
	 * 
	 * <pre>
	 * {
	 *   "geneTable": [ {@link GeneTableEntry} ... ]
	 *   "evidenceTable": [ @link {@link EvidenceTableEntry} ]
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
		try
		{
			geneCount = jsResult.getInt ( "geneCount" );
			docSize = jsResult.getInt ( "docSize" );
			totalDocSize = jsResult.getInt ( "totalDocSize" );
			
			var mapper = new ObjectMapper ();
			
			// TODO: there is a more efficient way: https://stackoverflow.com/a/33780051/529286
			var geneTableJsonStr = jsResult.getJSONArray ( "geneTable" ).toString ();
			if ( log.isDebugEnabled () ) log.debug ( "geneTable data: {}", geneTableJsonStr );
			this.geneTable = mapper.readValue (
				geneTableJsonStr, 
				mapper.getTypeFactory ().constructCollectionType ( List.class, GeneTableEntry.class ) 
			);
			
			// TODO: ditto
			this.evidenceTable = mapper.readValue (
				jsResult.getJSONArray ( "evidenceTable" ).toString (), 
				mapper.getTypeFactory ().constructCollectionType ( List.class, EvidenceTableEntry.class ) 
			); 
			//str2Table ( jsResult.getString ( "evidenceTable" ) );
			this.gviewer = jsResult.getString ( "gviewer" );
		}
		catch ( JsonProcessingException | JSONException ex )
		{
			ExceptionUtils.throwEx ( IllegalArgumentException.class, ex, 
			  "Error while building the result object from /genome: $cause"
			);
		}
	}
	
	/* TODO: remove, used with the old table-in-JSON format
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
	*/

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
	public List<GeneTableEntry> getGeneTable ()
	{
		return geneTable;
	}

	/**
	 * This corresponds to the evidence table view in the KnetMiner application.
	 * First element contains the headers.
	 *  
	 */
	public List<EvidenceTableEntry> getEvidenceTable ()
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
