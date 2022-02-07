package rres.knetminer.datasource.ondexlocal.service;

import java.util.Map;
import java.util.Set;

import net.sourceforge.ondex.core.ONDEXConcept;

/**
 * The semantic motif search result container.
 * 
 * A Simple record-like class that contains a map of gene -> related concepts plus
 * a map of concept -> significance score (for the search that associated it to one or more of
 * the gene set ).
 * 
 * This has been introduced to cope with methods like {@link SearchService#getScoredGenes(Map)} and
 * other methods that used these two structures separately.
 * 
 * TODO: the returned maps aren't immutable, we need to review things around and then protect them.
 * 
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>2 Sep 2020</dd></dl>
 *
 */
public class SemanticMotifsSearchResult
{
	private Map<Integer, Set<Integer>> geneId2RelatedConceptIds;
	private Map<ONDEXConcept, Double> relatedConcept2Score;

	/**
	 * This object is usually created by {@link SearchService#getScoredGenes(Map)}
	 * Note that this constructor sets these map components as-is, without changing anything
	 */
	public SemanticMotifsSearchResult ( 
		Map<Integer, Set<Integer>> geneId2RelatedConceptIds, Map<ONDEXConcept, Double> relatedConcept2Score
	)
	{
		super ();
		this.geneId2RelatedConceptIds = geneId2RelatedConceptIds;
		this.relatedConcept2Score = relatedConcept2Score; 
	}

	/**
	 * @return an immutable version of GeneID -> related semantic motifs, which were associated to genes via
	 * semantic motif search.
	 * 
	 */
	public Map<Integer, Set<Integer>> getGeneId2RelatedConceptIds ()
	{
		return geneId2RelatedConceptIds;
	}

	/**
	 * Returns an immutable list of concepts related to genes in {@link #getGeneId2RelatedConceptIds()}, usually sorted by
	 * best scores.
	 * 
	 */
	public Map<ONDEXConcept, Double> getRelatedConcept2Score ()
	{
		return relatedConcept2Score;
	}
}
