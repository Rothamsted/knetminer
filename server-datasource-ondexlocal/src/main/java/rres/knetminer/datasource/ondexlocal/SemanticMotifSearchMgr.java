package rres.knetminer.datasource.ondexlocal;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.core.ONDEXConcept;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;
import rres.knetminer.datasource.ondexlocal.service.SearchService;
import rres.knetminer.datasource.ondexlocal.service.SemanticMotifsSearchResult;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.rothamsted.knetminer.backend.graph.utils.GeneHelper;
import uk.ac.rothamsted.knetminer.service.KnetMinerInitializer;

/**
 * An helper to post-process results from {@link SearchService#searchGeneRelatedConcepts(String, Collection, boolean)}
 * and keep the results together with summary data like counts. 
 * 
 * TODO: very messy, with computed stuff made stateful fields or vice versa, needs serious review.
 * 
 * Used to be named Hits.
 * 
 * @author zorc, pakk, singha
 * @author Marco Brandizi
 *
 */
public class SemanticMotifSearchMgr
{
	protected final Logger log = LogManager.getLogger ( getClass () );

	private OndexServiceProvider ondexProvider;
	private Map<ONDEXConcept, Float> scoredConcepts; // concept and Lucene score
	private int scoredConceptsCount;
	private int linkedGenesCount;
	private SemanticMotifsSearchResult searchResult = null;
	private String taxId;

	public SemanticMotifSearchMgr ( String keyword, OndexServiceProvider ondexProvider, Collection<ONDEXConcept> geneList, String taxId )
	{
		this.ondexProvider = ondexProvider;
		this.taxId = StringUtils.trimToNull ( taxId );
		if ( geneList == null ) geneList = List.of ();

		log.info ( 
			"Initalising search for \"{}\", {} gene(s) and taxId: {}",
			keyword, geneList.size (), this.taxId 
		);
		
		try
		{
			this.scoredConcepts = ondexProvider.getSearchService ().searchGeneRelatedConcepts ( keyword, geneList, true );
			this.countLinkedGenes ();
		}
		catch ( Exception ex )
		{
			Class<? extends RuntimeException> wrapperType = ex instanceof IllegalArgumentException 
				?  IllegalArgumentException.class : RuntimeException.class;
			
			ExceptionUtils.throwEx ( 
				wrapperType, ex, "Serch for: \"%s\" failed: %s", keyword, ex.getMessage ()
			);
		}
	}

	private void countLinkedGenes ()
	{
		Set<ONDEXConcept> matchedConceptsSet = scoredConcepts.keySet ();
		
		log.info ( 
			"Counting unique genes for {} Lucene concept(s) matching the keyword input", matchedConceptsSet.size () 
		);

		var graph = this.ondexProvider.getDataService ().getGraph ();
		
		Map<Integer, Set<Integer>> concept2Genes = this.ondexProvider
			.getKnetInitializer ()
			.getConcepts2Genes ();
		
		this.scoredConceptsCount = (int) matchedConceptsSet.parallelStream ()
			.map ( ONDEXConcept::getId )
			.filter ( concept2Genes::containsKey )
			.count ();
		log.info ( "Matching {} unique concept(s)", scoredConceptsCount );
		
		Stream<Integer> genesStrm = matchedConceptsSet.parallelStream ()
			.map ( ONDEXConcept::getId )
			.filter ( concept2Genes::containsKey )
			.flatMap ( luceneConceptId -> concept2Genes.get ( luceneConceptId ).parallelStream () )
			.distinct ();
		
		if ( this.taxId != null )
			genesStrm = genesStrm.filter ( geneId -> taxId.equals ( new GeneHelper ( graph, geneId ).getTaxID () ) );
		
		this.linkedGenesCount = (int) genesStrm.count ();
		log.info ( "Matching {} unique gene(s)", linkedGenesCount );
	}

	/**
	 * Number of distinct concepts that match the search keywords and have some semantic motif-linked genes.
	 * 
	 * This is computed by matching {@link #getScoredConcepts()} to {@link KnetMinerInitializer#getConcepts2Genes()}.
	 */
	public int getScoredConceptsCount ()
	{
		return scoredConceptsCount;
	}

	/**
	 * Count of distinct genes that could be found from the keyword-matched concepts, using 
	 * semantic motif paths.
	 * 
	 * This is computed going from {@link #getScoredConcepts()} to {@link KnetMinerInitializer#getConcepts2Genes()}
	 * and counting all genes that lead to each matched concept.
	 */
	public int getLinkedGenesCount ()
	{
		return linkedGenesCount;
	}

	/**
	 * The set of keyword-matched concepts, along with their relevance scores (based on Lucene).
	 */
	public Map<ONDEXConcept, Float> getScoredConcepts ()
	{
		return this.scoredConcepts;
	}

	/**
	 * A wrapper of {@link SemanticMotifsSearchResult#getGene2Score()}, using {@link #getSearchResult()}.
	 * 
	 * In other words, these are the genes that lead to keyword-matched concepts. 
	 */
	public Map<ONDEXConcept, Double> getSortedGeneCandidates ()
	{
		return getSearchResult ().getGene2Score ();
	}

	/**
	 * A wrapper of {@link SemanticMotifsSearchResult#getGeneId2RelatedConceptIds()}.
	 * 
	 * That is, for each gene that lead to some of the keyword-matched concepts (via sem motifs), returns all the 
	 * reached concepts. 
	 */
	public Map<Integer, Set<Integer>> getGeneId2RelatedConceptIds ()
	{
		return getSearchResult ().getGeneId2RelatedConceptIds ();
	}

	/**
	 * A cached wrapper of {@link SearchService#getScoredGenes(Map, String)}, based on the parameters
	 * {@link #getScoredConcepts()} and {@link #getTaxId()}.
	 * 
	 * That is: the genes that are linked to 
	 * keywords-related entities, via semantic motifs.
	 * 
	 */
	public SemanticMotifsSearchResult getSearchResult ()
	{
		if ( searchResult != null ) return searchResult;
		return searchResult = ondexProvider.getSearchService ().getScoredGenes ( scoredConcepts, this.taxId );
	}

	/**
	 * The specific taxonomy ID used for this search.
	 */
	public String getTaxId ()
	{
		return taxId;
	}

}
