package rres.knetminer.datasource.ondexlocal;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.core.ONDEXConcept;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;
import rres.knetminer.datasource.ondexlocal.service.SemanticMotifsSearchResult;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;

/**
 * 
 * TODO: very messy, with computed stuff made stateful fields or viceversa, needs serious review.
 * 
 * Used to be named Hits.
 * 
 * @author zorc, pakk, singha
 *
 */
public class SemanticMotifSearchMgr
{
	protected final Logger log = LogManager.getLogger ( getClass () );

	private OndexServiceProvider ondexProvider;
	private Map<ONDEXConcept, Float> luceneConcepts; // concept and Lucene score
	private int luceneDocumentsLinked;
	private int numConnectedGenes;
	private SemanticMotifsSearchResult searchResult = null;
	private String taxId;

	public SemanticMotifSearchMgr ( String keyword, OndexServiceProvider ondexProvider, Collection<ONDEXConcept> geneList, String taxId )
	{
		this.ondexProvider = ondexProvider;
		this.taxId = taxId;
		try
		{
			this.luceneConcepts = ondexProvider.getSearchService ().searchGeneRelatedConcepts ( keyword, geneList, true );
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
		Set<ONDEXConcept> luceneConceptsSet = luceneConcepts.keySet ();
		log.info ( 
			"Counting unique genes for {} matching Lucene concept(s)", luceneConceptsSet.size () 
		);

		Map<Integer, Set<Integer>> concept2Genes = ondexProvider.getSemanticMotifDataService ().getConcepts2Genes ();
		
		long linkedConceptsSize = luceneConceptsSet.parallelStream ()
			.map ( ONDEXConcept::getId )
			.filter ( concept2Genes::containsKey )
			.count ();
		
		long uniqGenesSize = luceneConceptsSet.parallelStream ()
		.map ( ONDEXConcept::getId )
		.filter ( concept2Genes::containsKey )
		.flatMap ( luceneConceptId -> concept2Genes.get ( luceneConceptId ).parallelStream () )
		.distinct ()
		.count ();

		log.info ( "Matching {} unique gene(s): ", uniqGenesSize );
		this.numConnectedGenes = (int) uniqGenesSize;
		this.luceneDocumentsLinked = (int) linkedConceptsSize;
	}

	public int getLuceneDocumentsLinked ()
	{
		return luceneDocumentsLinked;
	}

	public int getNumConnectedGenes ()
	{
		return numConnectedGenes;
	}

	public Map<ONDEXConcept, Float> getLuceneConcepts ()
	{
		return this.luceneConcepts;
	}

	public Map<ONDEXConcept, Double> getSortedGeneCandidates ()
	{
		return getSearchResult ().getGene2Score ();
	}

	public Map<Integer, Set<Integer>> getGeneId2RelatedConceptIds ()
	{
		return getSearchResult ().getGeneId2RelatedConceptIds ();
	}

	public SemanticMotifsSearchResult getSearchResult ()
	{
		if ( searchResult != null ) return searchResult;
		return searchResult = ondexProvider.getSearchService ().getScoredGenes ( luceneConcepts );
	}
}
