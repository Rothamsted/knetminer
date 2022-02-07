package rres.knetminer.datasource.ondexlocal;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
// import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryparser.classic.ParseException;

import net.sourceforge.ondex.core.ONDEXConcept;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;
import rres.knetminer.datasource.ondexlocal.service.SemanticMotifsSearchResult;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;

/**
 * 
 * TODO: very messy, with computed stuff made stateful fields or viceversa, needs serious review.
 * 
 * @author zorc, pakk, singha
 *
 */
public class Hits
{
	protected final Logger log = LogManager.getLogger ( getClass () );

	private OndexServiceProvider ondexProvider;
	private Map<ONDEXConcept, Float> luceneConcepts; // concept and Lucene score
	private int luceneDocumentsLinked;
	private int numConnectedGenes;
	private SemanticMotifsSearchResult searchResult = null;
	private String keyword = ""; // TODO: not used

	public Hits ( String keyword, OndexServiceProvider ondexProvider, Collection<ONDEXConcept> geneList )
	{
		this.ondexProvider = ondexProvider;
		this.keyword = keyword;
		try
		{
			this.luceneConcepts = ondexProvider.getSearchService ().searchGeneRelatedConcepts ( keyword, geneList, true );
			this.countLinkedGenes ();
		}
		catch ( ParseException ex )
		{
			ExceptionUtils.throwEx ( 
				IllegalArgumentException.class, ex, "Serch for: \"%s\" failed: ", keyword, ex.getMessage ()
			);
		}
	}

	public void countLinkedGenes ()
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

	public Map<ONDEXConcept, Double> getSortedCandidates ()
	{
		return getSearchResult ().getRelatedConcept2Score ();
	}

	public Map<Integer, Set<Integer>> getGeneId2RelatedConceptIds ()
	{
		return getSearchResult ().getGeneId2RelatedConceptIds ();
	}

	public SemanticMotifsSearchResult getSearchResult ()
	{
		// TODO: I hope I got the semantics found in the original code right
		if ( searchResult != null ) return searchResult;
		return searchResult = ondexProvider.getSearchService ().getScoredGenes ( luceneConcepts );
	}
}
