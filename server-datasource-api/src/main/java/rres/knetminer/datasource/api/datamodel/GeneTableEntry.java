package rres.knetminer.datasource.api.datamodel;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>19 Jun 2023</dd></dl>
 *
 */
@JsonAutoDetect (
	// This allows for better control of isXXX()
	getterVisibility = Visibility.NONE, fieldVisibility = Visibility.NONE,
	setterVisibility = Visibility.NONE, isGetterVisibility = Visibility.NONE
)
public class GeneTableEntry
{
	public static class TypeEvidences
	{
		private List<String> conceptLabels;
		private int reportedSize = 0;
		
		@SuppressWarnings ( "unused" )
		private TypeEvidences () {
			// Needed by JSON serialisers
		}
		
		public TypeEvidences ( List<String> conceptLabels, int reportedSize )
		{
			this.conceptLabels = Optional.ofNullable ( conceptLabels ).orElse ( List.of () );
			this.reportedSize = reportedSize;
		}
		
		public TypeEvidences ( List<String> conceptLabels )
		{
			this ( 
				conceptLabels, 
				Optional.ofNullable ( conceptLabels ).map ( List::size ).orElse ( 0 ) 
			);
		}

		public List<String> getConceptLabels () {
			return conceptLabels;
		}

		public int getReportedSize () {
			return reportedSize;
		}
	} // TypeEvidences
	
	public static class QTLEvidence
	{
		private String regionLabel, regionTrait;

		@SuppressWarnings ( "unused" )
		private QTLEvidence () {
			// Needed by JSON serializers 
		}
		
		public QTLEvidence ( String regionLabel, String regionTrait )
		{
			super ();
			this.regionLabel = regionLabel;
			this.regionTrait = regionTrait;
		}

		public String getRegionLabel () {
			return regionLabel;
		}

		public String getRegionTrait () {
			return regionTrait;
		}	
	} // QTLEvidence
	
	@JsonProperty
	private int ondexId = -1;
	
	@JsonProperty
	private String accession;
	
	@JsonProperty
	private String name;
	
	@JsonProperty
	private String taxID;

	@JsonProperty
	private String chromosome;
	
	@JsonProperty
	private Integer geneBeginBP;
	
	@JsonProperty
	private Integer geneEndBP;
	

	@JsonProperty
	private Double score;

	private Boolean isUserGene;

	// TODO: sorted?
	// TODO: need tests
	@JsonProperty
	private Map<String, TypeEvidences> conceptEvidences;
	
	// TODO: need tests
	@JsonProperty
	private List<QTLEvidence> qtlEvidences;
	
	@SuppressWarnings ( "unused" )
	private GeneTableEntry () {
		// Required by JSON serializers
	}
	
	
	public GeneTableEntry ( 
		int ondexId, String accession, String name,
		String taxID,
		String chromosome, Integer geneBeginBP, Integer geneEndBP,
		Double score, Boolean isUserGene, 
		Map<String, TypeEvidences> conceptEvidences,
		List<QTLEvidence> qtlEvidences )
	{
		super ();
		this.ondexId = ondexId;
		this.accession = accession;
		this.name = name;
		this.taxID = taxID;
		this.chromosome = chromosome;
		this.geneBeginBP = geneBeginBP;
		this.geneEndBP = geneEndBP;
		this.score = score;
		this.isUserGene = isUserGene;
		this.conceptEvidences = conceptEvidences;
		this.qtlEvidences = qtlEvidences;
	}

	public int getOndexId ()
	{
		return ondexId;
	}

	public String getAccession ()
	{
		return accession;
	}

	public String getName ()
	{
		return name;
	}
	
	public String getTaxID ()
	{
		return taxID;
	}

	public String getChromosome ()
	{
		return chromosome;
	}

	public Integer getGeneBeginBP ()
	{
		return geneBeginBP;
	}

	public Integer getGeneEndBP ()
	{
		return geneEndBP;
	}
	
	public Double getScore ()
	{
		return score;
	}

	@JsonProperty ( "isUserGene" )
	public Boolean isUserGene ()
	{
		return isUserGene;
	}

	@JsonProperty ( "isUserGene" )
	private void setUserGene ( Boolean isUserGene ) {
		this.isUserGene = isUserGene;
	}

	public Map<String, TypeEvidences> getConceptEvidences ()
	{
		return Optional.ofNullable ( conceptEvidences )
			.map ( Collections::unmodifiableMap )
			.orElse ( Map.of () );
	}

	public List<QTLEvidence> getQtlEvidences ()
	{
		return Optional.ofNullable ( qtlEvidences )
			.map ( Collections::unmodifiableList )
			.orElse ( List.of () );
	}

}

