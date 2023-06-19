package rres.knetminer.datasource.api.datamodel;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>19 Jun 2023</dd></dl>
 *
 */
public class GeneTableEntry
{
	public static class TypeEvidences
	{
		private List<String> conceptLabels;
		private Integer reportedSize = 0;
		
		public TypeEvidences ( List<String> conceptLabels, Integer reportedSize )
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

		List<String> getConceptLabels () {
			return conceptLabels;
		}

		int getReportedSize () {
			return reportedSize;
		}
	} // TypeEvidences
	
	public static class QTLEvidence
	{
		private String regionLabel = "", regionTrait = "";

		public QTLEvidence ( String regionLabel, String regionTrait )
		{
			super ();
			this.regionLabel = regionLabel;
			this.regionTrait = regionTrait;
		}

		String getRegionLabel () {
			return regionLabel;
		}

		String getRegionTrait () {
			return regionTrait;
		}	
	} // QTLEvidence
	
	private int ondexId = -1;
	private String accession;
	private String name;
	private String chromosome = "";
	private Integer geneBeginBP;
	private Integer geneEndBP;
	private Double score; 
	private Boolean isUserGene;

	// TODO: sorted?
	private Map<String, TypeEvidences> conceptEvidences;  
	private List<QTLEvidence> qtlEvidences;
	
	public GeneTableEntry ( 
		int ondexId, String accession, String name, 
		String chromosome, Integer geneBeginBP, Integer geneEndBP, 
		Double score, Boolean isUserGene, 
		Map<String, TypeEvidences> conceptEvidences,
		List<QTLEvidence> qtlEvidences )
	{
		super ();
		this.ondexId = ondexId;
		this.accession = accession;
		this.name = name;
		this.chromosome = chromosome;
		this.geneBeginBP = geneBeginBP;
		this.geneEndBP = geneEndBP;
		this.score = score;
		this.isUserGene = isUserGene;
		this.conceptEvidences = Optional.ofNullable ( conceptEvidences ).orElse ( Map.of () );
		this.qtlEvidences = Optional.ofNullable ( qtlEvidences ).orElse ( List.of () );
	}

	int getOndexId ()
	{
		return ondexId;
	}

	String getAccession ()
	{
		return accession;
	}

	String getName ()
	{
		return name;
	}

	String getChromosome ()
	{
		return chromosome;
	}

	Integer getGeneBeginBP ()
	{
		return geneBeginBP;
	}

	Integer getGeneEndBP ()
	{
		return geneEndBP;
	}

	Double getScore ()
	{
		return score;
	}

	Boolean getIsUserGene ()
	{
		return isUserGene;
	}

	Map<String, TypeEvidences> getConceptEvidences ()
	{
		return Collections.unmodifiableMap ( conceptEvidences );
	}

	List<QTLEvidence> getQtlEvidences ()
	{
		return Collections.unmodifiableList ( qtlEvidences );
	}
}

