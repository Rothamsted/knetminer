package rres.knetminer.datasource.api.datamodel;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>20 Jun 2023</dd></dl>
 *
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
