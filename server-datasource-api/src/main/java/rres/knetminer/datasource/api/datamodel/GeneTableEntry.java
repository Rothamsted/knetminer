package rres.knetminer.datasource.api.datamodel;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.annotation.Nonnull;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonProperty;

import rres.knetminer.datasource.api.KeywordResponse;

/**
 * The data model used for {@link KeywordResponse#getGeneTable()}. That is, a gene table
 * is an array of JSON objects that are instances of this class.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>19 Jun 2023</dd></dl>
 * 
 *
 * Example of JSON that this class returns via API:
 * 
 * <pre>
[
  {
    "score": 7.291821709509696,
    "geneEndBP": 5737854,
    "isUserGene": true,
    "taxID": "3702",
    "conceptEvidences": {
      "BioProc": {
        "conceptEvidences": [
          {
            "graphDistance": 2,
            "conceptLabel": "Regulation Of Transcription, DNA-templated"
          }
        ],
        "reportedSize": 1
      },
      "Publication": {
        "conceptEvidences": [
          {
            "graphDistance": 2,
            "conceptLabel": "PMID:19130088"
          },
          {
            "graphDistance": 2,
            "conceptLabel": "PMID:19341407"
          }
        ],
        "reportedSize": 2
      }
    },
    "chromosome": "3",
    "name": "TPR2",
    "ondexId": 6648480,
    "qtlEvidences": [],
    "accession": "AT3G16830",
    "geneBeginBP": 5731519
  },
  {...},
  ...
 ]
 * <pre>
 *
 */
@JsonAutoDetect (
	// This allows for better control of isXXX()
	getterVisibility = Visibility.NONE, fieldVisibility = Visibility.NONE,
	setterVisibility = Visibility.NONE, isGetterVisibility = Visibility.NONE
)
public class GeneTableEntry
{
	/**
	 * For each gene, there are evidence concepts, represented from this class.
	 * 
	 * Namely, for each concept type in {@link GeneTableEntry#getConceptEvidences()}, we have an instance
	 * of {@link TypeEvidences}, with some summary about all the concepts of the same type, and then 
	 * a collection of this this hereby type, in {@link TypeEvidences#getConceptEvidences()}
	 * 
	 * As the rest, this is turned into JSON upon the API response.
	 */
	public static class TypeEvidences
	{
		private List<ConceptEvidence> conceptEvidences;
		private int reportedSize = 0;
				
		public TypeEvidences ( List<ConceptEvidence> conceptEvidences, int reportedSize )
		{
			this.conceptEvidences = conceptEvidences;
			this.reportedSize = reportedSize;
		}
		
		/** 
		 * Defaults to {@code reportedSize == conceptEvidences.size()}.
		 * 
		 */
		public TypeEvidences ( List<ConceptEvidence> conceptEvidences )
		{
			this ( 
				conceptEvidences, 
				Optional.ofNullable ( conceptEvidences ).map ( List::size ).orElse ( 0 ) 
			);
		}

		@SuppressWarnings ( "unused" )
		private TypeEvidences () {
			// Needed by JSON serialisers
		}
		
		
		/**
		 * Details about the specific evidence concepts.
		 * 
		 */
		@Nonnull
		public List<ConceptEvidence> getConceptEvidences ()
		{
			return Optional.ofNullable ( conceptEvidences )
				.map ( Collections::unmodifiableList )
				.orElse ( List.of () );
		}

		/**
		 * There are cases like publications, where we choose to return fewer {@link #getConceptLabels() evidences}
		 * that they actually exist. In that case, this should contain the actual number of evidences.
		 * 
		 * If not set (using {@link TypeEvidences#TypeEvidences(List) the corresponding constructor}, then
		 * the evidences's size is returned.
		 */
		public int getReportedSize () {
			return reportedSize;
		}
	} // TypeEvidences
	
	/**
	 * The specific evidence concept in the gene table.
	 * 
	 * @see TypeEvidences above.
	 */
	public static class ConceptEvidence
	{
		private String conceptLabel;
		private Integer graphDistance;

		public ConceptEvidence ( String conceptLabel, Integer graphDistance )
		{
			super ();
			this.conceptLabel = conceptLabel;
			this.graphDistance = graphDistance;
		}
		
		@SuppressWarnings ( "unused" )
		private ConceptEvidence () {
			// Needed by JSON serialisers
		}
		
		/**
		 * Something like the shortest name or accession for this concept. This is computed by the
		 * API implementation.
		 */
		public String getConceptLabel ()
		{
			return conceptLabel;
		}

		/**
		 * The shortest topological distance from the gene this concept refers up to this concept, based on
		 * semantic motif traversals. 
		 */
		public Integer getGraphDistance ()
		{
			return graphDistance;
		}
		
	} // ConceptEvidence
	
	/**
	 * This has two possible entries:
	 * 
	 * - the chromosome regions (QTLs) that were reached by the semantic motifs and which 
	 * match the user genes
	 * - plus the user QTLs that match some gene
	 * 
	 * TODO: currently not used, remove?
	 *
	 */
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

	/**
	 * Evidences are reported as conceptType => evidences
	 */
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

