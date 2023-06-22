package rres.knetminer.datasource.api.datamodel;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

import rres.knetminer.datasource.api.KeywordResponse;

/**
 * The data model used for {@link KeywordResponse#getEvidenceTable()}. That is, an evidence table
 * is an array of JSON objects that are instances of this class.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>20 Jun 2023</dd></dl>
 *
 * Example of JSON output that this class yields via the API:
 * 
 * <pre>
 * [{
 * 	 "ondexId": 6639684,
 * 	 "conceptType": "Path",
 * 	 "name": "Regulation of seed size",
 * 	 "score": 7.334310054779053,
 * 	 "pvalue": 0.01,
 * 	 "totalGenesSize": 2,
 * 	 "userGeneAccessions": [ "FOO-1", "FOO-2" ],
 * 	 "qtlsSize": 2,
 * 	 "userGenesSize": 3
 *  },
 *  {...},
 *  ...
 * ]
 * </pre>
 */
public class EvidenceTableEntry
{
	private int ondexId;
	private String conceptType;
	private String name;
	
	private Double score;
	private Double pvalue;
	
	private int totalGenesSize;
	
	private Set<String> userGeneAccessions;
	
	private int qtlsSize;
	
	
	@SuppressWarnings ( "unused" )
	private EvidenceTableEntry () {
		// Used by JSON serialisers
	}

	public EvidenceTableEntry ( 
		int ondexId, String conceptType, String name, Double score, Double pvalue,
		int totalGenesSize, Set<String> userGeneAccessions, int qtlsSize 
	)
	{
		super ();
		this.ondexId = ondexId;
		this.conceptType = conceptType;
		this.name = name;
		this.score = score;
		this.pvalue = pvalue;
		this.totalGenesSize = totalGenesSize;
		this.userGeneAccessions = userGeneAccessions;
		this.qtlsSize = qtlsSize;
	}

	public int getOndexId ()
	{
		return ondexId;
	}

	public String getConceptType ()
	{
		return conceptType;
	}

	/**
	 * This is something like the shortest concept name, chosen by the code.
	 */
	public String getName ()
	{
		return name;
	}

	public Double getScore ()
	{
		return score;
	}

	public Double getPvalue ()
	{
		return pvalue;
	}

	/**
	 * Total genes that reach this evidence via semantic motifs.
	 */
	public int getTotalGenesSize ()
	{
		return totalGenesSize;
	}

	public Set<String> getUserGeneAccessions ()
	{
		return Optional.ofNullable ( userGeneAccessions )
			.map ( Collections::unmodifiableSet )
			.orElse ( Set.of () );
	}

	/**
	 * This counts two possible things:
	 * 
	 * - the chromosome regions (QTLs) that were reached by the semantic motifs and which
	 * match the genes that reach this evidence via semantic motifs (ie, the same as {@link #getTotalGenesSize()}).
	 * - plus the user QTLs that match some of the same genes.
	 * 
	 * Hence, user genes are not considered here (they might or might not be in the whole set of associated
	 * genes).
	 */
	public int getQtlsSize ()
	{
		return qtlsSize;
	}
	
	/**
	 * This is the size of {@link #getUserGeneAccessions()} and it was added in #726, 
	 * to avoid that the client spends too much time computing the same number. 
	 * TODO: Java unit test.
	 */
  @JsonProperty ( access = JsonProperty.Access.READ_ONLY )
	public int getUserGenesSize ()
	{
		return getUserGeneAccessions ().size ();
	}
}
