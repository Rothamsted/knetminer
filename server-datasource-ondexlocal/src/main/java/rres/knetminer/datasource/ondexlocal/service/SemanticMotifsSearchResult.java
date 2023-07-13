package rres.knetminer.datasource.ondexlocal.service;

import static java.util.Collections.emptyMap;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import javax.annotation.Nonnull;

import net.sourceforge.ondex.core.ONDEXConcept;

/**
 * The semantic motif search result container.
 * 
 * A Simple record-like class that contains a map of gene -> related concepts plus
 * a map of concept -> significance score (for the search that associated it to one or more of
 * the gene set ).
 * 
 * This has been introduced to cope with methods like {@link SearchService#getScoredGenes(Map, String)} 
 * and other methods that used these two structures separately.
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
	private Map<ONDEXConcept, Double> gene2Score;

	/**
	 * This object is usually created by {@link SearchService#getScoredGenes(Map, String)}
	 * Note that this constructor sets these map components as-is, without changing anything
	 */
	public SemanticMotifsSearchResult ( 
		Map<Integer, Set<Integer>> geneId2RelatedConceptIds, Map<ONDEXConcept, Double> gene2Score
	)
	{
		super ();
		this.geneId2RelatedConceptIds = Optional.ofNullable ( geneId2RelatedConceptIds ).orElse ( emptyMap () );
		this.gene2Score = Optional.ofNullable ( gene2Score ).orElse ( emptyMap () ); 
	}

	/**
	 * @return an immutable version of GeneID -> related semantic motifs, which were associated to genes via
	 * semantic motif search.
	 * 
	 */
	@Nonnull
	public Map<Integer, Set<Integer>> getGeneId2RelatedConceptIds ()
	{
		return geneId2RelatedConceptIds;
	}

	/**
	 * Associate genes to their KnetMiner score, usually sorted by best scores.
	 * @see SearchService#getScoredGenes(Map, String)
	 * 
	 */
	@Nonnull
	public Map<ONDEXConcept, Double> getGene2Score ()
	{
		return gene2Score;
	}
}
