package rres.knetminer.datasource.ondexlocal;

import static java.util.Collections.unmodifiableMap;
import static java.util.stream.Collectors.toMap;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.core.ONDEXConcept;

/**
 * A Simple record-like class that contains a map of gene -> related concepts plus
 * a map of concept -> significance score (for the search that associated it to one or more of
 * the gene set ).
 * 
 * This has been introduced to cope with methods like {@link OndexServiceProvider#getScoredGenesMap(Map)} and
 * other methods that used these two structures separately.
 * 
 * TODO: Probably to be changed during a more compheensive OSP review. 
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
	 * This object is usually created by {@link OndexServiceProvider#getScoredGenesMap(Map)}
	 * Note that this constructor sets these map components as-is, without changing anything
	 */
	public SemanticMotifsSearchResult ( 
		Map<Integer, Set<Integer>> geneId2RelatedConceptIds, Map<ONDEXConcept, Double> relatedConcept2Score
	)
	{
		super ();
		this.geneId2RelatedConceptIds = unmodifiableMap ( geneId2RelatedConceptIds );
		this.relatedConcept2Score = unmodifiableMap ( relatedConcept2Score ); 
	}

	/**
	 * @return an immutable version of GeneID -> related semantic motifs, which were associated to genes via
	 * semantic motif search.
	 * 
	 */
	Map<Integer, Set<Integer>> getGeneId2RelatedConceptIds ()
	{
		return geneId2RelatedConceptIds;
	}

	/**
	 * Returns an immutable list of concepts related to genes in {@link #getGeneId2RelatedConceptIds()}, usually sorted by
	 * best scores.
	 * 
	 */
	Map<ONDEXConcept, Double> getRelatedConcept2Score ()
	{
		return relatedConcept2Score;
	}
}
